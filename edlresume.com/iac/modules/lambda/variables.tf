variable "domain_name" {
  type        = string
  default     = "edlresume.com"
  description = "The name of the website"
}

variable "main_function_name" {
  type        = string
  description = "The name of the function you want to deploy"
}

variable "lambda_runtime" {
  type        = string
  description = "What runtime the Lambda will be using (e.g. 'python3.12', 'nodejs20.x')"
}

variable "lambda_policy_actions" {
  type = list(string)
  description = "List of actions for the lambda (e.g. ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'])"
  default = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
}
