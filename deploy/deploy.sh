#!/bin/bash

VERSION=1.0.5

export PATH=$(pwd):$PATH

export KUBECONFIG=$(pwd)/kube_config

# Necessary for kubectl to use the correct AWS auth
export AWS_PROFILE=future_of_work

# Hack to pass outside-context files to Docker
sudo mount --bind ../fow fow

# Compile frontend assets
cd fow; npm run build; cd ..

# Build docker image
sudo docker build -t frnsys/future-of-work:$VERSION .

# Unmount
sudo umount fow

# Then create the repo on DockerHub and push:
sudo docker push frnsys/future-of-work:$VERSION

# Set version for kubectl config
cat "app.yml" | sed "s/{{VERSION}}/$VERSION/g" > /tmp/app.yml

# Deploy
./kubectl apply -f /tmp/app.yml --namespace aal

# Note that if the future-of-work pod says "unchanged",
# i.e. because you only updated the docker image, you can try this to force a rebuild:
./kubectl rollout restart deployment.extensions/future-of-work --namespace aal