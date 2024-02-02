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
  bucket        = "edlresume.com"
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
//   bucket = "edlresume.com"
//   id     = "edlresume.com"

//   access_control_policy {
//       grant {
//           permission = "FULL_CONTROL"

//           grantee {
//               id   = "1ee44cf54ea952c291d1343afe166f747c5757dd3f633a0d594031224f962f9a"
//               type = "CanonicalUser"
//                 }
//             }
//       owner {
//           id = "1ee44cf54ea952c291d1343afe166f747c5757dd3f633a0d594031224f962f9a"
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
  web_acl_id          = aws_wafv2_web_acl.cloudfront.arn
  enabled             = true
  is_ipv6_enabled     = false
  default_root_object = "index.html"

  aliases = ["edlresume.com"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.main_bucket.bucket_regional_domain_name
    compress         = true
    # AWS Managed Caching Policy
    cache_policy_id          = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    origin_request_policy_id = "acba4595-bd28-49b8-b9fe-13317c0390fa"


    # forwarded_values {
    #   query_string = false

    #   cookies {
    #     forward = "none"
    #   }
    # }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  # Cache behavior with precedence 0
  ordered_cache_behavior {
    path_pattern     = "/assets/extra/thisIsMyDevEnv/*.html"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.main_bucket.bucket_regional_domain_name

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
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
    cloudfront_default_certificate = false
    acm_certificate_arn            = aws_acm_certificate.cert.arn
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }
}

///////////// ACM /////////////
resource "aws_acm_certificate" "cert" {
  provider          = aws.us-east-1
  domain_name       = "edlresume.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

///////////// Route53 /////////////
resource "aws_route53_zone" "primary" {
  comment = "Managed by Terraform"
  name    = "edlresume.com"
}

resource "aws_route53_record" "primary" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "edlresume.com"
  type    = "A"
  alias {
      evaluate_target_health = false
      name                   = aws_cloudfront_distribution.s3_distribution.domain_name
      zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
        }
}

///////////// WAF V2 /////////////
resource "aws_wafv2_web_acl" "cloudfront" {
  provider = aws.us-east-1
  name     = "CreatedByCloudFront-4df053e8-948e-4d16-9e3e-927491b62239"
  scope    = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "AWS-AWSManagedRulesAmazonIpReputationList"
    priority = 0

    override_action {
      count {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesAmazonIpReputationList"
      sampled_requests_enabled   = true
    }
  }
  rule {
    name     = "AWS-AWSManagedRulesBotControlRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesBotControlRuleSet"
        vendor_name = "AWS"

        managed_rule_group_configs {
          aws_managed_rules_bot_control_rule_set {
            inspection_level = "COMMON"
          }
        }

        rule_action_override {
          name = "CategoryAdvertising"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryArchiver"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryContentFetcher"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryEmailClient"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryHttpLibrary"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryLinkChecker"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryMiscellaneous"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryMonitoring"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryScrapingFramework"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategorySearchEngine"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategorySecurity"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategorySeo"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategorySocialMedia"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "CategoryAI"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "SignalAutomatedBrowser"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "SignalKnownBotDataCenter"

          action_to_use {
            count {
            }
          }
        }
        rule_action_override {
          name = "SignalNonBrowserUserAgent"

          action_to_use {
            count {
            }
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesBotControlRuleSet"
      sampled_requests_enabled   = true
    }
  }
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      count {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }
  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      count {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
      sampled_requests_enabled   = true
    }
  }


  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "CreatedByCloudFront-4df053e8-948e-4d16-9e3e-927491b62239"
    sampled_requests_enabled   = true
  }
}
