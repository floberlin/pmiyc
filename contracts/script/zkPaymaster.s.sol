// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/zkPaymaster.sol";

contract ZKPaymasterScript is Script {

    ZKPaymaster public zkPaymaster;
   
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        zkPaymaster = new ZKPaymaster(IEntryPoint(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));
    
        vm.stopBroadcast();
    }
}
