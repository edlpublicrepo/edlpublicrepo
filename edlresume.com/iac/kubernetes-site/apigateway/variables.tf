variable "main_function_name" {
  default = "build_k8s_site"
}

variable "lambda_policy_actions" {
  default = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
}
