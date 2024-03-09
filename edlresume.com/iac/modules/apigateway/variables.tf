variable "domain_name" {
  type        = string
  default     = "edlresume.com"
  description = "The name of the website"
}

variable "function_name" {
  type        = string
  description = "The name of the function"
}

variable "lambda_arn" {
  type        = string
  description = "The arn of the function"
}

variable "lambda_invoke_arn" {
  type        = string
  description = "The invoke arn of the function"
}

variable "stage_name" {
  type        = string
  description = "The stage of the API where the function will be deployed"
}

