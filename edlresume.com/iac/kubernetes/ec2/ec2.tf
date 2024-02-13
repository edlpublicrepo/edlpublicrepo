module "alb_main" {
  source                          = "./modules"
  instance_type                   = "t3.xlarge"
  image_id = "ami-07b469810a61205a8"
  vpc_id                          = data.terraform_remote_state.vpc.outputs.vpc_id
  subnet_id_main                  = data.terraform_remote_state.vpc.outputs.subnet_id_main
  subnet_id_secondary             = data.terraform_remote_state.vpc.outputs.subnet_id_secondary
  path_to_user_data_control_plane = "./userdata/controlPlane.sh"
  path_to_user_data_worker_node   = "./userdata/workerNode.sh"
  ingress_cidr_block              = ""
  number_of_worker_nodes          = 1
}