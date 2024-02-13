variable "domain_name" {
  type        = string
  default     = "edlresume.com"
  description = "The name of the website"
}

variable "name_prefix" {
  type        = string
  default     = "edl"
  description = "The prefix name of the website"
}

variable "image_id" {
  type        = string
  default     = "ami-07b469810a61205a8"
  description = "The AMI for your EC2 instances"
}

variable "region" {
  type        = string
  default     = "us-east-2"
  description = "The region for your resources"
}

variable "instance_type" {
  type        = string
  default     = "t2.small"
  description = "The instances type for your EC2 instances"
}

variable "public_key" {
  type        = string
  default     = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC842VomlgarY/f/Jhv2o+KREy2CZdrn6L5kR14UeGTtwi2McQenmz2/YKeTQktutjmngUuU7JPD0Q7qgf4YGrI6ibaNA2P3ZcwV09mXdryXhoyMFy0uEcy4w/HGFQUIY/B9owOMij7YoeJsEjDybPErEOCvxtab0sJvV1PpoeOutM1DWBFmlYg+B6/VdsYeM+nRZo25Dw1Ejn8lcZ5GszfoTe7inhzZ61cEAE4A9e0F/onX1L4EExlfRDJt/W+Qgtpd8jvd3GTjxxzanlxJ0QZtqVjAdA6LY3IETPp34RQJKkix2MzgQaWXA96bWTvNXI1Xb3O9VuIhpfIlMhAeP3Pv1o9jz6GzRMBSlUwQaf3aeWyXassLjfrKyMj3X3/86SY2LFGA/8w3+Bg5kMsP9iN533oLH70RTLeGUl+8tn4e1SDY2DSnhz1G12GNGWvw4Pnokb70bVSTgIStMFUrbohJHRwBuiv+4OCpIm8qjA1UIvwsTSYU+WkHlE85jAcRz0= limaerir@3c22fb0f6236"
  description = "The public key for your EC2 instances"
}

variable "vpc_id" {
  type        = string
  description = "The ID of the VPC for your EC2 instances"
}

variable "subnet_id_main" {
  type        = string
  description = "The ID of the main subnet on your VPC for your ALB"
}

variable "subnet_id_secondary" {
  type        = string
  description = "The ID of the secondary subnet on your VPC for your ALB"
}

variable "path_to_user_data_control_plane" {
  type        = string
  description = "The path to your userdata script for control plan EC2 instance"
}

variable "path_to_user_data_worker_node" {
  type        = string
  description = "The path to your userdata script for control plan EC2 instance"
}

variable "ingress_cidr_block" {
  type        = string
  description = "Ingress CIDR block for your EC2 instances"
}

variable "number_of_worker_nodes" {
  type = number
  default = 1
  description = "The number of worker nodes you want"
}

variable "desired_capacity" {
  type = number
  default = 2
  description = "The desired capacity of total nodes"
}
variable "max_size" {
  type = number
  default = 2
  description = "The max number of total nodes"
}
variable "min_size" {
  type = number
  default = 2
  description = "The minimum number of total nodes"
}
