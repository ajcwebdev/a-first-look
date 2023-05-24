# Example Project from [A First Look at AWS Fargate](https://ajcwebdev.com/2021/09/06/a-first-look-at-aws-fargate)

[Fargate](https://aws.amazon.com/fargate/) is an AWS service that allows you to run containers on ECS without managing servers or clusters of EC2 instances. It manages provisioning, configuring, and scaling clusters of virtual machines to run containers. This includes selecting the server type, deciding when to scale the clusters, and optimizing cluster packing.

Running your tasks and services with the Fargate launch type includes packaging your application in containers, specifying the CPU and memory requirements, defining network and IAM policies, and launching the application. Each Fargate task has its own isolation boundary and does not share the underlying kernel, CPU resources, memory resources, or elastic network interface with another task.

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd deployment/aws-fargate
```