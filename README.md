# Graceful shutdown in AWS Lambda function

Based on [this GitHub repository](https://github.com/aws-samples/graceful-shutdown-with-aws-lambda)

## To run

1. `pnpm install`
2. `cd lib/rust`
3. `cargo lambda build --release --arm64`
4. `cd ..`
5. `pnpm run boostrap`,
6. `pnpm run deploy`

## About

Historically, it was pretty hard to manage long-lived connections in AWS Lambda Functions. While you could initialize the connection to a Redis/SQL database, you might encounter some problems when the AWS Lambda container is shut down. When the AWS Lambda execution environment shuts down, all the outgoing connections are frozen.

Usually, clients that operate with long-lived connections have the necessary code to close those "frozen" connections due to timeout. But sometimes, after your AWS Lambda Functions runs again, you might see some error / warning logs or timeouts trying to establish connection again.

Now, using AWS Lambda Extensions, we can tap into the `SIGTERM` signal to know when the AWS Lambda execution environment is about to shut down. This is great news, as it allows us to cleanly discard any long-lived connections and "exit" the function in a clean slate.

### The role of AWS Lambda Extensions

**As I understand it, for the `SIGTERM` signal to fire, one has to have an AWS Lambda Extension attached to the function**.

> For a function with registered external extensions, Lambda supports graceful shutdown. When Lambda service is about to shut down the runtime, it sends a SIGTERM signal to the runtime and then a SHUTDOWN event to each registered external extension. Developers can catch the SIGTERM signal in their lambda functions and clean up resources.

My guess is that, without AWS Lambda Extensions, the AWS Lambda service will not bother to notify us when the container is about to be shut down. Why do that, if, in theory, none of the handler code depends on that?

## Where would I use this?

Anywhere where you are dealing with a long-lived connection. A few ideas that come to my mind:

- Feature Flags via LaunchDarkly.
- Redis connections.
- SQL connections.

I wish I knew about this technique while working with LaunchDarkly. It would save me and my team a lot of time.

## Gotchas

I'm far from being an expert in this topic. Frankly I'm reading some documentation as I write this, but from my initial research, it appears that this is NOT a silver bullet, especially for sending logs (but I'm yet to find complains about the use-case I'm more interested in – closing long-lived connections).

Here are a couple of resources that I stumbled upon while researching this topic:

- <https://github.com/open-telemetry/opentelemetry-lambda/blob/main/docs/design_proposal.md#2-technical-challenges>
- <https://github.com/aws/aws-lambda-go/issues/318>
