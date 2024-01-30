provider "aws" {
  region = "us-east-2"
}

resource "aws_s3_bucket" "main_bucket" {
  bucket = "edlresume.com"
  acl    = "public-read"

  tags = {
    Name = "edlresume.com"
  }
}
resource "aws_s3_bucket_acl" "main_bucket" {
  bucket = aws_s3_bucket.main_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket" "log_bucket" {
  bucket = "edlresume.com-logs"
}

resource "aws_s3_bucket_acl" "log_bucket_acl" {
  bucket = aws_s3_bucket.log_bucket.id
  acl    = "log-delivery-write"
}

resource "aws_s3_bucket_logging" "main_bucket_logging" {
  bucket = aws_s3_bucket.main_bucket.id

  target_bucket = aws_s3_bucket.log_bucket.id
  target_prefix = ""
}

resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "edlresume.com"
  description                       = "OAC for edlresume.com"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.main_bucket.bucket_regional_domain_name
    origin_id   = "edlresume.com"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["example.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-MyBucketOriginID"

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

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for MyBucket"
}