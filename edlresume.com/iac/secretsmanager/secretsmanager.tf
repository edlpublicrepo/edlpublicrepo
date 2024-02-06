resource "aws_secretsmanager_secret" "example" {
  name = "websiteCost"
  tags = {
    AppName = var.domain_name
  }
}