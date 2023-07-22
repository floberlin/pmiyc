import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import styles from "../styles/Menu.module.css";
import Onboarder from "./Onboarder";
import { BiconomySmartAccount } from "@biconomy/account";

type Props = {
  isOpen: boolean;
  setIsOpen(open: boolean): void;
  logout: any;
  address: string;
  userInfo: any;
  smartAccount: BiconomySmartAccount | null;
};

const OffCanvasMenu: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  logout,
  address,
  userInfo,
  smartAccount,
}) => {
  const [usdBlance, setUsdBalance] = useState<any>(0);
  const [tokenBalances, setTokenBalance] = useState<any>([]);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  function truncateAddress(add: string) {
    const len = add.length;
    if (len < 11) return add;
    return add.substring(0, 6) + "..." + add.substring(len - 4, len);
  }

  const getBalances = async () => {
    const balanceParams = {
      chainId: ChainId.GOERLI, // chainId of your choice
      eoaAddress: smartAccount?.address || "",
      tokenAddresses: [],
    };

    const balFromSdk = await smartAccount?.getAllTokenBalances(balanceParams);
    const usdBalFromSdk = await smartAccount?.getTotalBalanceInUsd(
      balanceParams
    );

    const rounded = (
      Math.round(usdBalFromSdk?.data.totalBalance || 0 * 10) / 10
    ).toFixed(2);

    setUsdBalance(rounded);
    setTokenBalance(balFromSdk?.data);
  };
  useEffect(() => {
    getBalances();
  }, [isOpen]);

  return (
    <div>
      <div className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        <button className="btn btn-primary" onClick={handleToggle}>
          X
        </button>
        <ul>
          <li>{truncateAddress(address)}</li>
          <li>Balance: {usdBlance}</li>
          <div className={styles.logoutButtonWrapper}>
            {tokenBalances?.map((tok: any, i: any) => {
              if (tok.contract_ticker_symbol == "DAI") {
                return (
                  <li key={i}>
                    {tok.contract_ticker_symbol} :{" "}
                    {parseInt(tok.balance) / 10 ** 6}
                  </li>
                );
              }
              return (
                <li key={i}>
                  {tok.contract_ticker_symbol} :{" "}
                  {ethers.utils.formatEther(tok.balance)}
                </li>
              );
            })}
          </div>
          <Onboarder address={address} userInfo={userInfo} />
          <button className="btn btn-primary" onClick={logout}>
            Logout
          </button>
          {/* Add more menu items as needed */}
        </ul>
      </div>
    </div>
  );
};

export default OffCanvasMenu;
