"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ConnectionButton from "./ConnectionButton";
import {
  useWallet,
} from "@aptos-labs/wallet-adapter-react";

// export the current user to be used in other components if needed

export default function Header() {
  const { account, isLoading, connected, connect, disconnect } =
    useWallet();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const pathname = usePathname();
  const maxRetries = 5;
  console.log("CurrentUser in Header:", currentUser);
  console.log("Header render", account?.address?.toString(), connected);

  // import { useState } from "react";

  const fetchCurrentUser = async (isRetry = false) => {
    if (!account?.address) {
      console.log("No address available for user fetch");
      return;
    }

    // Only show retry indicator on actual retries, not initial attempts
    if (isRetry) {
      setIsRetrying(true);
    }

    try {
      console.log("Fetching current user...", { address: account?.address, isRetry, retryCount });
      const res = await fetch("/api/users");
      const data = await res.json();

      if (data.success) {
        console.log("Users data received:", data.users);
        const user = data.users.find(
          (u: any) => u.walletAddress.toLowerCase() === account?.address?.toString().toLowerCase()
        );
        setCurrentUser(user);
        console.log("Current user found:", user);

        // Reset retry count on success
        setRetryCount(0);
        setIsRetrying(false);
      } else {
        console.log("API call failed:", data.error);
        if (isRetry) {
          setIsRetrying(false);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      if (isRetry) {
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    if (connected && account?.address) {
      console.log("Header: Wallet connected with address, fetching user...");
      fetchCurrentUser();
    } else if (connected && !account?.address) {
      console.log(
        "Header: Wallet connected but address is undefined, will retry..."
      );
    }
  }, [connected, account?.address]);

  // Retry mechanism for when address might be undefined initially
  useEffect(() => {
    if (connected && !account?.address && retryCount < maxRetries) {
      const retryTimer = setTimeout(() => {
        console.log(
          `Header: Retrying user fetch (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );
        setRetryCount((prev) => prev + 1);
        // Try to fetch user again if address becomes available
        if (account?.address) {
          fetchCurrentUser(true);
        }
      }, 1000 * (retryCount + 1)); // Increasing delay: 1s, 2s, 3s, 4s, 5s

      return () => clearTimeout(retryTimer);
    }
  }, [connected, account?.address, retryCount, maxRetries]);

  // Listen for user registration completion to refetch user data
  useEffect(() => {
    const handleHeaderRefresh = () => {
      console.log("Header refreshing user data after registration...");
      // Reset retry count when manually refreshing
      setRetryCount(0);
      setIsRetrying(false);
      if (connected && account?.address) {
        fetchCurrentUser();
      }
    };

    window.addEventListener("refreshHeaderUser", handleHeaderRefresh);

    return () => {
      window.removeEventListener("refreshHeaderUser", handleHeaderRefresh);
    };
  }, [connected, account?.address]);

  return (
    <div className="bg-green-300 backdrop-blur-sm border-b border-emerald-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
<div className="flex items-center space-x-3">
  <Link href="/" className="flex items-center space-x-3 group">
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
        <img 
          src="../favicon.ico" 
          alt="AptoPay Logo" 
          className="w-6 h-6 filter brightness-0 invert"
        />
      </div>
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm group-hover:blur-md"></div>
    </div>
    
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-green-900 to-lime-700 bg-clip-text text-transparent group-hover:from-green-700 group-hover:to-emerald-800 transition-all duration-300">
        AptoPay
      </h1>
      <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
    </div>
  </Link>
</div>

        <div className="flex items-center space-x-4">
          {/* Retry indicator */}
          {isRetrying && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading user data...</span>
            </div>
          )}

          {pathname === "/pay" || pathname === "/receive" || pathname === "/hehe" ? (
            <>
              {connected && currentUser && (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-700/50 rounded-xl px-4 py-2 border border-slate-600/50">
                    <p className="text-white font-semibold text-base">
                      @{currentUser.name}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`@${currentUser.name}`);
                        // You could add a toast notification here
                      }}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}
              <ConnectionButton connect={() => connect("Petra")} disconnect={disconnect} isLoading={isLoading} connected={connected} />
            </>
          ) : connected && currentUser ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-700/50 rounded-xl px-4 py-2 border border-slate-600/50">
                <p className="text-white font-semibold text-base">
                  @{currentUser.name}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`@${currentUser.name}`);
                    // You could add a toast notification here
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </>
          ) : !connected ? (
            <button
              onClick={() => connect("Petra")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:scale-105"
            >
              Connect Wallet
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

