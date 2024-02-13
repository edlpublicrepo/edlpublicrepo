#!/bin/bash

sudo hostnamectl set-hostname k8s-control
sudo echo "127.0.0.1 k8s-control" >> /etc/hosts

# On all nodes, set up Docker Engine and containerd. You will need to load some kernel modules and modify some system settings as part of this
process

cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# sysctl params required by setup, params persist across reboots

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Apply sysctl params without reboot

sudo sysctl --system

# Set up the Docker Engine repository

sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https

# Add Docker’s official GPG key

sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update the apt package index

sudo apt-get update

# Install Docker Engine, containerd, and Docker Compose

VERSION_STRING=5:23.0.1-1~ubuntu.20.04~focal
sudo apt-get install -y docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin

# Add your 'cloud_user' to the docker group

sudo usermod -aG docker $USER

# Log out and log back in so that your group membership is re-evaluated

# Make sure that 'disabled_plugins' is commented out in your config.toml file

sudo sed -i 's/disabled_plugins/#disabled_plugins/' /etc/containerd/config.toml

# Restart containerd

sudo systemctl restart containerd

# On all nodes, disable swap.

sudo swapoff -a

# On all nodes, install kubeadm, kubelet, and kubectl

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# On the control plane node only, initialize the cluster and set up kubectl access

sudo kubeadm init --pod-network-cidr 192.168.0.0/16 --kubernetes-version 1.29.1

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Verify the cluster is working

kubectl get nodes
