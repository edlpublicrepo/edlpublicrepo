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
  tags = {
    "AppName" = var.domain_name
  }
}


output "aws_wafv2_web_acl_arn" {
  value = aws_wafv2_web_acl.cloudfront.arn
}