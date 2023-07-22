import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import styles from "../styles/Menu.module.css";
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
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        <button className="btn btn-primary" onClick={handleToggle}>
          X
        </button>

        <ul className="mt-4">
          <li className="break-all">{address}</li>

          <button className="btn btn-primary" onClick={logout}>
            Logout
          </button>
        </ul>
      </div>
    </div>
  );
};

export default OffCanvasMenu;
