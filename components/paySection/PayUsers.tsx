// app/pay/page.tsx
"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/models";
import { toast } from "react-toastify";

import MakePaymentForm from "@/components/MakePaymentForm";
import UserRegistrationModal from "@/components/UserRegistrationModal";

import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

import { aptos } from "@/lib/aptos";

export default function PayPage() {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const { account, connected, signAndSubmitTransaction } = useWallet();

  // ------------------------------
  // Fetch user from DB
  // ------------------------------
  const fetchCurrentUser = async () => {
    if (!connected || !account?.address) return;

    setCheckingUser(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      console.log("Fetched users data:", data);
      if (data.success) {
        const user = data.users.find(
          (u: any) =>
            u.walletAddress.toLowerCase() ===
            account.address.toString().toLowerCase()
        );

        setCurrentUser(user);
        setShowRegistrationModal(!user);
      }
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setCheckingUser(false);
    }
  };

  // Load user on wallet connect
  useEffect(() => {
    fetchCurrentUser();
  }, [account?.address, connected]);

  // ------------------------------
  // Wallet not connected
  // ------------------------------
  if (!connected || !account?.address) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <h2 className="text-xl">Please connect your wallet</h2>
      </div>
    );
  }

  // ------------------------------
  // User loading
  // ------------------------------
  if (checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-300">
        Checking user...
      </div>
    );
  }

  // ------------------------------
  // Main Page
  // ------------------------------
  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        <MakePaymentForm
          onPaymentComplete={async (recipient: User, amount: string) => {
            if (!recipient || !recipient.walletAddress) {
              toast.error("Invalid recipient");
              return;
            }

            if (!signAndSubmitTransaction) {
              toast.error("Wallet not connected");
              return;
            }

            const octas = Math.floor(Number(amount) * 1e8);
            let txHash: string | null = null;

            try {
              // Transaction Payload
              const txPayload: InputTransactionData = {
                data: {
                  function: "0x1::coin::transfer",
                  typeArguments: ["0x1::aptos_coin::AptosCoin"],
                  functionArguments: [recipient.walletAddress, octas],
                },
              };

              // Send transaction
              const submittedTx = await signAndSubmitTransaction(txPayload);
              txHash = submittedTx.hash;

              // Wait for confirmation
              await aptos.waitForTransaction({ transactionHash: txHash });

              // Save success in DB
              await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                 senderAddress: account.address.toString(),
                  senderName: currentUser?.name || "Unknown",
                  receiverAddress: recipient.walletAddress,
                  receiverName: recipient.name,
                  amount: octas.toString(),
                  amountInEth: amount,
                  transactionHash: txHash,
                  status: "success",
                }),
              });

              toast.success("Payment sent successfully!");
            } catch (error) {
              console.error("Payment error:", error);

              // Save failed transaction in DB
              await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  senderAddress: account.address.toString(),
                  senderName: currentUser?.name || "Unknown",
                  receiverAddress: recipient.walletAddress,
                  receiverName: recipient.name,
                  amount: octas.toString(),
                  amountInEth: amount,
                  transactionHash: txHash ?? "NO_HASH",
                  status: "failed",
                }),
              });

              toast.error("Payment failed!");
            }
          }}
        />
      </div>

      {/* Registration Modal */}
      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onComplete={fetchCurrentUser}
        walletAddress={account.address.toString()}
      />
    </div>
  );
}
