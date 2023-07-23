import { BiconomySmartAccount } from "@biconomy/account";
import { ethers } from "ethers";
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
  sismoResponse: string;
};

const Swapper: React.FC<Props> = ({
  smartAccount,
  provider,
  loading,
  sismoResponse,
}) => {
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
    if (!amount) {
      console.error("Amount is not set");
    }

    if (!sismoResponse) {
      console.error("SismoResponse is empty");
    }

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
      userOp.paymasterAndData = `0xd553b30c7e958B4891B4b6fD82Cbfa868dd6d586${sismoResponse.slice(
        2
      )}`;

      console.log("userOp", userOp);

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
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );
      }
    } catch (error: any) {
      console.log("catch");
      console.log(error);

      toast.error(`Error! ${error?.message}`, {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleTxWithoutProof = async () => {
    try {
      toast.info("Sending unsupported Tx", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      const amountIn: any = ethers.utils.parseUnits(amount.toString(), 18);

      const tx = {
        to: "0x4bFC74983D6338D3395A00118546614bB78472c2",
        data: "0x",
        value: amountIn,
      };

      const userOp = await smartAccount.buildUserOp([tx]);
      userOp.paymasterAndData = "0xECb451F1f892129FefEa1c3812c0De7F9689A595";

      console.log("userOp", userOp);

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
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );
      }
    } catch (error: any) {
      console.log("catch");
      console.log(error);

      toast.error(`Error! ${error?.message}`, {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
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
          <div className="card card-bordered w-96 bg-base-100 shadow-xl p-6 mt-6">
            <h2 className="text-center">Swap sDAI for DAI</h2>

            <div className="my-4">
              <input
                className="input input-bordered w-full"
                type="number"
                placeholder="0"
                onChange={(e) => setAmount(e.target.value)}
                step={0.01}
              />
            </div>

            <div className="flex">
              <button
                className="btn btn-primary mr-2"
                onClick={() => handleSwap()}
              >
                Swap for free
              </button>

              <button
                className="btn btn-outline ml-2"
                onClick={() => handleTxWithoutProof()}
              >
                Tx without Proof
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Swapper;
