provider "aws" {
  region = "us-east-2"
}

terraform {
  backend "s3" {
    bucket = "edlresume.com-state"
    key    = "secretsmanager/terraform.tfstate"
    region = "us-east-2"
  }
}

