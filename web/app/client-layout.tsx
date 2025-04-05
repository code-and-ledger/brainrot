"use client";

import { useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { createPublicClient } from "viem";
import { base, flowTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [flowTestnet] as const,
  transports: {
    [flowTestnet.id]: http("https://testnet.evm.nodes.onflow.org"),
  },
});

export const publicClient = createPublicClient({
  chain: flowTestnet,
  transport: http(),
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
