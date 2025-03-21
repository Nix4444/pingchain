"use client";

import SolanaWalletProvider from "@/components/SolanaWalletProvider";
import ValidatorDashboard from "@/components/ValidatorDashboard";

export default function Validator() {
  return (
    <div className="container mx-auto">
      <SolanaWalletProvider>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Become a Pingchain Validator
          </h1>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-2">
            <ValidatorDashboard />
          </div>
        </div>
      </SolanaWalletProvider>
    </div>
  );
}
