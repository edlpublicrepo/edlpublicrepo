resource "aws_cloudfront_origin_access_control" "main" {
  name                              = var.bucket_name
  description                       = "OAC for ${var.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    connection_attempts      = 3
    connection_timeout       = 10
    domain_name              = "${var.bucket_name}.s3.${var.aws_region}.amazonaws.com"
    origin_access_control_id = "E1NZV69S1GSKS3"
    origin_id                = "${var.bucket_name}.s3.${var.aws_region}.amazonaws.com"
    origin_shield {
      enabled              = true
      origin_shield_region = "us-west-2"
    }
  }
  web_acl_id          = data.terraform_remote_state.wafv2_arn.outputs.aws_wafv2_web_acl_arn
  enabled             = true
  is_ipv6_enabled     = false
  default_root_object = "index.html"

  aliases = [var.bucket_name]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${var.bucket_name}.s3.${var.aws_region}.amazonaws.com"
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
    target_origin_id = "${var.bucket_name}.s3.${var.aws_region}.amazonaws.com"

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
    bucket          = "${var.bucket_name}-logs.s3.amazonaws.com"
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
  tags = {
    "AppName" = var.bucket_name
  }
}

resource "aws_acm_certificate" "cert" {
  provider          = aws.us-east-1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
  tags = {
    "AppName" = var.domain_name
  }
}



output "cloudfront_arn" {
  value = aws_cloudfront_distribution.s3_distribution.arn
}
output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "cloudfront_hosted_zone_id" {
  value = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
}

output "cloudfront_id" {
  value = aws_cloudfront_distribution.s3_distribution.id
}