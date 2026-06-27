"use client"
import "./globals.css";
import * as React from "react";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, redbellyMainnet, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {  } from "next/font/google";

const config = getDefaultConfig({
  appName:"WrapLayer",
  projectId:"cb7dbe71541c5106d0c3e21e0ffef48d",
  chains:[mainnet,sepolia],
   ssr:true,
});

const queryClient = new QueryClient();

export default function Providers({ children}: { children: React.ReactNode}){
  return(
    <WagmiProvider config={config}>
      <QueryClientProvider client ={queryClient}>
       <RainbowKitProvider theme={darkTheme()}> {children}

       </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )

}