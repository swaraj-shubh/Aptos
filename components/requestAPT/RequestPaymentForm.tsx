"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Props {
  currentUser: { walletAddress: string; name?: string } | null;
}

type User = {
  name: string;
  walletAddress: string;
};

export default function RequestPaymentForm({ currentUser }: Props) {
  const [usernameOrAddress, setUsernameOrAddress] = useState("");
  const [resolvedWallet, setResolvedWallet] = useState(""); // final wallet to send request to
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEARCH STATE
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ------------------------------------------
  // SEARCH USERS WHEN TYPING @username
  // ------------------------------------------
  const searchUsers = async (query: string) => {
    if (!query.startsWith("@") || query.length <= 1) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!data.success) return;

      const cleaned = query.replace("@", "").toLowerCase();

      const matches = data.users.filter((u: User) =>
        u.name.toLowerCase().includes(cleaned)
      );

      setSuggestions(matches);
      setShowSuggestions(true);
    } catch (e) {
      console.error("Search failed:", e);
    }
  };

  useEffect(() => {
    if (usernameOrAddress.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      setResolvedWallet("");
      return;
    }

    // If user types a valid wallet address, auto-resolve
    if (usernameOrAddress.startsWith("0x") && usernameOrAddress.length > 20) {
      setResolvedWallet(usernameOrAddress.trim());
      return;
    }

    searchUsers(usernameOrAddress);
  }, [usernameOrAddress]);

  // ------------------------------------------
  // USER SELECTS A USERNAME FROM DROPDOWN
  // ------------------------------------------
  const handleSelectUser = (user: User) => {
    setUsernameOrAddress("@" + user.name);
    setResolvedWallet(user.walletAddress);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // ------------------------------------------
  // CREATE REQUEST
  // ------------------------------------------
  const createRequest = async () => {
    if (!currentUser) return toast.error("Not authenticated");

    if (!usernameOrAddress || !amount)
      return toast.error("Fill all fields");

    if (!resolvedWallet)
      return toast.error("Please select a valid username");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterAddress: currentUser.walletAddress,
          requesterName: currentUser.name,
          payerAddress: resolvedWallet, // 🔥 always correct wallet
          payerName: usernameOrAddress.startsWith("@")
            ? usernameOrAddress.replace("@", "")
            : usernameOrAddress,
          amount,
          memo,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Request created!");

      setUsernameOrAddress("");
      setResolvedWallet("");
      setAmount("");
      setMemo("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-3 relative">
      <h3 className="text-black font-semibold">Request Payment</h3>

      {/* SEARCH INPUT */}
      <input
        className="w-full text-black p-2 border rounded"
        placeholder="Username or wallet (e.g. @alice or 0x123...)"
        value={usernameOrAddress}
        onChange={(e) => setUsernameOrAddress(e.target.value)}
        onFocus={() => usernameOrAddress.startsWith("@") && searchUsers(usernameOrAddress)}
      />

      {/* SUGGESTIONS DROPDOWN */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bg-white w-full border rounded mt-1 shadow z-20">
          {suggestions.map((u) => (
            <div
              key={u.walletAddress}
              className="p-2 hover:bg-emerald-100 cursor-pointer"
              onClick={() => handleSelectUser(u)}
            >
              <div className="font-medium">@{u.name}</div>
              <div className="text-xs font-mono text-gray-600">{u.walletAddress}</div>
            </div>
          ))}
        </div>
      )}

      {/* AMOUNT */}
      <input
        className="w-full text-black p-2 border rounded"
        placeholder="Amount (APT)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* MEMO */}
      <input
        className="w-full text-black p-2 border rounded"
        placeholder="Memo (optional)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* BUTTON */}
      <button
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors w-full font-semibold disabled:bg-emerald-300 cursor-pointer"
        disabled={isSubmitting}
        onClick={createRequest}
      >
        {isSubmitting ? "Creating..." : "Create Request"}
      </button>
    </div>
  );
}
