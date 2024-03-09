module "build_k8s_website_lambda" {
  source = "../../modules/lambda/"
  main_function_name = var.main_function_name
  lambda_runtime = "python3.12"

}
