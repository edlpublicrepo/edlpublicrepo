provider "aws" {
  region = "us-east-2"
}

terraform {
  backend "s3" {
    bucket = "edlresume.com-state"
    key    = "ec2/terraform.tfstate"
    region = "us-east-2"
  }
}

/// Data needed for this folder's resources
data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "edlresume.com-state"
    key    = "vpc/terraform.tfstate"
    region = "us-east-2"
  }
}

# data "aws_ami" "amzn2" {
#   owners      = ["amazon"]
#   most_recent = true

#   filter {
#     name   = "name"
#     values = ["amzn2-ami-hvm-*-x86_64-ebs"]
#   }
# }