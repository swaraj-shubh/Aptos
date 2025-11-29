"use client";
import React, { useState, useEffect, useRef } from "react";
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
  const [resolvedWallet, setResolvedWallet] = useState(""); 
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SEARCH STATE
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users here
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Ref to handle clicking outside to close dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------
  // 1. FETCH USERS ONCE ON MOUNT
  // ------------------------------------------
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.success) {
          setAllUsers(data.users || []);
        }
      } catch (error) {
        console.error("Failed to load users for suggestions", error);
      }
    };
    loadUsers();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ------------------------------------------
  // 2. FILTER LOCALLY (INSTANT SEARCH)
  // ------------------------------------------
  useEffect(() => {
    const query = usernameOrAddress.trim().toLowerCase();

    // Reset if empty
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      setResolvedWallet("");
      return;
    }

    // A. Handle Wallet Address
    if (query.startsWith("0x")) {
      setShowSuggestions(false);
      setResolvedWallet(query.length > 20 ? usernameOrAddress : ""); // Valid length check
      return;
    }

    // B. Handle Username Search (@...)
    if (query.startsWith("@")) {
      const searchTerm = query.replace("@", "");
      
      if (searchTerm.length === 0) {
        setSuggestions([]);
        return;
      }

      // Filter from local cache (much faster than API calls)
      const matches = allUsers
        .filter((u) => u.name.toLowerCase().includes(searchTerm))
        .slice(0, 5); // Limit to top 5 results

      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [usernameOrAddress, allUsers]);

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
    if (!usernameOrAddress || !amount) return toast.error("Fill all fields");
    if (!resolvedWallet) return toast.error("Please select a valid username or enter a valid address");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterAddress: currentUser.walletAddress,
          requesterName: currentUser.name,
          payerAddress: resolvedWallet,
          payerName: usernameOrAddress.startsWith("@")
            ? usernameOrAddress.replace("@", "")
            : "Unknown", // Handle raw addresses
          amount,
          memo,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success("Request created successfully!");
      
      // Reset form
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
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 space-y-4 relative">
      <h3 className="text-gray-800 font-bold text-lg">Request Payment</h3>

      {/* SEARCH INPUT */}
      <div className="relative" ref={dropdownRef}>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Recipient</label>
        <input
          className="w-full text-gray-900 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          placeholder="@username or 0x123..."
          value={usernameOrAddress}
          onChange={(e) => setUsernameOrAddress(e.target.value)}
        />

        {/* SUGGESTIONS DROPDOWN */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl mt-2 shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((u) => (
              <div
                key={u.walletAddress}
                className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                onClick={() => handleSelectUser(u)}
              >
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs text-emerald-700">
                    {u.name[0].toUpperCase()}
                  </div>
                  @{u.name}
                </div>
                <div className="text-xs font-mono text-gray-400 ml-8 truncate">
                  {u.walletAddress}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AMOUNT */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount</label>
        <div className="relative">
          <input
            className="w-full text-gray-900 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="0.00"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="absolute right-4 top-3 text-gray-400 font-medium">APT</span>
        </div>
      </div>

      {/* MEMO */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Note (Optional)</label>
        <input
          className="w-full text-gray-900 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          placeholder="What is this for?"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {/* BUTTON */}
      <button
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        disabled={isSubmitting}
        onClick={createRequest}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating...
          </span>
        ) : (
          "Send Request"
        )}
      </button>
    </div>
  );
}
