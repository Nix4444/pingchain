"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useValidatorWebSocket from "@/hooks/useValidatorWebSocket";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Clock, Server, Activity } from "lucide-react";

const ValidatorDashboard = () => {
  const { publicKey } = useWallet();
  const { 
    connected,
    validatorId,
    error,
    pendingPayouts,
    websitesValidated,
    registerValidator 
  } = useValidatorWebSocket();
  
  const [timeActive, setTimeActive] = useState<number>(0);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (connected && validatorId) {
      interval = setInterval(() => {
        setTimeActive(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connected]);
  
  // Format time display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Become a Validator</CardTitle>
            <CardDescription>Connect your Solana wallet to start validating websites and earning rewards</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletMultiButton />
          </CardContent>
          <CardFooter className="text-sm text-gray-500 text-center">
            You'll need a Solana wallet like Phantom or Solflare
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Validator Dashboard</h1>
        <div>
          <WalletMultiButton />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {!validatorId ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Start Validating</CardTitle>
            <CardDescription>Register your wallet as a validator to start earning rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              As a validator, you'll help verify website uptime and earn SOL rewards for each validation.
            </p>
            <Button 
              onClick={registerValidator} 
              disabled={!connected}
              className="bg-green-600 hover:bg-green-700"
            >
              Register as Validator
            </Button>
            {!connected && <p className="mt-2 text-yellow-600">Connecting to server...</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="bg-green-500 rounded-full h-3 w-3"></div>
                <span className="font-medium">Active</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Validator ID: {validatorId.substring(0, 8)}...
              </div>
            </CardContent>
          </Card>

          {/* Time Active Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Time Active</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-xl font-mono">{formatTime(timeActive)}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sites Validated</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-purple-500" />
              <span className="text-xl font-medium">{websitesValidated || 0}</span>
            </CardContent>
          </Card>

          {/* Pending Rewards Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Rewards</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-yellow-500" />
              <span className="text-xl font-medium">{pendingPayouts || 0} lamports</span>
            </CardContent>
          </Card>
        </div>
      )}

      {validatorId && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Your validator is now online and will automatically receive validation requests</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Each time you validate a website's uptime, you'll earn 100 lamports</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Keep this page open to continue validating websites in the background</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Rewards are paid out directly to your connected wallet address</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ValidatorDashboard; 