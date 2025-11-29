'use client'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">
          Built on Avalanche C-Chain • Secured by Smart Contracts
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <span>🔒 Escrow Protected</span>
          <span>👤 Username Based</span>
          <span>⚡ Instant Withdrawals</span>
        </div>
      </div>
    </footer>
  );
}