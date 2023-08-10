import * as cdk from "aws-cdk-lib";
import * as lambdaGo from "@aws-cdk/aws-lambda-go-alpha";
import { Construct } from "constructs";

export class GracefulShutdownLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cwInsightsX86Extension =
      cdk.aws_lambda.LayerVersion.fromLayerVersionArn(
        this,
        "CwInsightsX86Extension",
        "arn:aws:lambda:eu-west-1:580247275435:layer:LambdaInsightsExtension:38"
      );

    const cwInsightsArmExtension =
      cdk.aws_lambda.LayerVersion.fromLayerVersionArn(
        this,
        "CwInsightsArmExtension",
        "arn:aws:lambda:eu-west-1:580247275435:layer:LambdaInsightsExtension-Arm64:5"
      );

    const nodeHandler = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "NodeHandler",
      {
        handler: "handler",
        entry: "lib/node/handler.ts",
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        layers: [cwInsightsX86Extension]
      }
    );
    const nodeFunctionUrl = nodeHandler.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      invokeMode: cdk.aws_lambda.InvokeMode.BUFFERED
    });
    new cdk.CfnOutput(this, "NodeFunctionUrl", {
      value: nodeFunctionUrl.url
    });

    const goHandler = new lambdaGo.GoFunction(this, "GoHandler", {
      entry: "lib/go",
      runtime: cdk.aws_lambda.Runtime.PROVIDED_AL2,
      layers: [cwInsightsX86Extension]
    });
    const goFunctionUrl = goHandler.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      invokeMode: cdk.aws_lambda.InvokeMode.BUFFERED
    });
    new cdk.CfnOutput(this, "GoFunctionUrl", {
      value: goFunctionUrl.url
    });

    const rustHandler = new cdk.aws_lambda.Function(this, "RustHandler", {
      code: cdk.aws_lambda.Code.fromAsset("lib/rust/target/lambda/rust"),
      runtime: cdk.aws_lambda.Runtime.PROVIDED_AL2,
      handler: "does_not_matter",
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      layers: [cwInsightsArmExtension]
    });
    const rustFunctionUrl = rustHandler.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      invokeMode: cdk.aws_lambda.InvokeMode.BUFFERED
    });
    new cdk.CfnOutput(this, "RustFunctionUrl", {
      value: rustFunctionUrl.url
    });
  }
}
