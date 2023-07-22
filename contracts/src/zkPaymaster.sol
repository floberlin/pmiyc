// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

import {BasePaymaster} from "account-abstraction/core/BasePaymaster.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {UserOperation} from "account-abstraction/interfaces/UserOperation.sol";
import "sismo-zk/SismoConnectLib.sol";

contract ZKPaymaster is BasePaymaster, SismoConnect {
    // zkPaymaster app id
    bytes16 private _appId = 0x45792cd187672019da6ee08aef36eb46;
    // allow impersonation
    bool private _isImpersonationMode = true;

    constructor(
        IEntryPoint _entryPoint
    )
        BasePaymaster(_entryPoint)
        // use buildConfig helper to easily build a Sismo Connect config in Solidity
        SismoConnect(
            buildConfig({
                appId: _appId,
                isImpersonationMode: _isImpersonationMode
            })
        )
    {}

    function verifySismoConnectResponse(bytes memory response, address _userOpSender) public {
        // Recreate the request made in the fontend to verify the proof
        // We will verify the Sismo Connect Response containing the ZK Proofs against it
        AuthRequest[] memory auth = new AuthRequest;
       
        auth = _authRequestBuilder.build({
            authType: AuthType.EVM_ACCOUNT,
            userId: uint160(0xA4C94A6091545e40fc9c3E0982AEc8942E282F38)
        });
      
        ClaimRequest memory claim = new ClaimRequest;
        claim = _claimRequestBuilder.build({
            groupId: 0xa2dc87293a0977b6697c09c892cd4cb4 // UNI Holders 
        });
       
        SismoConnectVerifiedResult memory result = verify({
            responseBytes: response,
            auths: auths,
            claims: claim,
            signature: _signatureBuilder.build({
                message: _userOpSender
            })
        });

        uint256 vaultId = SismoConnectHelper.getUserId(result, AuthType.VAULT);
        uint256 githubId = SismoConnectHelper.getUserId(
            result,
            AuthType.GITHUB
        );
        uint256 telegramId = SismoConnectHelper.getUserId(
            result,
            AuthType.TELEGRAM
        );
        uint256[] memory evmAccountIds = SismoConnectHelper.getUserIds(
            result,
            AuthType.EVM_ACCOUNT
        );

        // console.log("Vault ID: %s", vaultId);
        // console.log("Github ID: %s", githubId);
        // console.log("Telegram ID: %s", telegramId);
        // console.log("First EVM Account ID: %s", evmAccountIds[0]);
        // console.log("Second EVM Account ID: %s", evmAccountIds[1]);
    }

    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal override returns (bytes memory context, uint256 validationData) {


        bytes32 sismoResponse = bytes32(userOp.paymasterAndData[20:21]);

        require(userData == 0, "not allowed, userData must be 0");

        // check proof and proof needs to check if the opTX contains the samrt account address //! TBD

        verifySismoConnectResponse(sismoResponse, userOp.sender);


        // check that userOp.callData includes 0xD8134205b0328F5676aaeFb3B2a0DC15f4029d8C //! DONE

        require(
            checkBytesIncluded(
                userOp.callData,
                hex'D8134205b0328F5676aaeFb3B2a0DC15f4029d8C'
            ),
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
