"use client";

import { FC, ReactNode, useMemo, useEffect, useState } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { 
  PhantomWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import styling for the wallet modal
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: ReactNode;
}

const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  const [isWalletDetected, setIsWalletDetected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWalletAvailability = () => {
      const isAvailable = 
        'phantom' in window || 
        'solflare' in window || 
        window?.solana !== undefined;
      
      setIsWalletDetected(isAvailable);
    };
    
    checkWalletAvailability();
  }, []);
  
  const network = WalletAdapterNetwork.Devnet;


  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter()
    ],
    []
  );

  if (isWalletDetected === null) {
    return null;
  }

  if (isWalletDetected === false) {
    return (
      <Card className="w-full max-w-md mx-auto my-4">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">No Solana Wallet Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            To interact with the Solana blockchain, you need to install a wallet. Please install one of the following wallets and refresh the page.
          </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <div className="flex justify-between gap-2">
            <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">Install Phantom</Button></a>
            <a href="https://www.backpack.app/" target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">Install Backpack</Button></a>
          
          </div>
          
        </CardFooter>
      </Card>
    );
  }
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider; 