resource "aws_iam_role" "cost_explorer_api_role" {
  name = "api_gateway_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "apigateway.amazonaws.com"
      },
    }]
  })
  tags = {
    "AppName" = var.domain_name
  }
}

resource "aws_iam_policy" "cost_explorer_api_policy" {
  name        = "lambda_cloudwatch_cost_explorer_api_policy"
  description = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_arn

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "lambda:InvokeFunction"
        ],
        Resource = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_arn
      }
    ]
  })
  tags = {
    "AppName" = var.domain_name
  }
}

resource "aws_iam_role_policy_attachment" "cost_explorer_api_policy_attachment" {
  role       = aws_iam_role.cost_explorer_api_role.name
  policy_arn = aws_iam_policy.cost_explorer_api_policy.arn
}

resource "aws_api_gateway_rest_api" "cost_explorer" {
  name = "cost_explorer"
}

resource "aws_api_gateway_resource" "cost_explorer_proxy" {
  rest_api_id = aws_api_gateway_rest_api.cost_explorer.id
  parent_id   = aws_api_gateway_rest_api.cost_explorer.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "cost_explorer_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.cost_explorer.id
  resource_id   = aws_api_gateway_resource.cost_explorer_proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.cost_explorer.id
  resource_id = aws_api_gateway_method.cost_explorer_proxy.resource_id
  http_method = aws_api_gateway_method.cost_explorer_proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_invoke_arn
}

resource "aws_api_gateway_method" "cost_explorer_proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.cost_explorer.id
  resource_id   = aws_api_gateway_rest_api.cost_explorer.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.cost_explorer.id
  resource_id = aws_api_gateway_method.cost_explorer_proxy_root.resource_id
  http_method = aws_api_gateway_method.cost_explorer_proxy_root.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_invoke_arn
}


resource "aws_api_gateway_deployment" "cost_explorer" {
  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.lambda_root,
  ]

  rest_api_id = aws_api_gateway_rest_api.cost_explorer.id
  stage_name  = "test"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/* portion grants access from any method on any resource
  # within the API Gateway "REST API".
  source_arn = "${aws_api_gateway_rest_api.cost_explorer.execution_arn}/*/*"
}
# resource "aws_api_gateway_stage" "cost_explorer" {
#   deployment_id = aws_api_gateway_deployment.cost_explorer.id
#   rest_api_id   = aws_api_gateway_rest_api.cost_explorer.id
#   stage_name    = "cost_explorer"
# }


output "base_url" {
  value = aws_api_gateway_deployment.cost_explorer.invoke_url
}