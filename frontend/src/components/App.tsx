import styles from "../styles/Home.module.css";
import {
  SismoConnectButton,
  AuthType,
  SismoConnectResponse,
  ClaimType,
} from "@sismo-core/sismo-connect-react";
import { useState, useEffect, useRef } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";
import SmartAccount from "@biconomy/smart-account";
import Swapper from "./Swapper";
import Spinner from "./Spinner";
import Onboarder from "./Onboarder";
import Image from "next/image";
import Menu from "./Menu";

export default function App() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  console.log("smartAccount", smartAccount);

  function truncateAddress(add: string) {
    const len = add.length;
    if (len < 11) return add;
    return add.substring(0, 6) + "..." + add.substring(len - 4, len);
  }

  useEffect(() => {
    let configureLogin: any;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }
  }, [interval]);

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      const signature1 = await socialLoginSDK.whitelistUrl(
        "https://aaswap.vercel.app"
      );
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MAINNET).toString(),
        network: "mainnet",
        whitelistUrls: {
          "https://aaswap.vercel.app": signature1,
        },
      });
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet();
      enableInterval(true);
    } else {
      setupSmartAccount();
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) {
      setUserInfo(await sdkRef?.current?.getUserInfo());
      console.log(userInfo);
      return;
    }
    sdkRef.current.hideWallet();
    setLoading(true);
    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    );
    setProvider(web3Provider);
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MAINNET,
        supportedNetworksIds: [ChainId.POLYGON_MAINNET],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MAINNET,
            dappAPIKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY,
          },
        ],
      });
      const acct = await smartAccount.init();
      console.log({
        deployed: await smartAccount.isDeployed(ChainId.POLYGON_MAINNET),
      });
      const isDeployed = await smartAccount.isDeployed(ChainId.POLYGON_MAINNET);
      if (isDeployed == false) {
        console.log("this one needs to be deployed");
        const deployTx = await smartAccount.deployWalletUsingPaymaster();
        console.log(deployTx);
      }
      setSmartAccount(acct);
      const info = await sdkRef.current.getUserInfo();
      setUserInfo(info);
      setLoading(false);
    } catch (err) {
      console.log("error setting up smart account... ", err);
    }
  }

  const logout = async () => {
    if (!sdkRef.current) {
      console.error("Web3Modal not initialized.");
      return;
    }
    await sdkRef.current.logout();
    sdkRef.current.hideWallet();
    setSmartAccount(null);
    enableInterval(false);
  };

  return (
    <div className={styles.demoContainer}>
      <Menu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        logout={logout}
        address={smartAccount?.address || ""}
        userInfo={userInfo}
        smartAccount={smartAccount}
      />
      <div className={styles.nav}>
        <Image
          src="/logo.png"
          width={75}
          height={75}
          alt="Picture of the author"
          className={styles.imageItem}
        />
        {!!smartAccount && (
          <SismoConnectButton
            config={{
              appId: "0x45792cd187672019da6ee08aef36eb46", // replace with your appId
              vault: {
                // For development purposes insert the Data Sources that you want to impersonate here
                // Never use this in production
                impersonate: [
                  // EVM
                  "leo21.sismo.eth",
                  "0xA4C94A6091545e40fc9c3E0982AEc8942E282F38",
                  "0x1b9424ed517f7700e7368e34a9743295a225d889",
                  "0x82fbed074f62386ed43bb816f748e8817bf46ff7",
                  "0xc281bd4db5bf94f02a8525dca954db3895685700",
                  // Github
                  "github:leo21",
                  // Twitter
                  "twitter:leo21_eth",
                  // Telegram
                  "telegram:leo21",
                ],
              },
              // displayRawResponse: true,
            }}
            // request proof of Data Sources ownership (e.g EVM, GitHub, twitter or telegram)
            auths={[{ authType: AuthType.VAULT }]}
            // request zk proof that Data Source are part of a group
            // (e.g NFT ownership, Dao Participation, GitHub commits)
            claims={[
              // ENS DAO Voters
              { groupId: "0x85c7ee90829de70d0d51f52336ea4722" },
            ]}
            // request message signature from users.
            signature={{
              message: (smartAccount as SmartAccount).address.toString(),
            }}
            // retrieve the Sismo Connect Reponse from the user's Sismo data vault
            onResponse={async (response: SismoConnectResponse) => {
              const res = await fetch("/api/verify", {
                method: "POST",
                body: JSON.stringify(response),
              });
              console.log(await res.json());
            }}
            // reponse in bytes to call a contract
            // onResponseBytes={async (response: string) => {
            //   console.log(response);
            // }}
          />
        )}
        <div className={styles.header}>
          <h1 className="text-3xl text-white font-bold underline">
            Connect and start staking
          </h1>
          <p>
            Swap USDC and WETH and sample the onboarding power of Account
            Abstraction
          </p>
        </div>
        {!!smartAccount && (
          <button className={styles.account} onClick={() => setIsOpen(true)}>
            {truncateAddress(smartAccount.address)}
          </button>
        )}
        {!smartAccount && !loading && (
          <button className={styles.logoutButon} onClick={login}>
            Connect
          </button>
        )}
        {loading && <p>Loading...</p>}
      </div>
      {!!smartAccount && (
        <div className={styles.buttonWrapper}>
          <Swapper
            smartAccount={smartAccount}
            provider={provider}
            loading={loading}
          />
          {/* <Onboarder address={smartAccount.address} userInfo={userInfo} /> */}
        </div>
      )}
      {loading && (
        <div className={styles.loader}>
          <div className={styles.loadContent}>
            <p>Creating your Smart Account...</p>
            <Spinner />
          </div>
        </div>
      )}
      {!smartAccount && !loading && (
        <div className={styles.loader}>
          <div className={styles.loadContent}>
            <button className={styles.bigButton} onClick={login}>
              Connect and Swap
            </button>
          </div>
        </div>
      )}
      <br />
      {/* <div className={styles.linkWrapper}>
      <a href="https://docs.biconomy.io/introduction/overview" target="_blank" className={styles.readDocs}>
  Click here to learn more about the Biconomy SDK
    </a>
    </div> */}
    </div>
  );
}
