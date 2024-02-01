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


///////////// AWS Account Info /////////////
data "aws_caller_identity" "current" {}

locals {
    account_id = data.aws_caller_identity.current.account_id
}

///////////// Main bucket /////////////
resource "aws_s3_bucket" "main_bucket" {
  bucket = "edlresume.com"
  force_destroy = false
}
// resource "aws_s3_bucket_acl" "main_bucket" {
//   bucket = "aws_s3_bucket.main_bucket.id"
//   acl    = "private"
// }

resource "aws_s3_bucket_policy" "cloudfront_access" {
  bucket = aws_s3_bucket.main_bucket.id
  policy = data.aws_iam_policy_document.cloudfront_access.json
}

data "aws_iam_policy_document" "cloudfront_access" {
  policy_id = "PolicyForCloudFrontPrivateContent"
  statement {
    sid = "AllowCloudFrontServicePrincipal"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.main_bucket.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        aws_cloudfront_distribution.s3_distribution.arn
      ]
    }
  }
}

///////////////////// Changed
// {
//     "Version": "2008-10-17",
//     "Id": "PolicyForCloudFrontPrivateContent",
//     "Statement": [
//         {
//             "Sid": "AllowCloudFrontServicePrincipal",
//             "Effect": "Allow",
//             "Principal": {
//                 "Service": "cloudfront.amazonaws.com"
//             },
//             "Action": "s3:GetObject",
//             "Resource": "arn:aws:s3:::edlresume.com/*",
//             "Condition": {
//                 "StringEquals": {
//                     "AWS:SourceArn": "arn:aws:cloudfront::246363045090:distribution/E3R8JRJMF9MBYL"
//                 }
//             }
//         }
//     ]
// }


//////////////////// Deleted
//   # aws_s3_bucket_acl.main_bucket will be destroyed
//   # (because aws_s3_bucket_acl.main_bucket is not in configuration)
//   - resource "aws_s3_bucket_acl" "main_bucket" {
//       - bucket = "edlresume.com" -> null
//       - id     = "edlresume.com" -> null

//       - access_control_policy {
//           - grant {
//               - permission = "FULL_CONTROL" -> null

//               - grantee {
//                   - id   = "1ee44cf54ea952c291d1343afe166f747c5757dd3f633a0d594031224f962f9a" -> null
//                   - type = "CanonicalUser" -> null
//                 }
//             }
//           - owner {
//               - id = "1ee44cf54ea952c291d1343afe166f747c5757dd3f633a0d594031224f962f9a" -> null
//             }
//         }
//     }



resource "aws_s3_bucket_logging" "main_bucket_logging" {
  bucket = aws_s3_bucket.main_bucket.id

  target_bucket = aws_s3_bucket.log_bucket.id
  target_prefix = ""
  target_object_key_format {
    simple_prefix {}
  }
}

///////////// Log bucket /////////////
resource "aws_s3_bucket" "log_bucket" {
  bucket = "edlresume.com-logs"
}

resource "aws_s3_bucket_acl" "log_bucket_acl" {
  bucket = aws_s3_bucket.log_bucket.id
  acl    = "log-delivery-write"
}

resource "aws_s3_bucket_policy" "allow_logging" {
  bucket = aws_s3_bucket.log_bucket.id
  policy = data.aws_iam_policy_document.allow_logging.json
}

data "aws_iam_policy_document" "allow_logging" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["logging.s3.amazonaws.com"]
    }

    actions = [
      "s3:PutObject"
    ]

    resources = [
      "${aws_s3_bucket.log_bucket.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"

      values = [
        local.account_id
      ]
    }
  }
}
// {
//     "Version": "2012-10-17",
//     "Statement": [
//         {
//             "Effect": "Allow",
//             "Principal": {
//                 "Service": "logging.s3.amazonaws.com"
//             },
//             "Action": "s3:PutObject",
//             "Resource": "arn:aws:s3:::edlresume.com-logs/*",
//             "Condition": {
//                 "StringEquals": {
//                     "aws:SourceAccount": "246363045090"
//                 }
//             }
//         }
//     ]
// }



///////////// CloudFront /////////////
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "edlresume.com"
  description                       = "OAC for edlresume.com"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
    origin {
        connection_attempts      = 3
        connection_timeout       = 10
        domain_name              = "edlresume.com.s3.us-east-2.amazonaws.com"
        origin_access_control_id = "E1NZV69S1GSKS3"
        origin_id                = "edlresume.com.s3.us-east-2.amazonaws.com"
        origin_shield {
            enabled              = true
            origin_shield_region = "us-west-2"
        }
    }

  enabled             = true
  is_ipv6_enabled     = false
  default_root_object = "index.html"
  
  aliases = ["edlresume.com"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-MyBucketOriginID"
    compress                 = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

    logging_config {
        bucket          = aws_s3_bucket.log_bucket.bucket_domain_name
        include_cookies = false
        prefix          = "cloudfront/"
    }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

///////////// ACM /////////////
resource "aws_acm_certificate" "cert" {
  provider = aws.us-east-1
  domain_name       = "edlresume.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

///////////// Route53 /////////////
