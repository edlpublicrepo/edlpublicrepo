///////////// Lambda /////////////
resource "aws_iam_role" "website_traffic_role" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.website_traffic_policy_document.json

  tags = {
    "AppName" = var.domain_name
  }
}

data "aws_iam_policy_document" "website_traffic_policy_document" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "website_traffic_policy" {
  name        = "lambda_cloudwatch_website_traffic_policy"
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

resource "aws_iam_role_policy_attachment" "website_traffic_policy_attachment" {
  role       = aws_iam_role.website_traffic_role.name
  policy_arn = aws_iam_policy.website_traffic_policy.arn
}

data "archive_file" "website_traffic" {
  type        = "zip"
  source_file = "websiteTraffic.py"
  output_path = "websiteTraffic.zip"
}

resource "aws_lambda_function" "website_traffic_lambda" {
  filename      = "websiteTraffic.zip"
  function_name = "websiteTraffic"
  publish       = true
  role          = aws_iam_role.website_traffic_role.arn
  handler       = "websiteTraffic.lambda_handler"
  timeout       = 10

  source_code_hash = data.archive_file.website_traffic.output_base64sha256

  runtime = "python3.12"

  tags = {
    "AppName" = var.domain_name
  }
}

output "lambda_arn" {
  value = aws_lambda_function.website_traffic_lambda.arn
}
output "lambda_invoke_arn" {
  value = aws_lambda_function.website_traffic_lambda.invoke_arn
}
output "lambda_function_name" {
  value = aws_lambda_function.website_traffic_lambda.function_name
}
