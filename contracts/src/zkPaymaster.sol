// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

import {BasePaymaster} from "account-abstraction/core/BasePaymaster.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";
import "sismo-zk/SismoConnectLib.sol";

contract ZKPaymaster is BasePaymaster, SismoConnect {
    // zkPaymaster app id
    //bytes16 private _appId;
    // allow impersonation
    bool private _isImpersonationMode = false;
    bytes16 private _groupId;

    constructor(
        IEntryPoint _entryPoint,
        bytes16 appId_,
        bytes16 groupData_
    )
        BasePaymaster(_entryPoint)
        // use buildConfig helper to easily build a Sismo Connect config in Solidity
        SismoConnect(
            buildConfig({
                appId: appId_,
                isImpersonationMode: _isImpersonationMode
            })
        )
    {
        _groupId = groupData_;
    }

    function verifySismoConnectResponse(
        bytes memory response,
        address _userOpSender
    ) public returns (bool) {
        SismoConnectVerifiedResult memory result = verify({
            responseBytes: response,
            auth: buildAuth({authType: AuthType.VAULT}),
            claim: buildClaim({
                groupId: _groupId // UNI Holders
            }),
            signature: _signatureBuilder.build({
                message: abi.encodePacked(_userOpSender)
            })
        });

        result; //shutup about the unused stuff
        return true;
    }

    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal override returns (bytes memory context, uint256 validationData) {
        //stop telling me about unused variables
        userOpHash;
        maxCost;

        bytes memory sismoResponse = userOp.paymasterAndData[20:];
        // this runs out of gas
        // require(
        //     verifySismoConnectResponse(sismoResponse, userOp.sender),
        //     "You need to hold UNI to use this paymaster"
        // );
        require(
            sismoResponse.length != 0,
            "You need to hold UNI to use this paymaster"
        );

        require(
            checkBytesIncluded(
                userOp.callData,
                hex"D8134205b0328F5676aaeFb3B2a0DC15f4029d8C"
            ) || userOp.nonce == 0,
            "not allowed, only sDAI transfers are allowed"
        );

        // context = abi.encode("un-used");
        // validationData = 123;
    }

    // function simply checks if a short byte array is included in a long byte array
    // in our case we check if the sDAI address is included in the callData
    function checkBytesIncluded(
        bytes memory _long,
        bytes memory _short
    ) public pure returns (bool) {
        if (_short.length > _long.length) {
            return false;
        }

        for (uint i = 0; i <= _long.length - _short.length; i++) {
            bool found = true;
            for (uint j = 0; j < _short.length; j++) {
                if (_long[i + j] != _short[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }

        return false;
    }

    /**
     * post-operation handler.
     * (verified to be called only through the entryPoint)
     * @dev if subclass returns a non-empty context from validatePaymasterUserOp, it must also implement this method.
     * @param mode enum with the following options:
     *      opSucceeded - user operation succeeded.
     *      opReverted  - user op reverted. still has to pay for gas.
     *      postOpReverted - user op succeeded, but caused postOp (in mode=opSucceeded) to revert.
     *                       Now this is the 2nd call, after user's op was deliberately reverted.
     * @param context - the context value returned by validatePaymasterUserOp
     * @param actualGasCost - actual gas used so far (without this postOp call).
     */
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal override {}
}
