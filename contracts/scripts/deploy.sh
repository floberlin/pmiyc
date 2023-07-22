#!/usr/bin/env bash

if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Please set your .env file"
    exit 1
fi

# used entrypoint on mumbai
# 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789

echo "Please enter the contract address of the entrypoint..."
read entrypoint
echo "Deploying zkPaymaster..."

forge create ./src/zkPaymaster.sol:zkPaymaster -i --rpc-url 'https://polygon-mumbai.g.alchemy.com/v2/'${ALCHEMY_KEY} --private-key ${PRIVATE_KEY} --constructor-args ${entrypoint}
