///////////// Lambda /////////////
resource "aws_iam_role" "cost_explorer_role" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.cost_explorer_policy_document.json

  # assume_role_policy = jsonencode({
  #   Version = "2012-10-17",
  #   Statement = [{
  #     Action = "sts:AssumeRole",
  #     Effect = "Allow",
  #     Principal = {
  #       Service = "lambda.amazonaws.com"
  #     },
  #   }]
  # })
  tags = {
    "AppName" = var.domain_name
  }
}

data "aws_iam_policy_document" "cost_explorer_policy_document" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "cost_explorer_policy" {
  name        = "lambda_cloudwatch_cost_explorer_policy"
  description = "IAM policy for logging and Cost Explorer access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow",
        Action = [
          "ce:GetCostAndUsage"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:UpdateSecret"
        ],
        Resource = "arn:aws:secretsmanager:us-east-2:246363045090:secret:websiteCost*"
      }
    ]
  })
  tags = {
    "AppName" = var.domain_name
  }
}

resource "aws_iam_role_policy_attachment" "cost_explorer_policy_attachment" {
  role       = aws_iam_role.cost_explorer_role.name
  policy_arn = aws_iam_policy.cost_explorer_policy.arn
}

data "archive_file" "cost_explorer" {
  type        = "zip"
  source_file = "costExplorer.py"
  output_path = "costExplorer.zip"
}

resource "aws_lambda_function" "cost_explorer_lambda" {
  filename      = "costExplorer.zip"
  function_name = "costExplorer"
  publish       = true
  role          = aws_iam_role.cost_explorer_role.arn
  handler       = "costExplorer.lambda_handler"
  timeout       = 10

  source_code_hash = data.archive_file.cost_explorer.output_base64sha256

  runtime = "python3.12"

  tags = {
    "AppName" = var.domain_name
  }
}

output "lambda_arn" {
  value = aws_lambda_function.cost_explorer_lambda.arn
}
output "lambda_invoke_arn" {
  value = aws_lambda_function.cost_explorer_lambda.invoke_arn
}
output "lambda_function_name" {
  value = aws_lambda_function.cost_explorer_lambda.function_name
}
