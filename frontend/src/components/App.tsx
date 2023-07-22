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
import Swapper from "./Swapper";
import Spinner from "./Spinner";
import Image from "next/image";
import Menu from "./Menu";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
} from "@biconomy/account";
import { IBundler, Bundler } from "@biconomy/bundler";
import Link from "next/link";

export default function App() {
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null
  );
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sismoResponse, setSismoResponse] = useState("");

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
        "http://127.0.0.1:3000/"
      );
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.GOERLI).toString(),
        network: "testnet",
        whitelistUrls: {
          "http://127.0.0.1:3000/": signature1,
          "https://zkpaymaster.vercel.app/": signature1,
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
    if (!sdkRef?.current?.provider) return;
    sdkRef.current.hideWallet();
    setLoading(true);
    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    );
    setProvider(web3Provider);

    try {
      const bundler: IBundler = new Bundler({
        bundlerUrl: "https://bundler.biconomy.io/api/v2/5/abc",
        chainId: ChainId.GOERLI,
        entryPointAddress: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
      });

      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.GOERLI,
        bundler: bundler,
        // paymaster: paymaster,
      };
      let biconomySmartAccount = new BiconomySmartAccount(
        biconomySmartAccountConfig
      );
      biconomySmartAccount = await biconomySmartAccount.init();
      console.log("owner: ", biconomySmartAccount.owner);
      console.log(
        "address: ",
        await biconomySmartAccount.getSmartAccountAddress()
      );
      console.log(
        "deployed: ",
        await biconomySmartAccount.isAccountDeployed(
          await biconomySmartAccount.getSmartAccountAddress()
        )
      );

      setSmartAccount(biconomySmartAccount);
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
      <div className="navbar bg-base-100">
        <div className="navbar-start"></div>
        <div className="navbar-center">
          <Image
            src="/logoZK.png"
            width={125}
            height={25}
            className={styles.imageItem}
          />
        </div>
        <div className="navbar-end">
          <Link className="btn btn-ghost btn-circle btn-lg" href="/factory">
            🛠️
          </Link>

          {!!smartAccount && (
            <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
              {truncateAddress(smartAccount?.address)}
            </button>
          )}
          {!smartAccount && !loading && (
            <button className="btn btn-primary" onClick={login}>
              Connect
            </button>
          )}
          {loading && (
            <button className="btn btn-primary" onClick={login}>
              <span className="loading loading-ring loading-lg"></span>
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 w-full max-w-md">
          {!!smartAccount && (
            <SismoConnectButton
              config={{
                appId: "0x45792cd187672019da6ee08aef36eb46", // replace with your appId
                vault: {
                  // For development purposes insert the Data Sources that you want to impersonate here
                  // Never use this in production
                  impersonate: [],
                },
                // displayRawResponse: true,
              }}
              // request proof of Data Sources ownership (e.g EVM, GitHub, twitter or telegram)
              auths={[{ authType: AuthType.VAULT }]}
              // request zk proof that Data Source are part of a group
              // (e.g NFT ownership, Dao Participation, GitHub commits)
              claims={[{ groupId: "0xe0e48a90f6e0fcbd6dd5c27de151e263" }]}
              // request message signature from users.
              signature={{
                message: (
                  smartAccount as BiconomySmartAccount
                )?.address?.toString(),
              }}
              // retrieve the Sismo Connect Reponse from the user's Sismo data vault
              onResponse={async (response: SismoConnectResponse) => {}}
              // reponse in bytes to call a contract
              onResponseBytes={async (response: string) => {
                console.log("sismoResponse", response);
                setSismoResponse(response);
              }}
              text={
                sismoResponse === "" ? "Sismo Settings" : "Sign in with Sismo"
              }
            />
          )}
        </div>
      </div>
      {!!smartAccount && (
        <div className="">
          <Swapper
            smartAccount={smartAccount}
            provider={provider}
            loading={loading}
            sismoResponse={sismoResponse}
          />
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
        <div className="flex justify-center mt-8">
          <button className="btn btn-primary mx-auto" onClick={login}>
            Get Started
          </button>
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
