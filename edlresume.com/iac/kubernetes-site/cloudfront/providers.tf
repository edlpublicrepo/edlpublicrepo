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
    key    = "k8s/cloudfront/terraform.tfstate"
    region = "us-east-2"
  }
}

# /// Data needed for this folder's resources
# data "terraform_remote_state" "wafv2_arn" {
#   backend = "s3"
#   config = {
#     bucket = "edlresume.com-state"
#     key    = "wafv2/terraform.tfstate"
#     region = "us-east-2"
#   }
# }


