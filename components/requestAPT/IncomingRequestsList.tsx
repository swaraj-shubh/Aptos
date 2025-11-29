"use client";

import React, { useEffect, useState } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "@/lib/aptos";
import { toast } from "react-toastify";

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

  // SEARCH
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch all incoming requests
  const fetchRequests = async () => {
    if (!account?.address) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/requests?address=${account.address}&role=incoming`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setFilteredRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const t = setInterval(fetchRequests, 5000);
    return () => clearInterval(t);
  }, [account?.address]);

  // --- SEARCH USERS (like PayPage) ---
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
    } catch (e) {
      console.error("Search error:", e);
    }
  };

  // When user selects a user from dropdown
  const handleSelectUser = (user: User) => {
    setSearchText(`@${user.name}`);
    setShowSuggestions(false);

    // Filter requests by requester wallet
    const filtered = requests.filter(
      (r) => r.requesterAddress.toLowerCase() === user.walletAddress.toLowerCase()
    );

    setFilteredRequests(filtered);
  };

  // When search text is cleared → show all requests
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredRequests(requests);
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      searchUsers(searchText);
    }
  }, [searchText]);

  // Accept Request
  const acceptRequest = async (r: Req) => {
    if (!signAndSubmitTransaction) return toast.error("Wallet not connected");

    try {
      const txPayload: InputTransactionData = {
        data: {
          function: "0x1::coin::transfer",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [r.requesterAddress, r.amount],
        },
      };

      toast.info("Signing transaction...");
      const submitted = await signAndSubmitTransaction(txPayload);
      const txHash = submitted.hash;

      toast.info("Waiting for confirmation...");
      await aptos.waitForTransaction({ transactionHash: txHash });

      await fetch(`/api/requests/${r.requestId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash,
          payerAddress: account?.address,
        }),
      });

      toast.success("Paid successfully!");
      fetchRequests();
    } catch (e) {
      console.error(e);
      toast.error("Payment failed");
    }
  };

  if (!connected) return <div>Please connect wallet</div>;

  return (
    <div className="p-4 bg-white text-black rounded-xl shadow space-y-3">
      <h3 className="font-semibold">Incoming Requests</h3>

      {/* SEARCH BAR */}
      <input
        className="w-full text-black p-2 border rounded"
        placeholder="Search requester ( @username )"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onFocus={() => searchUsers(searchText)}
      />

      {/* Suggestion Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="w-full bg-white border rounded shadow absolute z-50 mt-1">
          {suggestions.map((user) => (
            <div
              key={user.walletAddress}
              className="p-2 text-black hover:bg-emerald-100 cursor-pointer"
              onClick={() => handleSelectUser(user)}
            >
              <div className="font-medium">@{user.name}</div>
              <div className="text-xs font-mono text-gray-600">{user.walletAddress}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <div>Loading...</div>}
      {!loading && filteredRequests.length === 0 && <div>No requests found</div>}

      <div className="space-y-2">
        {filteredRequests.map((r) => (
          <div key={r.requestId} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{r.requesterName || r.requesterAddress}</div>
              <div className="text-sm font-mono">{r.requesterAddress}</div>
              <div className="text-sm">
                Amount: {r.amountInHuman ?? Number(r.amount) / 1e8} APT
              </div>
              {r.memo && <div className="text-xs italic">{r.memo}</div>}
            </div>

            <button
              onClick={() => acceptRequest(r)}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Pay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
