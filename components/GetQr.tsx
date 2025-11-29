"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface GetQRProps {
  username: string;
  walletAddress: string;
  size?: number;
  showDetails?: boolean;
}

export default function GetQR({ 
  username, 
  walletAddress, 
  size = 200,
  showDetails = true 
}: GetQRProps) {
  const [qrValue, setQrValue] = useState("");

  // Generate QR code content
  useEffect(() => {
    if (username && walletAddress) {
      // You can customize the QR content format
      const qrContent = JSON.stringify({
        username: `@${username}`,
        walletAddress: walletAddress,
        platform: "GreenPay",
        timestamp: new Date().toISOString()
      });
      setQrValue(qrContent);
    }
  }, [username, walletAddress]);

  if (!username || !walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
        <div className="w-32 h-32 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <p className="text-emerald-700 text-sm text-center">
          Username or wallet address not available
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-lg">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-emerald-900 mb-1">Payment QR Code</h3>
        <p className="text-emerald-600 text-sm">Scan to send payments</p>
      </div>

      {/* QR Code */}
      <div className="mb-4 p-4 bg-white rounded-xl border-2 border-emerald-100">
        <QRCodeSVG
          value={qrValue}
          size={size}
          level="H"
          includeMargin
          fgColor="#047857" // Emerald color
          bgColor="#ffffff"
        />
      </div>

      {/* User Details */}
      {showDetails && (
        <div className="w-full space-y-3">
          {/* Username */}
          <div className="text-center">
            <p className="text-xs text-emerald-600 mb-1">Username</p>
            <div className="flex items-center justify-center space-x-2 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-emerald-900 font-semibold">@{username}</p>
              <button
                onClick={() => navigator.clipboard.writeText(`@${username}`)}
                className="text-emerald-500 hover:text-emerald-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="text-center">
            <p className="text-xs text-emerald-600 mb-1">Wallet Address</p>
            <div className="bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
              <p className="text-emerald-900 font-mono text-xs break-all">
                {walletAddress}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(walletAddress)}
                className="text-emerald-500 hover:text-emerald-700 text-xs mt-1 transition-colors"
              >
                Copy Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 text-center">
        <p className="text-emerald-500 text-xs">
          Powered by <span className="font-semibold">GreenPay</span>
        </p>
      </div>
    </div>
  );
}