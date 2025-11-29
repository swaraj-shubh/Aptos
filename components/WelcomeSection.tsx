'use client'
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function WelcomeSection() {
  const { account, connected } = useWallet();

  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Reversible</span> Crypto Payments
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
        Send crypto using <span className="text-green-500 font-semibold">usernames</span> instead of complex wallet addresses. 
        Your payments are secured with <span className="text-green-600 font-semibold">expiration times</span> for 
        <span className="text-emerald-500 font-semibold"> reversible transactions</span>.
      </p>

      {/* Feature highlights */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-gray-700 text-sm font-medium">Username Payments</span>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 text-sm font-medium">Secure Payments</span>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span className="text-gray-700 text-sm font-medium">Reversible</span>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span className="text-gray-700 text-sm font-medium">Expiration Times</span>
        </div>
      </div>

      {connected && account?.address && (
        <div className="inline-flex items-center space-x-3 bg-green-100 border border-green-300 rounded-full px-6 py-3 mb-8">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-medium">Wallet Connected</span>
          <span className="text-green-600 font-mono text-sm">
            {account?.address?.toString().slice(0, 6)}...{account?.address?.toString().slice(-4)}
          </span>
        </div>
      )}
    </div>
  );
}