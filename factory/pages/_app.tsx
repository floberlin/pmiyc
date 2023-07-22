import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli],
  [alchemyProvider({ apiKey: "8kMhSrpLGyIlRYBtAtT9IAVWeVK8hiOZ" })]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  projectId: "24df99a45b7290cf2cabc1fecaed90ae",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
