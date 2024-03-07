#!/bin/bash

echo "---------------------------------------- setting control plane hostname"  && \
sudo su - 
hostname | sed 's/ip-//' | sed 's/-/./g' | xargs -I {} sed -i 's/127.0.0.1 localhost/127.0.0.1 localhost\n{} k8s-control/' /etc/hosts && \
sudo hostnamectl set-hostname k8s-control && \
whoami && \
echo "========================================= setting control plane hostname"  && \
\
echo "---------------------------------------- On all nodes, set up Docker Engine and containerd. You will need to load some kernel modules and modify some system settings as part of this process"  && \
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
if [[ $? == 0 ]]; then echo "Heredoc success" ; fi  && \
sudo modprobe overlay && \
sudo modprobe br_netfilter && \
echo "========================================= On all nodes, set up Docker Engine and containerd. You will need to load some kernel modules and modify some system settings as part of this process"  && \
\
\
echo "---------------------------------------- sysctl params required by setup, params persist across reboots"  && \
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
if [[ $? == 0 ]]; then echo "Heredoc success" ; fi  && \
echo "========================================= sysctl params required by setup, params persist across reboots"  && \
\
\
echo "---------------------------------------- Apply sysctl params without reboot"  && \
sudo sysctl --system && \
echo "========================================= Apply sysctl params without reboot"  && \
\
\
echo "---------------------------------------- Set up the Docker Engine repository"  && \
sudo apt-get update && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
sudo apt-get install -y ca-certificates && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
sudo apt-get install -y curl && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
sudo apt-get install -y awscli && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
sudo apt-get install -y jq && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
sudo apt-get install -y gnupg && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
sudo apt-get install -y lsb-release && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
sudo apt-get install -y apt-transport-https && sleep 3 && while [[ `ps aux | egrep 'apt|dpkg' | wc -l` -ne 1 ]] ; do date ; done && \
echo "========================================= Set up the Docker Engine repository"  && \
\
\
echo "---------------------------------------- Add Docker’s official GPG key"  && \
sudo mkdir -m 0755 -p /etc/apt/keyrings  && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
echo "========================================= Add Docker’s official GPG key"  && \
\
\
echo "---------------------------------------- Set up the repository"  && \
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
echo "========================================= Set up the repository"  && \
\
\
echo "---------------------------------------- Update the apt package index"  && \
sudo apt-get update && \
echo "========================================= Update the apt package index"  && \
\
\
echo "---------------------------------------- Install Docker Engine, containerd, and Docker Compose"  && \
# VERSION_STRING=5:23.0.1-1~ubuntu.20.04~focal
sudo apt-get install -y docker-ce=5:23.0.1-1~ubuntu.20.04~focal docker-ce-cli=5:23.0.1-1~ubuntu.20.04~focal containerd.io docker-buildx-plugin docker-compose-plugin && \
echo "========================================= Install Docker Engine, containerd, and Docker Compose"  && \
\
\
echo "---------------------------------------- Add your 'cloud_user' to the docker group"  && \
sudo usermod -aG docker root && \
echo "========================================= Add your 'cloud_user' to the docker group"  && \
\
\
echo "---------------------------------------- Make sure that 'disabled_plugins' is commented out in your config.toml file"  && \
sudo sed -i 's/disabled_plugins/#disabled_plugins/' /etc/containerd/config.toml  && \
echo "========================================= Make sure that 'disabled_plugins' is commented out in your config.toml file"  && \
\
\
echo "---------------------------------------- Restart containerd"  && \
sudo systemctl restart containerd  && \
echo "========================================= Restart containerd"  && \
\
\
echo "---------------------------------------- On all nodes, disable swap."  && \
sudo swapoff -a  && \
echo "========================================= On all nodes, disable swap."  && \
\
\
echo "---------------------------------------- On all nodes, install kubeadm, kubelet, and kubectl"  && \
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list && \
sudo apt-get update && \
sudo apt-get install -y kubelet kubeadm kubectl && \
sudo apt-mark hold kubelet kubeadm kubectl  && \
echo "alias k='kubectl'" >> ~/.bashrc && \
echo "========================================= On all nodes, install kubeadm, kubelet, and kubectl"  && \
\
\
echo "---------------------------------------- On the control plane node only, initialize the cluster and set up kubectl access"  && \
sudo kubeadm init --pod-network-cidr 192.168.0.0/16 --kubernetes-version 1.29.1 && \
mkdir -p $HOME/.kube && \
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && \
sudo chown $(id -u):$(id -g) $HOME/.kube/config && \
export KUBECONFIG=/etc/kubernetes/admin.conf && \
echo "export KUBECONFIG=/etc/kubernetes/admin.conf" >> ~/.bashrc && \
echo "========================================= On the control plane node only, initialize the cluster and set up kubectl access"  && \
\
\
echo "---------------------------------------- Verify the cluster is working"  && \
kubectl get nodes && \
echo "========================================= Verify the cluster is working"  && \
\
\
echo "---------------------------------------- Install the Calico network add-on"  && \
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.25.0/manifests/calico.yaml && \
echo "========================================= Install the Calico network add-on"  && \
\
\
echo "---------------------------------------- Get the join command (this command is also printed during kubeadm init . Feel free to simply copy it from there)"  && \
kubeadm token create --print-join-command > ~/k8s_join.txt && \
echo "========================================= Get the join command (this command is also printed during kubeadm init . Feel free to simply copy it from there)"  && \
\
\
echo "---------------------------------------- Install helm"  && \
sudo snap install helm --classic && \
echo "========================================= Install helm"  && \
\
\
echo "---------------------------------------- Upload join script to paramater store for the worker nodes to grab and run"  && \
cat /root/k8s_join.txt | xargs -I {} aws ssm put-parameter --overwrite --name "k8s-join-command" --value '"{}"' --type "SecureString" --description '"Command to join the K8s control plane server"' --region=us-east-2 && \
echo "========================================= Upload join script to paramater store for the worker nodes to grab and run"  && \
\
while [[ `kubectl get nodes | grep worker| grep Ready | wc -l` -ne 1 ]] ; do date ; echo "Waiting for worker node to be in Ready state" ; done && \
cat <<EOF | sudo tee /root/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: edlresume-project
spec:
  replicas: 2
  selector:
    matchLabels:
      app: edlresume-project
  template:
    metadata:
      labels:
        app: edlresume-project
    spec:
      containers:
        - name: edlresume
          image: erickdalima/k8s.edlresume.com:v1
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: edlresume-project
  name: edlresume-project
spec:
  type: NodePort
  selector:
    app: edlresume-project
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080

EOF
if [[ $? == 0 ]]; then echo "'deployment.yaml' heredoc success" ; fi  && \
\
kubectl apply -f  /root/deployment.yaml && \
echo "========================================= DONE! ========================================="