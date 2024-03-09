///////////// Lambda /////////////
resource "aws_iam_role" "main_role" {
  name               = "${var.main_function_name}_lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.main_policy_document.json

  tags = {
    "AppName" = var.domain_name
  }
}

data "aws_iam_policy_document" "main_policy_document" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "main_policy" {
  name        = "lambda_cloudwatch_${var.main_function_name}_policy"
  description = "IAM policy for logging and Cost Explorer access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = var.lambda_policy_actions,
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow",
        Action = [
          "cloudwatch:GetMetricStatistics"
        ],
        Resource = "*"
      }
    ]
  })
  tags = {
    "AppName" = var.domain_name
  }
}

resource "aws_iam_role_policy_attachment" "main_policy_attachment" {
  role       = aws_iam_role.main_role.name
  policy_arn = aws_iam_policy.main_policy.arn
}

data "archive_file" "main" {
  type        = "zip"
  source_file = "${var.main_function_name}.py"
  output_path = "${var.main_function_name}.zip"
}

resource "aws_lambda_function" "main_lambda" {
  filename      = "${var.main_function_name}.zip"
  function_name = "${var.main_function_name}"
  publish       = true
  role          = aws_iam_role.main_role.arn
  handler       = "${var.main_function_name}.lambda_handler"
  timeout       = 10

  source_code_hash = data.archive_file.main.output_base64sha256

  runtime = var.lambda_runtime

  tags = {
    "AppName" = var.domain_name
  }
}

output "main_lambda_arn" {
  value = aws_lambda_function.main_lambda.arn
}
output "main_lambda_invoke_arn" {
  value = aws_lambda_function.main_lambda.invoke_arn
}
output "main_lambda_function_name" {
  value = aws_lambda_function.main_lambda.function_name
}
