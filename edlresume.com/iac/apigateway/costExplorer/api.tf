module "cost_explorer_api" {
  source = "../../modules/apigateway/"
  function_name = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_function_name
  lambda_arn = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_arn
  lambda_invoke_arn = data.terraform_remote_state.lambda.outputs.cost_explorer_lambda_invoke_arn
  stage_name = "prod"
  
}

output "cost_explorer_invoke_url" {
  value = module.cost_explorer_api.invoke_url
}