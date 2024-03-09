variable "my_local_ip" {
  description = "User NAT IP is added via the command line for securiyt reasons"
}

module "alb_main" {
  source                          = "./modules"
  instance_type                   = "t3.xlarge"
  # image_id = data.aws_ami.amzn2.image_id
  image_id = "ami-07b469810a61205a8" # Ubuntu (same version as ACG)
  # image_id = "ami-010feaf9c3bddd955" #preconfigured with k8s
  vpc_id                          = data.terraform_remote_state.vpc.outputs.vpc_id
  subnet_id_main                  = data.terraform_remote_state.vpc.outputs.subnet_id_main
  subnet_id_secondary             = data.terraform_remote_state.vpc.outputs.subnet_id_secondary
  path_to_user_data_control_plane = "./userdata/controlPlane.sh"
  path_to_user_data_worker_node   = "./userdata/workerNode.sh"
  ingress_cidr_block              = ""
  number_of_worker_nodes          = 1
  my_local_ip = var.my_local_ip
}

output "control_plane_launch_template_id" {
  value = module.alb_main.control_plane_launch_template_id
}
output "control_plane_launch_template_latest_version" {
  value = module.alb_main.control_plane_launch_template_latest_version
}

output "worker_node_launch_template_id" {
  value = module.alb_main.worker_node_launch_template_id
}
output "worker_node_launch_template_latest_version" {
  value = module.alb_main.worker_node_launch_template_latest_version
}
