resource "aws_vpc" "main" {
  cidr_block       = "10.0.0.0/16"

  tags = {
    AppName = var.domain_name
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    AppName = var.domain_name
  }
}
resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  availability_zone = "us-east-2a"
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    AppName = var.domain_name
  }
}
resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    AppName = var.domain_name
  }
}

resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

resource "aws_subnet" "secondary" {
  vpc_id     = aws_vpc.main.id
  availability_zone = "us-east-2b"
  cidr_block = "10.0.2.0/24"
  map_public_ip_on_launch = true

  tags = {
    AppName = var.domain_name
  }
}

resource "aws_route_table_association" "secondary" {
  subnet_id      = aws_subnet.secondary.id
  route_table_id = aws_route_table.main.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_id_main" {
  value = aws_subnet.main.id
}

output "subnet_id_secondary" {
  value = aws_subnet.secondary.id
}

output "ingress_cidr_block" {
  value = aws_subnet.main.cidr_block
}

