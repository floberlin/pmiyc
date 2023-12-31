// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/zkPaymaster.sol";
import "../src/zkPaymasterFactory.sol";

contract ZKPaymasterScript is Script {

    ZKPaymaster public zkPaymaster;
    ZKPaymasterFactory public zkPaymasterFactory;
   
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        zkPaymasterFactory = new ZKPaymasterFactory();

        zkPaymaster = ZKPaymaster(zkPaymasterFactory.create(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789, msg.sender, 0x45792cd187672019da6ee08aef36eb46, 0xe0e48a90f6e0fcbd6dd5c27de151e263));
    
        vm.stopBroadcast();
    }
}
