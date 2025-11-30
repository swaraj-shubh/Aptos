"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/models";
import RecipientSelector from "./RecipientSelector";
import AmountInput from "./AmountInput";
import PaymentModal from "./PaymentModal";
import ScanQR from "./ScanQR";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "react-toastify";

interface MakePaymentFormProps {
  users?: User[];
  onPaymentComplete: (recipient: User, amount: string, memo?: string) => Promise<void>;
  preselectedRecipient?: User | null;
}

export default function MakePaymentForm({
  users,
  onPaymentComplete,
  preselectedRecipient,
}: MakePaymentFormProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(
    preselectedRecipient ?? null
  );
  const [amount, setAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useWallet();

  // QR Scanner states
  const [scannedData, setScannedData] = useState<{
    username: string;
    walletAddress: string;
  } | null>(null);

  const [showScanner, setShowScanner] = useState(false);

  // ------------------------------
  // HANDLE QR SCAN
  // ------------------------------
  const handleQRScanned = (data: { username: string; walletAddress: string }) => {
    setScannedData(data);
    setShowScanner(false);

    const scannedUser: User = {
      walletAddress: data.walletAddress.startsWith("0x")
        ? data.walletAddress
        : `0x${data.walletAddress}`,
      name: data.username.replace("@", ""),
    };

    setSelectedRecipient(scannedUser);
  };

  // ------------------------------
  // Fetch actual DB user if scanned
  // ------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      if (!scannedData) return;

      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        if (data.success) {
          const username = scannedData.username.replace("@", "");
          const found =
            data.users.find((u: User) => u.name.toLowerCase() === username.toLowerCase()) ||
            data.users.find(
              (u: User) =>
                u.walletAddress.toLowerCase() ===
                scannedData.walletAddress.toLowerCase()
            );

          setSelectedRecipient(
            found || {
              walletAddress: scannedData.walletAddress,
              name: username,
            }
          );
        }
      } catch {
        setSelectedRecipient({
          walletAddress: scannedData.walletAddress,
          name: scannedData.username.replace("@", ""),
        });
      }
    };

    fetchUser();
  }, [scannedData]);

  // ------------------------------
  // Payment UI flow
  // ------------------------------
  const handleMakePayment = () => {
    if (!selectedRecipient || !amount) {
      toast.error("Please select a recipient & enter an amount");
      return;
    }
    setShowPaymentModal(true);
  };

  // ------------------------------
  // CONFIRM PAYMENT (now supports memo + on-chain)
  // ------------------------------
  const confirmPayment = async (memo?: string) => {
    if (!selectedRecipient || !amount) return;
    setIsLoading(true);

    try {
      // Execute the full on-chain payment flow
      await onPaymentComplete(selectedRecipient, amount, memo ?? "payment");

      // Reset UI after successful payment
      setSelectedRecipient(null);
      setAmount("");
      setScannedData(null);
      setShowPaymentModal(false);

    } catch (err) {
      console.error("confirmPayment error:", err);
      toast.error("Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <>
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white/90 rounded-2xl p-8 shadow">
          <h2 className="text-3xl font-bold text-emerald-900 text-center mb-6">
            Send Payment
          </h2>

          <div className="space-y-6">
            <RecipientSelector
              users={users || []}
              currentUserAddress={account?.address?.toString()}
              onRecipientSelect={setSelectedRecipient}
              selectedRecipient={selectedRecipient}
            />

            <AmountInput amount={amount} onAmountChange={setAmount} />

            {/* QR Scan Button */}
            <div className="flex justify-center">
              {!showScanner && (
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                >
                  📷 Scan QR Code
                </button>
              )}
            </div>

            <button
              onClick={handleMakePayment}
              disabled={!selectedRecipient || !amount}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <ScanQR onQRScanned={handleQRScanned} onCancel={() => setShowScanner(false)} />
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRecipient && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          recipient={selectedRecipient}
          amount={amount}
          isLoading={isLoading}
          onConfirm={confirmPayment} // ⭐ NOW SUPPORTS memo + on-chain
        />
      )}
    </>
  );
}
