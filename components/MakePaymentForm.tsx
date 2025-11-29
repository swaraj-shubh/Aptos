"use client";
import { useState, useEffect } from "react";
import { User } from "@/types/models";
import RecipientSelector from "./RecipientSelector";
import AmountInput from "./AmountInput";
import PaymentModal from "./PaymentModal";
import ScanQR from "./ScanQR";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface MakePaymentFormProps {
  users?: User[];
  onPaymentComplete: (recipient: User, amount: string) => Promise<void>;
  preselectedRecipient?: User | null;
}

export default function MakePaymentForm({
  users,
  onPaymentComplete,
  preselectedRecipient,
}: MakePaymentFormProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useWallet();

  // QR Scanner States
  const [scannedData, setScannedData] = useState<{
    username: string;
    walletAddress: string;
  } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // After QR Scan
  const handleQRScanned = (data: { username: string; walletAddress: string }) => {
    console.log("📌 Scanned Data:", data);
    setScannedData(data);
    setShowScanner(false);

    const scannedUser: Partial<User> = {
      walletAddress: data.walletAddress,
      name: data.username.replace("@", ""),
    };
    setSelectedRecipient(scannedUser as User);
  };

  // Fetch actual user from DB when scanning
  useEffect(() => {
    const fetchUser = async () => {
      if (!scannedData) return;

      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        if (data.success) {
          const usernameWithoutAt = scannedData.username.replace("@", "");
          const foundUser =
            data.users.find((u: User) => u.name.toLowerCase() === usernameWithoutAt.toLowerCase()) ||
            data.users.find((u: User) => u.walletAddress.toLowerCase() === scannedData.walletAddress.toLowerCase());

          setSelectedRecipient(
            foundUser || ({
              walletAddress: scannedData.walletAddress,
              name: usernameWithoutAt,
            } as User)
          );
        }
      } catch {
        setSelectedRecipient({
          walletAddress: scannedData.walletAddress,
          name: scannedData.username.replace("@", ""),
        } as User);
      }
    };

    fetchUser();
  }, [scannedData]);

  const handleMakePayment = () => {
    if (!selectedRecipient || !amount) return;
    setShowPaymentModal(true);
  };

  /**
   * 🔥 UPDATED: Payment + Photon Reward Trigger
   */
  const confirmPayment = async () => {
    if (!selectedRecipient || !amount) return;
    setIsLoading(true);

    try {
      // 1️⃣ Execute on-chain payment
      await onPaymentComplete(selectedRecipient, amount);

      // 2️⃣ Call Reward API AFTER payment success
      await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account?.address?.toString(),
          eventType: "PAYMENT_COMPLETED",
          campaignId: "PAYMENT_REWARD_CAMPAIGN", // <-- replace with your Photon campaign ID
          metadata: {
            amount,
            to: selectedRecipient.walletAddress,
            username: selectedRecipient.name,
          },
        }),
      });

      // 3️⃣ Reset UI states
      setSelectedRecipient(null);
      setAmount("");
      setScannedData(null);
      setShowPaymentModal(false);
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* QR Button */}
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
          <ScanQR
            onQRScanned={handleQRScanned}
            onCancel={() => setShowScanner(false)}
          />
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
          onConfirm={confirmPayment}
        />
      )}
    </>
  );
}
