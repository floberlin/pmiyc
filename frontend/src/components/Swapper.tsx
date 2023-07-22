// Swap.tsx
import React, { useState } from "react";
import styles from "../styles/Swap.module.css";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Transaction, ethers } from "ethers";
import erc20Abi from "../utils/erc20abi.json";
import sparkApi from "../utils/sparkabi.json";
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

// SDAI GOERLI 0xd8134205b0328f5676aaefb3b2a0dc15f4029d8c
const Swapper: React.FC<Props> = ({ smartAccount, provider, loading }) => {
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("");

  const tokens: Token[] = [
    {
      name: "SDAI",
      symbol: "sDAI",
      address: '"0xd8134205b0328f5676aaefb3b2a0dc15f4029d8c"',
      decimals: 18,
    },
    {
      name: "DAI",
      symbol: "DAI",
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
      toast.info("Swapping sDAI for DAI", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      const sparkAddress = "0xD8134205b0328F5676aaeFb3B2a0DC15f4029d8C";

      const sig = provider.getSigner();

      const sparkContract = new ethers.Contract(sparkAddress, sparkApi);

      // .001 => 1 000 000 000 000 000
      const amountIn: any = ethers.utils.parseUnits(
        amount.toString(),
        tokens[0].decimals
      );

      const tx = {
        to: sparkAddress,
        data: sparkContract.interface.encodeFunctionData("redeem", [
          amountIn,
          smartAccount.address,
          smartAccount.address,
        ]),
      };

      const userOp = await smartAccount.buildUserOp([tx]);
      //const paymasterAddress = "0x2647d39d50bd604d5bacf7504cf648135d450e14";
      //userOp.paymasterAndData = ethers.utils.toUtf8Bytes(`${paymasterAddress}`);
      userOp.paymasterAndData = "0x2647D39D50Bd604d5bacF7504cf648135D450E14";

      try {
        const txResponse = await smartAccount.sendUserOp(userOp);
        console.log({ txResponse });
      } catch (error) {
        console.log("catch");
        console.log(error);
      }

      // const txHash = await txResponse.wait();
      // console.log({ txHash });
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
