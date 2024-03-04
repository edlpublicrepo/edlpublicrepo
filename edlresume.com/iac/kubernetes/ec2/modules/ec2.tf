resource "aws_launch_template" "control_plane" {
  name_prefix   = var.name_prefix
  image_id      = var.image_id
  instance_type = var.instance_type

  iam_instance_profile {
    arn = aws_iam_instance_profile.main.arn
  }

  key_name = aws_key_pair.main.key_name

  monitoring {
    enabled = true
  }
  vpc_security_group_ids = [aws_security_group.main_sg.id]

  tag_specifications {
    resource_type = "instance"

    tags = {
      "AppName" = var.domain_name
      "Name" = "Master"
    }
  }

  user_data = filebase64(var.path_to_user_data_control_plane)
}

resource "aws_launch_template" "worker_node" {
  name_prefix   = var.name_prefix
  image_id      = var.image_id
  instance_type = var.instance_type

  iam_instance_profile {
    arn = aws_iam_instance_profile.main.arn
  }

  key_name = aws_key_pair.main.key_name

  monitoring {
    enabled = true
  }
  vpc_security_group_ids = [aws_security_group.main_sg.id]

  tag_specifications {
    resource_type = "instance"

    tags = {
      "AppName" = var.domain_name
      "Name" = "Worker"
    }
  }

  user_data = filebase64(var.path_to_user_data_worker_node)
}

resource "aws_security_group" "main_sg" {
  name_prefix = var.name_prefix
  #   description = ""
  vpc_id = var.vpc_id

  tags = {
    "AppName" = var.domain_name
  }
}

resource "aws_vpc_security_group_ingress_rule" "main_sg_ipv4" {
  security_group_id = aws_security_group.main_sg.id
  #   cidr_ipv4         = var.ingress_cidr_block
  referenced_security_group_id = aws_security_group.main_sg.id
  from_port                    = 80
  ip_protocol                  = "tcp"
  to_port                      = 80
}

resource "aws_vpc_security_group_ingress_rule" "main_sg_k8s" {
  security_group_id = aws_security_group.main_sg.id
  #   cidr_ipv4         = var.ingress_cidr_block
  referenced_security_group_id = aws_security_group.main_sg.id
  from_port                    = 6443
  ip_protocol                  = "tcp"
  to_port                      = 6443
  description = "K8s"
}

resource "aws_vpc_security_group_ingress_rule" "allow_ssh_ipv4" {
  security_group_id = aws_security_group.main_sg.id
  referenced_security_group_id = aws_security_group.main_sg.id
  from_port                    = 22
  ip_protocol                  = "tcp"
  to_port                      = 22
}

resource "aws_vpc_security_group_ingress_rule" "allow_ssh_ipv4_local" {
  security_group_id = aws_security_group.main_sg.id
  cidr_ipv4 = var.my_local_ip
  from_port                    = 22
  ip_protocol                  = "tcp"
  to_port                      = 22
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.main_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = -1
}

resource "aws_lb" "main" {
  name_prefix        = var.name_prefix
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.main_sg.id]
  subnets            = [var.subnet_id_main, var.subnet_id_secondary]

  enable_deletion_protection = false

  #   access_logs {
  #     bucket  = aws_s3_bucket.lb_logs.id
  #     prefix  = "test-lb"
  #     enabled = true
  #   }

  tags = {
    "AppName" = var.domain_name
  }
}

resource "aws_key_pair" "main" {
  key_name   = var.name_prefix
  public_key = var.public_key
}
resource "aws_iam_instance_profile" "main" {
  name_prefix = var.name_prefix
  role = aws_iam_role.role.name
}

data "aws_iam_policy_document" "main" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "role" {
  name_prefix = var.name_prefix
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.main.json
  managed_policy_arns = ["arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore", "arn:aws:iam::aws:policy/AmazonSSMPatchAssociation"]
}

resource "aws_autoscaling_group" "control_plane" {
  name_prefix = "${var.name_prefix}-master-"
  health_check_type   = "EC2"
  vpc_zone_identifier = [var.subnet_id_main, var.subnet_id_secondary]
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1

  launch_template {
    id      = aws_launch_template.control_plane.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      max_healthy_percentage = 100
      min_healthy_percentage = 0
      standby_instances = "Terminate"
    }
  }
}

resource "aws_autoscaling_group" "worker_nodes" {
  depends_on = [ aws_autoscaling_attachment.asg_attachment_bar ]
  name_prefix = "${var.name_prefix}-worker-"
  health_check_type   = "EC2"
  vpc_zone_identifier = [var.subnet_id_main, var.subnet_id_secondary]
  desired_capacity    = var.number_of_worker_nodes
  max_size            = var.number_of_worker_nodes
  min_size            = var.number_of_worker_nodes

  launch_template {
    id      = aws_launch_template.worker_node.id
    version = "$Latest"
  }
}


resource "aws_lb_target_group" "main" {
  name     = "main"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    port     = 80
    protocol = "HTTP"
  }
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.id
  port              = 80

  default_action {
    target_group_arn = aws_lb_target_group.main.id
    type             = "forward"
  }
}
resource "aws_autoscaling_attachment" "asg_attachment_bar" {
  autoscaling_group_name = aws_autoscaling_group.control_plane.id
  lb_target_group_arn    = aws_lb_target_group.main.arn
}



output "control_plane_launch_template_id" {
  value = aws_launch_template.control_plane.id
}
output "control_plane_launch_template_latest_version" {
  value = aws_launch_template.control_plane.latest_version
}

output "worker_node_launch_template_id" {
  value = aws_launch_template.worker_node.id
}
output "worker_node_launch_template_latest_version" {
  value = aws_launch_template.worker_node.latest_version
}