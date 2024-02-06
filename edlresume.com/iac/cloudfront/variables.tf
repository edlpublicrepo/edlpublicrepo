variable "bucket_name" {
 type = string
 default = "edlresume.com"
 description = "The name of the bucket that is also the name of the website"
}

variable "domain_name" {
 type = string
 default = "edlresume.com"
 description = "The name of the website"
}

variable "aws_region" {
 type = string
 default = "us-east-2"
 description = "The default region"
}
