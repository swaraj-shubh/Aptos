"use client";

import { useState, useEffect } from "react";
import UserRegistrationModal from "@/components/UserRegistrationModal";
import GetQR from "../GetQr";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

/**
 * ReceivePage
 * - fetches current user from /api/users when wallet connects
 * - compares addresses case-insensitively
 * - shows registration modal if user not found
 * - renders GetQR with correct username (uses `name` field)
 */

export default function ReceivePage() {
  const { account, connected } = useWallet();

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  // Fetch current user from backend /api/users
  const fetchCurrentUser = async (isRetry = false) => {
    // require wallet address + connected
    if (!account?.address || !connected) return;
    // guard so we don't repeatedly fetch if already checked
    if (hasCheckedUser && !isRetry) return;

    if (!isRetry) setCheckingUser(true);

    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!data.success) {
        console.error("GET /api/users returned error:", data);
        return;
      }

      const normalizedAddress = account.address.toString().toLowerCase();
      const user = data.users.find(
        (u: any) =>
          typeof u.walletAddress === "string" &&
          u.walletAddress.toLowerCase() === normalizedAddress
      );

      setCurrentUser(user ?? null);
      setHasCheckedUser(true);
      setShowRegistrationModal(!user);
    } catch (err) {
      console.error("Error fetching current user:", err);
    } finally {
      if (!isRetry) setCheckingUser(false);
    }
  };

  // Run fetch when wallet connects or address changes
  useEffect(() => {
    if (connected && account?.address) {
      fetchCurrentUser();
    } else {
      // reset when disconnected or no address
      setCurrentUser(null);
      setHasCheckedUser(false);
      setShowRegistrationModal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, account?.address]);

  // handle registration completion: refetch user
  const handleRegistrationComplete = () => {
    setShowRegistrationModal(false);
    setHasCheckedUser(false);
    fetchCurrentUser();
    // notify other UI as before
    window.dispatchEvent(new CustomEvent("refreshHeaderUser"));
  };

  if (!connected || !account?.address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">SecurePay</h2>
          <p className="text-slate-300 mb-6">Please connect your wallet using the button in the navbar above</p>
        </div>
      </div>
    );
  }

  if (checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Checking user status...</p>
        </div>
      </div>
    );
  }

  // Show the QR + registration modal (if needed)
  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden items-start p-6">
      <div>
        <GetQR
          username={currentUser?.name ?? "guest"} // use `name` field from user doc
          walletAddress={account.address.toString()}
          size={200}
          showDetails={true}
        />
      </div>

      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onComplete={handleRegistrationComplete}
        walletAddress={account.address.toString()}
      />
    </div>
  );
}
