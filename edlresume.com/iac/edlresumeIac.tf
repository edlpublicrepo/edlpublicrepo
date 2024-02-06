provider "aws" {
  region = "us-east-2"
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "edlresume.com"
    key    = "state/terraform.tfstate"
    region = "us-east-2"
  }
}


# ///////////// AWS Account Info /////////////
# data "aws_caller_identity" "current" {}

# locals {
#   account_id = data.aws_caller_identity.current.account_id
# }


///////////// CloudFront /////////////

///////////// ACM /////////////

///////////// Route53 /////////////

///////////// WAF V2 /////////////

///////////// API Gateway /////////////
