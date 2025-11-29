"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/types/models";
import { toast } from "react-toastify";

// Import all the components
import PaymentSidebar from "@/components/PaymentSidebar";
import MakePaymentForm from "@/components/MakePaymentForm";
import PaymentHistory from "@/components/paymentHistory/PaymentHistory";
import UserRegistrationModal from "@/components/UserRegistrationModal";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { aptos } from "@/lib/aptos";
import CONFIG from "@/config";

export default function PayPage() {
  const [activeTab, setActiveTab] = useState<"make" | "view">("make");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const maxRetries = 5;
  const [Recipient, setRecipient] = useState(
    "0x47c78c44ae575e4e387b756be0bdcf9ab3e50b91a2d40087581045e11cd782ef"
  );

  const fetchCurrentUser = async (isRetry = false) => {
    console.log("Fetching current user...", {
      address: account?.address,
      connected,
      hasCheckedUser,
      isRetry,
    });
    if (!account?.address || !connected || hasCheckedUser) return;

    // Only show spinner on first attempt, not on retries
    if (!isRetry) {
      setCheckingUser(true);
    }

    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      if (data.success) {
        const user = data.users.find(
          (u: any) =>
            u.walletAddress.toLowerCase() === account?.address?.toString()
        );
        setCurrentUser(user);
        setHasCheckedUser(true);
        setRetryCount(0); // Reset retry count on success

        if (!user) {
          // User not found, show registration modal
          setShowRegistrationModal(true);
        } else {
          // User found, close registration modal if it's open
          setShowRegistrationModal(false);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      if (!isRetry) {
        setCheckingUser(false);
      }
    } finally {
      if (!isRetry) {
        setCheckingUser(false);
      }
    }
  };

  useEffect(() => {
    if (connected && account?.address && !hasCheckedUser) {
      console.log("PayUsers: Wallet connected with address, fetching user...");
      fetchCurrentUser();
    }
  }, [connected, account?.address, hasCheckedUser]);

  // Reset hasCheckedUser when address changes (wallet switch)
  useEffect(() => {
    if (account?.address) {
      console.log("PayUsers: Address changed, resetting user check flag");
      setHasCheckedUser(false);
      setRetryCount(0);
      // Close registration modal when switching wallets
      setShowRegistrationModal(false);
    }
  }, [account?.address]);

  // Retry mechanism for when address might be undefined initially
  useEffect(() => {
    if (
      connected &&
      !account?.address &&
      !hasCheckedUser &&
      retryCount < maxRetries
    ) {
      const retryTimer = setTimeout(() => {
        console.log(
          `Retrying user check (attempt ${retryCount + 1}/${maxRetries})`
        );
        setRetryCount((prev) => prev + 1);
        // Try to fetch user again
        if (account?.address) {
          fetchCurrentUser(true);
        }
      }, 1000 * (retryCount + 1)); // Increasing delay: 1s, 2s, 3s, 4s, 5s

      return () => clearTimeout(retryTimer);
    }
  }, [connected, account?.address, hasCheckedUser, retryCount, maxRetries]);

  const handleRegistrationComplete = async () => {
    setShowRegistrationModal(false);
    // Reset the check flag and refresh user data
    setHasCheckedUser(false);
    setRetryCount(0); // Reset retry count

    // Dispatch event to refresh Header user data
    window.dispatchEvent(new CustomEvent("refreshHeaderUser"));

    if (account?.address) {
      console.log("Registration completed, fetching user again...");
      await fetchCurrentUser();
    }
  };

  if (!connected || !account?.address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">SecurePay</h2>
          <p className="text-slate-300 mb-6">
            Please connect your wallet using the button in the navbar above
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while checking user (only on first attempt)
  if (checkingUser && retryCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Checking user status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar with tab switching */}
      {/* <PaymentSidebar activeTab={activeTab} onTabChange={setActiveTab} /> */}

      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
        {activeTab === "make" ? (
          <div className="flex items-center justify-center h-full w-full">
            <MakePaymentForm
              onPaymentComplete={async (
                recipient: User,
                amount: string,
                expirationHours: string
              ) => {
                let paymentId: string | null = null;
                if (!account || !signAndSubmitTransaction) {
                  throw new Error("Wallet not connected");
                }

                const time = await aptos.view({
                  payload: {
                    function: `${CONFIG.MODULE_ADDRESS}::hello::current_time`,
                    typeArguments: [],
                  },
                });
                const expirationTimestamp =
                  Math.floor(Date.now() / 1000) +
                  Number(expirationHours) * 3600;
                const txTime = Number(time[0]) + Number(expirationHours) * 3600;

                //testing for reversible payment 
                // const txTime = Number(time[0]) + Number(expirationHours)*60; 

                console.log("Current time from chain:", time[0], "Calculated txTime:", txTime);
                const txAmount = Math.floor(Number(amount) * 1e8); // Convert to smallest unit

                const transaction: InputTransactionData = {
                  data: {
                    function: `${CONFIG.MODULE_ADDRESS}::escrow_vault::deposit`,
                    functionArguments: [
                      recipient?.walletAddress || Recipient,
                      txTime,
                      txAmount,
                    ],
                  },
                };

                try {
                  const transactionResponse = await signAndSubmitTransaction(
                    transaction
                  );
                  console.log("Transaction submitted:", transactionResponse);
                  
                  const result = await aptos.waitForTransaction({
                    transactionHash: transactionResponse.hash,
                  });
                  console.log("Transaction confirmed:", result);

                  console.log(
                    "Current user:",
                    JSON.stringify({
                      senderAddress: account?.address?.toString(),
                      senderName: currentUser?.name || "Unknown",
                      receiverAddress: recipient.walletAddress,
                      receiverName: recipient.name,
                      amount: txAmount,
                      amountInEth: amount,
                      expirationTimestamp,
                      transactionHash: result.hash, // Placeholder until we get real hash
                    })
                  );

                  // Save payment record to database first
                  const paymentResponse = await fetch("/api/payments", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      senderAddress: account?.address?.toString(),
                      senderName: currentUser?.name || "Unknown",
                      receiverAddress: recipient.walletAddress,
                      receiverName: recipient.name,
                      amount: txAmount.toString(),
                      amountInEth: amount,
                      expirationTimestamp,
                      transactionHash: result.hash, // Placeholder until we get real hash
                    }),
                  });

                  const paymentData = await paymentResponse.json();

                  if (!paymentData.success) {
                    throw new Error("Failed to save payment record");
                  }

                  toast.success("Payment sent successfully!");
                } catch (err) {
                  console.error("Payment failed with detailed error:", {
                    error: err,
                    errorMessage:
                      err instanceof Error ? err.message : "Unknown error",
                    errorStack: err instanceof Error ? err.stack : undefined,
                    errorName: err instanceof Error ? err.name : "Unknown",
                    paymentId,
                    recipient: recipient?.walletAddress,
                    amount: amount,
                    expirationHours, // Placeholder until we get real hash
                  });

                  // Update payment status to failed if we have a payment ID
                  if (paymentId) {
                    try {
                      console.log(
                        "Updating payment status to failed for payment ID:",
                        paymentId
                      );
                      await fetch("/api/payments/update-status", {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          paymentId,
                          status: "failed",
                        }),
                      });
                      console.log(
                        "Payment status updated to failed successfully"
                      );
                    } catch (updateErr) {
                      console.error("Failed to update payment status:", {
                        updateError: updateErr,
                        updateErrorMessage:
                          updateErr instanceof Error
                            ? updateErr.message
                            : "Unknown update error",
                        paymentId,
                      });
                    }
                  }

                  toast.error("Payment failed. Check console for details.");
                }
              }}
            />
          </div>
        ) : (
          <PaymentHistory userAddress={account?.address?.toString()} />
        )}
      </div>

      {/* User Registration Modal */}
      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onComplete={handleRegistrationComplete}
        walletAddress={account?.address?.toString()}
      />
    </div>
  );
}
