'use client'

import { useState } from 'react';
import PayPage from '@/components/paySection/PayUsers';
import ReceivePage from '@/components/recieveSection/ReceiveUser';
import PaymentHistory from '@/components/paymentHistory/PaymentHistory';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'pay' | 'receive' | 'history'>('pay');

  // ✅ Get current wallet address here
  const { account } = useWallet();
  const userAddress = account?.address?.toString() || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex">

      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-emerald-200 shadow-lg">
        <div className="p-6">

          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <img src="../logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
            </div>
            <h1 className="text-xl font-bold text-emerald-900">GreenPay</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="space-y-2">

            {/* PAY TAB */}
            <button
              onClick={() => setActiveTab('pay')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'pay'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Pay</span>
            </button>

            {/* RECEIVE TAB */}
            <button
              onClick={() => setActiveTab('receive')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'receive'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                  : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="font-medium">Receive</span>
            </button>

            {/* HISTORY TAB */}
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">History</span>
            </button>

          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-sm text-emerald-700 text-center">
              {activeTab === 'pay'
                ? 'Send payments to anyone instantly'
                : activeTab === 'receive'
                ? 'Receive payments instantly'
                : 'Your complete on-chain & off-chain transaction log'}
            </p>
          </div>

        </div>
      </div>


      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6">

        {activeTab === 'pay' && <PayPage />}

        {activeTab === 'receive' && <ReceivePage />}

        {activeTab === 'history' && (
          <PaymentHistory userAddress={userAddress} />
        )}

      </div>

    </div>
  );
}