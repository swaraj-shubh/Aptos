"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

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
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="relative flex flex-col items-center p-8 bg-gradient-to-br from-white to-emerald-50 rounded-3xl border-2 border-emerald-100/80 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm overflow-hidden"
  >
    {/* Background decorative elements */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/30 to-green-300/20 rounded-full -translate-y-16 translate-x-16" />
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/20 to-green-300/10 rounded-full -translate-x-12 translate-y-12" />
    
    {/* Animated border glow */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/10 via-green-500/5 to-emerald-600/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />

    {/* Header */}
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative text-center mb-6"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent mb-2">
        Payment QR Code
      </h3>
      <p className="text-emerald-600/80 text-sm font-medium">Scan to send instant payments</p>
    </motion.div>

    {/* QR Code Container */}
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      className="relative mb-6 p-6 bg-white rounded-2xl border-2 border-emerald-100 shadow-lg shadow-emerald-500/10 group"
    >
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      
      <QRCodeSVG
        value={qrValue}
        size={size}
        level="H"
        includeMargin
        fgColor="#031d64ff" // Slightly brighter emerald
        bgColor="#ffffff"
        className="drop-shadow-sm"
      />
      
      {/* Scanning animation overlay */}
      <motion.div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent via-emerald-500/0 to-emerald-500/0"
        animate={{ 
          background: [
            'linear-gradient(to bottom, transparent 0%, rgba(16, 185, 129, 0) 50%, transparent 100%)',
            'linear-gradient(to bottom, transparent 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)',
            'linear-gradient(to bottom, transparent 0%, rgba(16, 185, 129, 0) 50%, transparent 100%)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
    </motion.div>

    {/* User Details */}
    {showDetails && (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative w-full space-y-4"
      >
        {/* Username */}
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <p className="text-xs font-semibold text-emerald-600/70 mb-2 uppercase tracking-wide">Username</p>
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white text-sm font-bold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </motion.div>
              <p className="text-emerald-900 font-semibold text-lg">@{username}</p>
            </div>
            <motion.button
              onClick={() => navigator.clipboard.writeText(`@${username}`)}
              className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors duration-200 group cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Wallet Address */}
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <p className="text-xs font-semibold text-emerald-600/70 mb-2 uppercase tracking-wide">Wallet Address</p>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-emerald-900 font-mono text-sm break-all mb-2 leading-relaxed">
              {walletAddress}
            </p>
            <motion.button
              onClick={() => navigator.clipboard.writeText(walletAddress)}
              className="inline-flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Address</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Footer Info */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative mt-6 text-center"
    >
      <div className="flex items-center justify-center space-x-2 text-emerald-500/70 text-xs">
        <div className="w-1 h-1 bg-emerald-400 rounded-full" />
        <p>
          Powered by <span className="font-bold text-emerald-600">GreenPay</span>
        </p>
        <div className="w-1 h-1 bg-emerald-400 rounded-full" />
      </div>
    </motion.div>
  </motion.div>
);
}