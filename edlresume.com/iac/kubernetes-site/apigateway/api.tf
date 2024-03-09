module "build_k8s_website_api" {
  source = "../../modules/apigateway/"
  function_name = module.build_k8s_website_lambda.main_lambda_function_name
  lambda_arn = module.build_k8s_website_lambda.main_lambda_arn
  lambda_invoke_arn = module.build_k8s_website_lambda.main_lambda_invoke_arn
  stage_name = "prod"
  
}

output "build_k8s_website_invoke_url" {
  value = module.build_k8s_website_api.invoke_url
}