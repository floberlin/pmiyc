// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

import "forge-std/Test.sol";
import "../src/zkPaymaster.sol";
import "../src/zkPaymasterFactory.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

contract ZKPaymasterTest is Test {
    ZKPaymasterFactory public zkPaymasterFactory;
    ZKPaymaster public zkPaymaster;

    function setUp() public {
        zkPaymasterFactory = new ZKPaymasterFactory();
        zkPaymaster = ZKPaymaster(
            zkPaymasterFactory.create(
                0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789,
                msg.sender,
                0x45792cd187672019da6ee08aef36eb46,
                0xa2dc87293a0977b6697c09c892cd4cb4
            )
        );
    }

    function testPaymasterExists() public {
        assertFalse(address(zkPaymaster) == address(0));
    }

    function testCompareBytes() public {
        bytes
            memory bytesToCheck = hex"9e5d4c49000000000000000000000000d8134205b0328f5676aaefb3b2a0dc15f4029d8c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064ba08765200000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000783a6267e072b72cc63cb7a6efe1b5a8934b5853000000000000000000000000783a6267e072b72cc63cb7a6efe1b5a8934b585300000000000000000000000000000000000000000000000000000000";
        bytes memory bytesToCheckIn = hex"D8134205b0328F5676aaeFb3B2a0DC15f4029d8C";
        bool result = zkPaymaster.checkBytesIncluded(
            bytesToCheck,
            bytesToCheckIn
        );
        assertTrue(result);
    }

    function test_validatePaymasterUserOp() public {
        

    }
}
