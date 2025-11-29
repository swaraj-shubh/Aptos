"use client";

import React, { useEffect, useState } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "@/lib/aptos";
import { toast } from "react-toastify";

// 

// [Image of Request Flow Diagram]


type Req = {
  requestId: string;
  requesterAddress: string;
  requesterName?: string;
  payerAddress?: string;
  amount: string;
  amountInHuman?: string;
  memo?: string;
  status: string;
  createdAt: string;
};

type User = {
  name: string;
  walletAddress: string;
};

export default function IncomingRequestsList() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [requests, setRequests] = useState<Req[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // SEARCH STATE
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch only PENDING requests
  const fetchRequests = async () => {
    if (!account?.address) return;
    setLoading(true);

    try {
      // The API is already filtering by status='pending' for role='incoming'
      const res = await fetch(`/api/requests?address=${account.address}&role=incoming`);
      const data = await res.json();
      if (data.success) {
        // Double check filter on client side just in case
        const pendingOnly = (data.requests || []).filter((r: Req) => r.status === 'pending');
        setRequests(pendingOnly);
        setFilteredRequests(pendingOnly);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const t = setInterval(fetchRequests, 10000); // Poll every 10s
    return () => clearInterval(t);
  }, [account?.address]);

  // --- SEARCH LOGIC ---
  const searchUsers = async (query: string) => {
    if (!query.startsWith("@") || query.length <= 1) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!data.success) return;
      const q = query.replace("@", "").toLowerCase();
      const matches = data.users.filter((u: User) =>
        u.name.toLowerCase().includes(q)
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } catch (e) { console.error(e); }
  };

  const handleSelectUser = (user: User) => {
    setSearchText(`@${user.name}`);
    setShowSuggestions(false);
    const filtered = requests.filter(
      (r) => r.requesterAddress.toLowerCase() === user.walletAddress.toLowerCase()
    );
    setFilteredRequests(filtered);
  };

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredRequests(requests);
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      searchUsers(searchText);
    }
  }, [searchText, requests]);

  // --- ACTIONS ---

  // 1. REJECT LOGIC
  const handleReject = async (requestId: string) => {
    if(!confirm("Are you sure you want to reject this request?")) return;
    
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}/reject`, { method: "POST" });
      const data = await res.json();
      
      if(data.success) {
        toast.info("Request rejected");
        // Remove from UI immediately
        setRequests(prev => prev.filter(r => r.requestId !== requestId));
      } else {
        toast.error("Failed to reject");
      }
    } catch (e) {
      toast.error("Error rejecting request");
    } finally {
      setProcessingId(null);
    }
  };

  // 2. ACCEPT / PAY LOGIC
  const acceptRequest = async (r: Req) => {
    if (!signAndSubmitTransaction) return toast.error("Wallet not connected");
    setProcessingId(r.requestId);

    try {
      const txPayload: InputTransactionData = {
        data: {
          function: "0x1::coin::transfer",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [r.requesterAddress, r.amount],
        },
      };

      const submitted = await signAndSubmitTransaction(txPayload);
      toast.info("Transaction submitted, confirming...");
      
      await aptos.waitForTransaction({ transactionHash: submitted.hash });

      // Call API to mark request as Paid AND create Transaction History
      await fetch(`/api/requests/${r.requestId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: submitted.hash,
          payerAddress: account?.address,
        }),
      });

      toast.success("Paid successfully!");
      // Remove from UI immediately
      setRequests(prev => prev.filter(req => req.requestId !== r.requestId));

    } catch (e) {
      console.error(e);
      toast.error("Payment failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (!connected) return <div className="text-center p-4">Please connect wallet to view requests</div>;

  return (
    <div className="p-6 bg-white text-gray-800 rounded-2xl shadow-xl border border-emerald-100 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-emerald-900">Incoming Requests</h3>
        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
          {requests.length} Pending
        </span>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <input
          className="w-full bg-gray-50 text-gray-900 p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          placeholder="Filter by requester (@username)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => searchUsers(searchText)}
        />
        <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

        {showSuggestions && suggestions.length > 0 && (
          <div className="w-full bg-white border border-gray-100 rounded-xl shadow-lg absolute z-50 mt-1 overflow-hidden">
            {suggestions.map((user) => (
              <div
                key={user.walletAddress}
                className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0"
                onClick={() => handleSelectUser(user)}
              >
                <div className="font-medium text-emerald-900">@{user.name}</div>
                <div className="text-xs font-mono text-gray-500">{user.walletAddress}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="text-center text-gray-500 py-4">Loading requests...</div>}
      
      {!loading && filteredRequests.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No pending requests found</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredRequests.map((r) => (
          <div key={r.requestId} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {r.requesterName ? r.requesterName[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{r.requesterName || "Unknown"}</div>
                    <div className="text-xs font-mono text-gray-500">
                      {r.requesterAddress.slice(0,6)}...{r.requesterAddress.slice(-4)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 inline-block px-2 py-1 rounded-md">
                  Requested: <span className="font-bold text-emerald-700">{r.amountInHuman ?? (Number(r.amount) / 1e8).toFixed(4)} APT</span>
                </div>
                {r.memo && <div className="text-xs text-gray-500 mt-1 italic">"{r.memo}"</div>}
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleReject(r.requestId)}
                  disabled={!!processingId}
                  className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => acceptRequest(r)}
                  disabled={!!processingId}
                  className="flex-1 md:flex-none px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingId === r.requestId ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing</span>
                    </>
                  ) : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
