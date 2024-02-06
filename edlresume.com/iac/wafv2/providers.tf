provider "aws" {
  region = var.aws_region
}
provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "edlresume.com-state"
    key    = "wafv2/terraform.tfstate"
    region = "us-east-2"
  }
}
