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

forge create ./src/zkPaymaster.sol:zkPaymaster -i --rpc-url https://goerli.infura.io/v3/1a29950df3df4a7390639008d5d67c79 --private-key ${PRIVATE_KEY} --constructor-args "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" --verify -e "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW"

# Please enter the contract address of the entrypoint...
# 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
# Deploying zkPaymaster...
# [⠆] Compiling...
# No files changed, compilation skipped
# Deployer: 0x4bFC74983D6338D3395A00118546614bB78472c2
# Deployed to: 0x5Cb6d8D045DeFE9d546c516742FC09083eC7059C
# Transaction hash: 0x67bb744789e5d6bcc6a290c5ddde94e4728a9cf626b8678736a835493ee67987
# Starting contract verification...
# Waiting for etherscan to detect contract deployment...
# Start verifying contract `0x5cb6d8d045defe9d546c516742fc09083ec7059c` deployed on mumbai

# Submitting verification for [src/zkPaymaster.sol:zkPaymaster] "0x5Cb6d8D045DeFE9d546c516742FC09083eC7059C".

# Submitting verification for [src/zkPaymaster.sol:zkPaymaster] "0x5Cb6d8D045DeFE9d546c516742FC09083eC7059C".

# Submitting verification for [src/zkPaymaster.sol:zkPaymaster] "0x5Cb6d8D045DeFE9d546c516742FC09083eC7059C".

# Submitting verification for [src/zkPaymaster.sol:zkPaymaster] "0x5Cb6d8D045DeFE9d546c516742FC09083eC7059C".

# Submitting verification for [src/zkPaymaster.sol:zkPaymaster] "0x5Cb6d8D045DeFE9d546c516742FC09083eC7059C".

# Submitting verification for [src/zkPaymaster.sol:zkPaymaster] "0x5Cb6d8D045DeFE9d546c516742FC09083eC7059C".
# Submitted contract for verification:
#         Response: `OK`
#         GUID: `qvalife37v6mi2yuwwtx8hnjr28tzb2vvjrw3bm5gkfnvqlkbz`
#         URL:
#         https://mumbai.polygonscan.com/address/0x5cb6d8d045defe9d546c516742fc09083ec7059c
# Contract verification status:
# Response: `NOTOK`
# Details: `Pending in queue`
# Contract verification status:
# Response: `OK`
# Details: `Pass - Verified`
# Contract successfully verified