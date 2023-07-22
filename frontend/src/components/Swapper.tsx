// Swap.tsx
import { BiconomySmartAccount } from "@biconomy/account";
import { ethers } from "ethers";
import Image from "next/image";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/Swap.module.css";
import sparkApi from "../utils/sparkabi.json";

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
      address: "0xd8134205b0328f5676aaefb3b2a0dc15f4029d8c",
      decimals: 18,
    },
    {
      name: "DAI",
      symbol: "DAI",
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
    },
  ];

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

      const sparkContract = new ethers.Contract(sparkAddress, sparkApi);

      const amountIn: any = ethers.utils.parseUnits(
        amount.toString(),
        tokens[0].decimals
      );

      const tx = {
        to: sparkAddress,
        data: sparkContract.interface.encodeFunctionData("redeem", [
          amountIn,
          smartAccount?.address,
          smartAccount?.address,
        ]),
      };

      const userOp = await smartAccount.buildUserOp([tx]);
      userOp.paymasterAndData = "0x2647D39D50Bd604d5bacF7504cf648135D450E14";

      const txResponse = await smartAccount.sendUserOp(userOp);
      console.log({ txResponse });

      const txHash = await txResponse.wait();
      console.log({ txHash });

      const txLink = `https://goerli.etherscan.com/tx/${txHash?.receipt?.transactionHash}`;
      if (txHash?.receipt?.transactionHash) {
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
      }
    } catch (error) {
      console.log("catch");
      console.log(error);
    }
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
        theme="light"
      />

      {!loading && (
        <>
          <br></br>
          <div className="card card-bordered w-96 bg-base-100 shadow-xl p-6 mt-4">
            <br></br>
            <h2 className="text-center">Swap sDAI for DAI</h2>
            <br></br>
            <div>
              <input
                className="input input-bordered w-full"
                type="number"
                placeholder="0"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <br></br>

            <button className="btn btn-primary" onClick={() => handleSwap()}>
              Swap for free
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Swapper;

// disabled={!(token1 && token2 && amount)}
