// Swap.tsx
import React, { useState } from "react";
import styles from "../styles/Swap.module.css";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ethers } from "ethers";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as SwapRouterABI } from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";
import erc20Abi from "../utils/erc20abi.json";
import { BiconomySmartAccount } from "@biconomy/account";
import { getPoolImmutables, getPoolState } from "../utils/helpers";
import { ChainId } from "@biconomy/core-types";

type Token = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
};

type Props = {
  smartAccount: BiconomySmartAccount;
  provider: any;
  loading: boolean;
};

const poolAddress = "0x45dDa9cb7c25131DF268515131f647d726f50608"; // WETH/LINK
const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
// SDAI GOERLI 0xd8134205b0328f5676aaefb3b2a0dc15f4029d8c
const Swapper: React.FC<Props> = ({ smartAccount, provider, loading }) => {
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("");

  const tokens: Token[] = [
    // { name: 'USDC', symbol: 'USDC', address: '"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"', decimals: 6},
    {
      name: "SDAI",
      symbol: "SDAI",
      address: '"0xd8134205b0328f5676aaefb3b2a0dc15f4029d8c"',
      decimals: 6,
    },
    {
      name: "WETH",
      symbol: "WETH",
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
    },
  ];

  const getBalances = async () => {
    const balanceParams = {
      chainId: ChainId.POLYGON_MAINNET, // chainId of your choice
      eoaAddress: smartAccount?.address,
      tokenAddresses: [],
    };

    const balFromSdk = await smartAccount.getAllTokenBalances(balanceParams);
    console.info("getAlltokenBalances", balFromSdk);
  };

  const handleSwap = async () => {
    try {
      toast.info("Swapping SDAI for USDC", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
      );

      const immutables = await getPoolImmutables(poolContract);
      const state = await getPoolState(poolContract);
      console.log({ immutables, state });
      await getBalances();

      const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
      );

      // .001 => 1 000 000 000 000 000
      const amountIn: any = ethers.utils.parseUnits(
        amount.toString(),
        tokens[0].decimals
      );

      const approvalAmount = (amountIn * 2).toString();
      const tokenContract0 = new ethers.Contract(
        immutables.token0,
        erc20Abi,
        provider
      );

      const approvalTrx = await tokenContract0.populateTransaction.approve(
        swapRouterAddress,
        approvalAmount
      );
      const tx1 = {
        to: immutables.token0,
        data: approvalTrx.data,
      };
      const params = {
        tokenIn: immutables.token0,
        tokenOut: immutables.token1,
        fee: immutables.fee,
        recipient: smartAccount?.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };
      const swapTrx =
        await swapRouterContract.populateTransaction.exactInputSingle(params, {
          gasLimit: ethers.utils.hexlify(1000000),
        });
      const tx2 = {
        to: swapRouterAddress,
        data: swapTrx.data,
      };

      const txResponse = await smartAccount.sendSignedUserOp
      // .sendTransactionBatch({
      //   transactions: [tx1, tx2],
      // });
      const txHash = await txResponse.wait();
      console.log({ txHash });
      console.log({ txResponse });
      const txLink = `https://goerli.etherscan.com/tx/${txHash.transactionHash}`;
      toast.success(
        <a href={txLink} target="_blank">
          Success! Click here for your transaction!
        </a>,
        {
          position: "top-right",
          autoClose: 15000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    } catch (error) {}
  };

  return (
    <div className={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className={styles.swapContainer}>
        {!loading && (
          <>
            <h2>Swap</h2>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="number"
                placeholder="0"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className={styles.imageWrapper}>
              <Image
                src="https://phoenix-labs.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F7c6b83cf-fa97-46bd-a42c-3e7a59d6beb6%2Fsdai.png?table=block&id=45446b7c-3117-4897-935b-f097b64331de&spaceId=157c7673-6b8d-4489-8b6a-1c900de03f9a&width=250&userId=&cache=v2"
                width={50}
                height={50}
                alt="Picture of the author"
                className={styles.imageItem}
              />

              <svg
                className={styles.imageItem}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5D6785"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>

              <Image
                // src="https://logos.covalenthq.com/tokens/1/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
                src="https://logos.covalenthq.com/tokens/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
                width={50}
                height={50}
                alt="Picture of the author"
                className={styles.imageItem}
              />
            </div>
            <button className={styles.swapButton} onClick={() => handleSwap()}>
              Swap
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Swapper;

// disabled={!(token1 && token2 && amount)}
