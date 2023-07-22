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
    bool private _isImpersonationMode = true;
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
        // Recreate the request made in the fontend to verify the proof
        // We will verify the Sismo Connect Response containing the ZK Proofs against it
        // AuthRequest[] memory auth = new AuthRequest[](1);

        // auth = _authRequestBuilder.build({
        //     authType: AuthType.EVM_ACCOUNT,
        //     userId: uint160(0xA4C94A6091545e40fc9c3E0982AEc8942E282F38)
        // });

        // ClaimRequest memory claim = new ClaimRequest[](1);
        // claim = _claimRequestBuilder.build({
        //     groupId: 0xa2dc87293a0977b6697c09c892cd4cb4 // UNI Holders
        // });

        SismoConnectVerifiedResult memory result = verify({
            responseBytes: response,
            auth: buildAuth({authType: AuthType.VAULT}),
            claim: buildClaim({
                groupId: _groupId // UNI Holders
            }),
             signature: _signatureBuilder.build({
                message: abi.encode(_userOpSender)
            })
            // signature: buildSignature({message: _userOpSender})
        });

        return true;
    }

    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal override returns (bytes memory context, uint256 validationData) {
        bytes memory sismoResponse = bytes(userOp.paymasterAndData[20:5790]);

        // require(userData == 0, "not allowed, userData must be 0");

        // check proof and proof needs to check if the opTX contains the samrt account address //! TBD

        require(
            verifySismoConnectResponse(sismoResponse, userOp.sender),
            "You need to hold UNI to use this paymaster"
        );

        // check that userOp.callData includes 0xD8134205b0328F5676aaeFb3B2a0DC15f4029d8C //! DONE

        require(
            checkBytesIncluded(
                userOp.callData,
                hex"D8134205b0328F5676aaeFb3B2a0DC15f4029d8C"
            ) || userOp.nonce == 0,
            "not allowed, only sDAI transfers are allowed"
        );
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
