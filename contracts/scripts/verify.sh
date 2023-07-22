#!/usr/bin/env bash

if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Please set your .env file"
    exit 1
fi

# used entrypoint on mumbai
# 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789

echo "Please enter the contract address of the paymaster..."
read paymaster

echo "Please enter the contract address of the entrypoint..."
read entrypoint

echo "Verifying zkPaymaster..."

forge verify-contract --watch ${paymaster} src/zkPaymaster.sol:zkPaymaster --constructor-args ${entrypoint} -e ${POLYGONSCAN_KEY} --chain 80001
