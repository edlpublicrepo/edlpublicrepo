resource "aws_route53_zone" "primary" {
  comment = "Managed by Terraform"
  name    = var.domain_name
  tags = {
    "AppName" = var.domain_name
  }
}

resource "aws_route53_record" "primary" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"
  alias {
      evaluate_target_health = false
      name                   = data.terraform_remote_state.cloudfront.outputs.cloudfront_domain_name
      zone_id                = data.terraform_remote_state.cloudfront.outputs.cloudfront_hosted_zone_id
        }
}
