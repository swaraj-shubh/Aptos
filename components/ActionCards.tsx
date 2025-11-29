'use client'
import Link from 'next/link';

export default function ActionCards() {
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-16">
      {/* Send Payment Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-md">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Send Payments</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Send crypto using usernames instead of complex wallet addresses. Your payments are secured with expiration times for reversible transactions.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">Username Payments</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">Secure Payments</span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full border border-emerald-200">Reversible</span>
        </div>
        <Link href="/pay">
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all cursor-pointer duration-200 shadow-md hover:shadow-lg">
            Send Payment
          </button>
        </Link>
      </div>

      {/* Receive Payment Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-md">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Receive Payments</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Claim payments sent to your username. View all incoming payments, check expiration times, and securely withdraw funds directly to your wallet.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">Easy Claims</span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full border border-emerald-200">Expiration Tracking</span>
          <span className="px-3 py-1 bg-lime-100 text-lime-700 text-xs rounded-full border border-lime-200">Secure Withdraw</span>
        </div>
        <Link href="/receive">
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all cursor-pointer duration-200 shadow-md hover:shadow-lg">
            Receive Payment
          </button>
        </Link>
      </div>
    </div>
  );
}