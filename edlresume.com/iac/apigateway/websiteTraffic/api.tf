module "website_traffic_api" {
  source = "../modules"
  function_name = data.terraform_remote_state.lambda.outputs.website_traffic_lambda_function_name
  lambda_arn = data.terraform_remote_state.lambda.outputs.website_traffic_lambda_arn
  lambda_invoke_arn = data.terraform_remote_state.lambda.outputs.website_traffic_lambda_invoke_arn
  stage_name = "prod"
  
}

output "website_traffic_invoke_url" {
  value = module.website_traffic_api.invoke_url
}