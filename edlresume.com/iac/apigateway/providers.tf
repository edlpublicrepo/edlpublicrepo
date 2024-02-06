provider "aws" {
  region = "us-east-2"
}

terraform {
  backend "s3" {
    bucket = "edlresume.com-state"
    key    = "apigateway/terraform.tfstate"
    region = "us-east-2"
  }
}

/// Data needed for this folder's resources
data "terraform_remote_state" "lambda" {
  backend = "s3"
  config = {
    bucket = "edlresume.com-state"
    key    = "lambda/terraform.tfstate"
    region = "us-east-2"
  }
}
