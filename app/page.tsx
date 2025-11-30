'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { account, connected, connect, isLoading, disconnect } = useWallet();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

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
      router.push('/hehe'); // Add this line - navigate to /hehe when connected
    }
  }, [connected, account?.address, router]); // Add router to dependency array

  const handleConnectWallet = () => {
    connect("Petra");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
{/* Hero Section */}
<section className="pt-20 pb-16 px-4">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
      {/* Left Side - Content */}
      <div className="flex-1 text-center lg:text-left">


        {/* Main Heading */}
        <h2 className="text-5xl lg:text-6xl font-bold text-emerald-800 mb-6">
          Instant Crypto Payments with{' '}
          <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
            QR & Rewards
          </span>
        </h2>

        <p className="text-xl text-emerald-700 mb-8 max-w-2xl leading-relaxed">
          Send and receive cryptocurrency instantly using QR codes or usernames.
          Earn exciting rewards on every payment while enjoying the security of
          reversible transactions.
        </p>


      </div>

      {/* Right Side - Image */}
      <div className="flex-1 flex justify-center lg:justify-end">
        <div className="relative">
          <img
            src="/aptos.jpg"
            alt="AptosPay Crypto Payments"
            className="w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
          {/* Optional: Add a floating animation effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-20 blur-xl -z-10 animate-pulse"></div>
        </div>
      </div>
    </div>

<div className="flex flex-col lg:flex-row items-center justify-between mt-15 gap-12">
  
  {/* Left Side - Image */}
  <div className="flex-1 flex justify-center lg:justify-start">
    <div className="relative">
      <img
        src="/payment.png"
        alt="AptosPay Crypto Payments"
            className="w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
      />
      {/* Optional: Add a floating animation effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-20 blur-xl -z-10 animate-pulse"></div>
    </div>
  </div>

  {/* Right Side - Connect Wallet Card */}
  <div className="flex-1 flex justify-center lg:justify-end">
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-200 max-w-md">
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
        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
  </div>
</div>

    {/* Features Grid */}
    <div className="grid md:grid-cols-6 gap-6 max-w-full mt-12">
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
      <FeatureCard
        icon="⚡"
        title="Instant Payments"
        description="Send and receive crypto in seconds with QR technology"
      />
      <FeatureCard
        icon="🔒"
        title="Secure & Robust"
        description="Military-grade security with reversible payment options"
      />
      <FeatureCard
        icon="💰"
        title="Earn Rewards"
        description="Get rewarded for every payment you make or receive"
      />
    </div>
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
    <div className="relative rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/money.jpg')" }}
      />
      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/40 to-emerald-600/40 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
          <span className="text-2xl">🎁</span>
        </div>
        <h3 className="text-3xl font-bold mb-4 drop-shadow-lg">Earn Exciting Rewards!</h3>
        <p className="text-green-50 text-lg mb-6 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
          Every payment you make or receive earns you reward points. Click
          here to view your rewards!
        </p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300">
            <div className="text-2xl mb-2 drop-shadow">🏆</div>
            <div className="font-semibold">Loyalty Points</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300">
            <div className="text-2xl mb-2 drop-shadow">💎</div>
            <div className="font-semibold">Cashback Rewards</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300">
            <div className="text-2xl mb-2 drop-shadow">⭐</div>
            <div className="font-semibold">Exclusive Benefits</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string; }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:border-emerald-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-lg font-semibold text-emerald-900 mb-2">{title}</h4>
      <p className="text-emerald-600 text-sm">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, description }: { number: string; title: string; description: string; }) {
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