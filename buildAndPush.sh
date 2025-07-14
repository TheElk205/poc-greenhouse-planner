name=$(npm pkg get name | sed 's/"//g')
version=$(npm pkg get version | sed 's/"//g')
prefix="theelk205"
image_name=$prefix/$name:$version
echo "Pushing to $image_name"
docker buildx build --platform linux/amd64,linux/arm64 --load --push -t $image_name .