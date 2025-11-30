"use client";

import { useState } from "react";
import PayPage from "@/components/paySection/PayUsers";
import ReceivePage from "@/components/recieveSection/ReceiveUser";
import PaymentHistory from "@/components/paymentHistory/PaymentHistory";
import RewardsView from "@/components/Rewards/RewardsView";

import RequestPaymentForm from "@/components/requestAPT/RequestPaymentForm";
import IncomingRequestsList from "@/components/requestAPT/IncomingRequestsList";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"pay" | "receive" | "request" | "history" | "rewards">("pay");
  const [requestSubTab, setRequestSubTab] = useState<"requestMoney" | "incoming">("requestMoney");

  const { account } = useWallet();
  const userAddress = account?.address?.toString() || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex">

      {/* SIDEBAR */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-emerald-200 shadow-lg">
        <div className="p-6">


          {/* NAVIGATION */}
          <div className="space-y-2">

            <button
              onClick={() => setActiveTab("pay")}
              className={`w-full px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === "pay"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                : "text-emerald-700 hover:bg-emerald-50"
                }`}
            >
              Pay
            </button>

            <button
              onClick={() => setActiveTab("receive")}
              className={`w-full px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === "receive"
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                : "text-emerald-700 hover:bg-emerald-50"
                }`}
            >
              Receive
            </button>

            <button
              onClick={() => setActiveTab("request")}
              className={`w-full px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === "request"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                : "text-emerald-700 hover:bg-emerald-50"
                }`}
            >
              Request
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === "history"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                : "text-emerald-700 hover:bg-emerald-50"
                }`}
            >
              History
            </button>

            <button
              onClick={() => setActiveTab("rewards")}
              className={`w-full px-4 py-3 rounded-xl text-left font-medium transition ${activeTab === "rewards"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                : "text-emerald-700 hover:bg-emerald-50"
                }`}
            >
              Rewards
            </button>

          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">

        {activeTab === "pay" && <PayPage />}
        {activeTab === "receive" && <ReceivePage />}

        {/* REQUEST SECTION */}
        {activeTab === "request" && (
          <div className="space-y-6">

            {/* SUB TABS */}
            <div className="flex space-x-4 border-b pb-2 border-emerald-300">
              <button
                onClick={() => setRequestSubTab("requestMoney")}
                className={`px-4 py-2 rounded-lg font-semibold ${requestSubTab === "requestMoney"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 hover:bg-emerald-100"
                  }`}
              >
                Request Money
              </button>

              <button
                onClick={() => setRequestSubTab("incoming")}
                className={`px-4 py-2 rounded-lg font-semibold ${requestSubTab === "incoming"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 hover:bg-emerald-100"
                  }`}
              >
                Incoming Requests
              </button>
            </div>

            {/* SUB TAB CONTENT */}
            {requestSubTab === "requestMoney" && (
              <RequestPaymentForm currentUser={{ walletAddress: userAddress }} />
            )}

            {requestSubTab === "incoming" && <IncomingRequestsList />}
          </div>
        )}

        {activeTab === "history" && <PaymentHistory userAddress={userAddress} />}
        {activeTab === "rewards" && <RewardsView userAddress={userAddress} />}
      </div>
    </div>
  );
}
