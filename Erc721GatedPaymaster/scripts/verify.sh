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
echo "Verifying Erc721GatedPaymaster..."

forge verify-contract --watch 0x6D8a272Efb984979EF8f4a5Ee6b075BBf1DfaaFB src/Erc721GatedPaymaster.sol:Erc721GatedPaymaster --constructor-args ${entrypoint} -e ${POLYGONSCAN_KEY} --chain 80001
