#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GracefulShutdownLambdaStack } from "../lib/graceful-shutdown-lambda-stack";

const app = new cdk.App();
new GracefulShutdownLambdaStack(app, "GracefulShutdownLambdaStack", {
  synthesizer: new cdk.DefaultStackSynthesizer({
    qualifier: "shutdown"
  })
});
