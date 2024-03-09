FROM hashicorp/terraform:1.1.0

RUN mkdir /app
ADD modules /app
ADD kubernetes-site /app

WORKDIR /app/kubernetes-site/apigateway

CMD ["plan"]