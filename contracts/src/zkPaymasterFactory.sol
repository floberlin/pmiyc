// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

// import {BasePaymaster} from "account-abstraction/core/BasePaymaster.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
// import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";
// import "sismo-zk/SismoConnectLib.sol";

import "./zkPaymaster.sol";

contract ZKPaymasterFactory {

    function create(
        address _entryPoint,
        address _owner,
        bytes16 _appId,
        bytes16 _groupData
    )
        public
        returns (
            address
        )
    {
        IEntryPoint entryPoint = IEntryPoint(_entryPoint);

        ZKPaymaster newPaymaster = new ZKPaymaster(
            entryPoint,
            _appId,
            _groupData
        );
        
        newPaymaster.transferOwnership(_owner);
        
        return (address(newPaymaster));
    }


}
