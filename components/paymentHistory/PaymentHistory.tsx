"use client";

import { useEffect, useState } from "react";
import { TOKEN_SYMBOL } from "@/config";
import { motion } from "framer-motion";

interface Payment {
  _id: string;
  senderName?: string;
  senderAddress: string;
  receiverName?: string;
  receiverAddress: string;
  amountInEth: string;
  transactionHash: string;
  createdAt: string;
  status: "success" | "failed";
}

export default function PaymentHistory({ userAddress }: { userAddress: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/payments?address=${userAddress}`);
      const data = await res.json();

      if (data.success) setPayments(data.payments);
    } catch (err) {
      console.error("Fetch error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userAddress) loadPayments();
  }, [userAddress]);

  const getStatusColor = (s: string) =>
    s === "success"
      ? "bg-green-500/20 text-green-400"
      : "bg-red-500/20 text-red-400";

  if (loading) {
    return (
      <div className="text-center mt-20 text-slate-300">
        Loading history...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center mt-20 text-slate-400">
        No transactions found.
      </div>
    );
  }

return (
  <div className="max-w-4xl mx-auto pt-10 space-y-6">
    <motion.h2 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-8"
    >
      Transaction History
    </motion.h2>

    {payments.length === 0 ? (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No transactions yet</h3>
        <p className="text-gray-500">Your transaction history will appear here</p>
      </motion.div>
    ) : (
      <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {payments.map((p, index) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              y: -2,
              transition: { type: "spring", stiffness: 300 }
            }}
            className="group relative overflow-hidden"
          >
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                {/* LEFT SIDE */}
                <div className="flex items-center space-x-4">
                  {/* Avatar with Animation */}
                  <motion.div 
                    className="relative"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      p.senderAddress.toLowerCase() === userAddress.toLowerCase() 
                        ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {p.senderAddress.toLowerCase() === userAddress.toLowerCase() ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        )}
                      </svg>
                    </div>
                    
                    {/* Status Indicator Dot */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        p.status === 'success' ? 'bg-green-500' : 
                        p.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </motion.div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {p.senderAddress.toLowerCase() === userAddress.toLowerCase()
                          ? "Sent To:" : "Received From:"}
                      </h3>
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        @{p.receiverName ?? p.senderName}
                      </span>
                    </div>

                    <p className="text-gray-600 font-mono text-sm bg-gray-50 px-3 py-1 rounded-lg inline-block">
                      {p.receiverAddress.slice(0, 8)}...{p.receiverAddress.slice(-6)}
                    </p>

                    <div className="flex items-center space-x-4 mt-3">
                      <p className="text-gray-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(p.createdAt).toLocaleString()}
                      </p>

                      {p.transactionHash && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigator.clipboard.writeText(p.transactionHash)}
                          className="text-gray-400 hover:text-green-500 transition-colors flex items-center text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy TX
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="text-right">
                  <motion.p 
                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    {p.amountInEth} {TOKEN_SYMBOL}
                  </motion.p>

                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                      p.status === 'success' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : p.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {p.status === 'pending' && (
                        <motion.div 
                          className="w-2 h-2 bg-yellow-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <span>{p.status.toUpperCase()}</span>
                    </div>
                  </motion.span>
                </div>
              </div>

              {/* Progress Bar for Pending Transactions */}
              {p.status === 'pending' && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mt-4"
                />
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    )}
  </div>
);
}
