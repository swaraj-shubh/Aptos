// app/page.tsx
'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function Home() {
  const { account, connected, connect, isLoading, disconnect } = useWallet();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchCurrentUser = async () => {
    if (!account?.address || !connected) return;
    
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (data.success) {
        const user = data.users.find((u: any) => 
          u.walletAddress.toLowerCase() === account?.address.toString().toLowerCase()
        );
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    if (connected && account?.address) {
      fetchCurrentUser();
    }
  }, [connected, account?.address]);

  const handleConnectWallet = () => {
    connect("Petra");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo and Title */}
          <div className="flex justify-center items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-emerald-900">AptosPay</h1>
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl font-bold text-emerald-800 mb-6">
            Instant Crypto Payments with{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              QR & Rewards
            </span>
          </h2>
          
          <p className="text-xl text-emerald-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Send and receive cryptocurrency instantly using QR codes or usernames. 
            Earn exciting rewards on every payment while enjoying the security of 
            reversible transactions.
          </p>

          {/* Connection Status & Actions */}
          {connected ? (
            <div className="space-y-8">






              {/* Welcome Message */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-200 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  {currentUser && (
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="text-2xl font-semibold text-emerald-900">
                      Welcome{currentUser ? `, @${currentUser.name}` : ''}!
                    </h3>
                    <span className="text-green-600 font-mono text-sm">
                      {account?.address?.toString().slice(0, 10)}...{account?.address?.toString().slice(-7)}
                    </span>
                    <p className="text-emerald-600">
                      Ready to make seamless payments?
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Send Payment Card */}
                  <Link href="/pay">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Send Payment</h4>
                      <p className="text-green-100 text-sm">
                        Send crypto using QR codes or usernames
                      </p>
                    </div>
                  </Link>

                  {/* Receive Payment Card */}
                  <Link href="/receive">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Receive Payment</h4>
                      <p className="text-green-100 text-sm">
                        Receive payments via QR code sharing
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <FeatureCard 
                  icon="📱" 
                  title="QR Code Payments" 
                  description="Scan or share QR codes for instant, contactless payments"
                />
                <FeatureCard 
                  icon="👤" 
                  title="Username Payments" 
                  description="Send to easy-to-remember usernames instead of complex addresses"
                />
                <FeatureCard 
                  icon="🎁" 
                  title="Payment Rewards" 
                  description="Earn exciting rewards and cashback on every transaction"
                />
              </div>
            </div>
          ) : (
            /* Wallet Not Connected State */
            <div className="space-y-8">
              {/* Connect Wallet Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-200 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-semibold text-emerald-900 text-center mb-4">
                  Connect Your Wallet
                </h3>
                
                <p className="text-emerald-600 text-center mb-6">
                  Connect your wallet to start using QR code payments and earn rewards
                </p>

                <button
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold py-4 rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              </div>

              {/* Features for Non-Connected Users */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <FeatureCard 
                  icon="⚡" 
                  title="Instant Payments" 
                  description="Send and receive crypto in seconds with QR technology"
                />
                <FeatureCard 
                  icon="🔒" 
                  title="Secure & Reversible" 
                  description="Military-grade security with reversible payment options"
                />
                <FeatureCard 
                  icon="💰" 
                  title="Earn Rewards" 
                  description="Get rewarded for every payment you make or receive"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white/50 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-emerald-900 text-center mb-12">
            How It Works
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard 
              number="1" 
              title="Connect Wallet" 
              description="Connect your Aptos wallet to get started"
            />
            <StepCard 
              number="2" 
              title="Choose Method" 
              description="Use QR code or username for payments"
            />
            <StepCard 
              number="3" 
              title="Make Payment" 
              description="Send or receive crypto instantly"
            />
            <StepCard 
              number="4" 
              title="Earn Rewards" 
              description="Get rewarded for every transaction"
            />
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🎁</span>
            </div>
            <h3 className="text-3xl font-bold mb-4">Earn Exciting Rewards!</h3>
            <p className="text-green-100 text-lg mb-6">
              Every payment you make or receive earns you reward points. 
              Redeem them for exclusive benefits, discounts, and more!
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-semibold">Loyalty Points</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl mb-2">💎</div>
                <div className="font-semibold">Cashback Rewards</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl mb-2">⭐</div>
                <div className="font-semibold">Exclusive Benefits</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { 
  icon: string; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:border-emerald-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-lg font-semibold text-emerald-900 mb-2">{title}</h4>
      <p className="text-emerald-600 text-sm">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, description }: { 
  number: string; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-bold text-lg">{number}</span>
      </div>
      <h4 className="text-lg font-semibold text-emerald-900 mb-2">{title}</h4>
      <p className="text-emerald-600 text-sm">{description}</p>
    </div>
  );
}