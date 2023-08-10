import { APIGatewayProxyEventV2 } from "aws-lambda";

/**
 * The AWS Lambda URLs send the v2 payload to the handler.
 */
export const handler = async (_: APIGatewayProxyEventV2) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello world!"
    })
  };
};

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received", "I would close any connections now");
});
