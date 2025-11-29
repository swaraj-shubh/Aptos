import { useState } from "react";
import { User } from "@/types/models";
import RecipientSelector from "./RecipientSelector";
import AmountInput from "./AmountInput";
import PaymentModal from "./PaymentModal";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface MakePaymentFormProps {
  users?: User[];
  onPaymentComplete: (recipient: User, amount: string) => Promise<void>;
}

export default function MakePaymentForm({
  users,
  onPaymentComplete,
}: MakePaymentFormProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useWallet();

  const handleMakePayment = () => {
    if (!selectedRecipient || !amount) return;
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedRecipient || !amount) return;
    setIsLoading(true);

    try {
      await onPaymentComplete(selectedRecipient, amount);
      setSelectedRecipient(null);
      setAmount("");
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Payment failed:", error);
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

            <button
              onClick={handleMakePayment}
              disabled={!selectedRecipient || !amount}
              className="w-full py-4 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>

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
