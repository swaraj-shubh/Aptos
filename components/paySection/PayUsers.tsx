"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types/models";
import { toast } from "react-toastify";

import MakePaymentForm from "@/components/MakePaymentForm";
import UserRegistrationModal from "@/components/UserRegistrationModal";

import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { aptos } from "@/lib/aptos";

// ------------------------------
// On-chain module constants
// ------------------------------
const MODULE_ADDRESS =
  "0xf655c6a050b44ce83e1bca5ad7207b9c50ee847f69cfc5cfdfb4f7d409b1463a";
const MODULE_NAME = "payments_v0";

const FUNCTION_PATH = `${MODULE_ADDRESS}::${MODULE_NAME}::send_payment`;
const GET_NEXT_ID_PATH = `${MODULE_ADDRESS}::${MODULE_NAME}::get_next_id`;
const GET_PAYMENT_AMOUNT = `${MODULE_ADDRESS}::${MODULE_NAME}::get_payment_amount`;
const GET_PAYMENT_RECIPIENT = `${MODULE_ADDRESS}::${MODULE_NAME}::get_payment_recipient`;
const GET_PAYMENT_MEMO = `${MODULE_ADDRESS}::${MODULE_NAME}::get_payment_memo`;
const GET_PAYMENT_STATUS = `${MODULE_ADDRESS}::${MODULE_NAME}::get_payment_status`;

export default function PayPage() {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const { account, connected, signAndSubmitTransaction } = useWallet();

  // Standard format for Aptos addresses
  const normalizeAddress = (addr?: string) => {
    if (!addr) return addr;
    const cleaned = addr.trim().toLowerCase();
    return cleaned.startsWith("0x") ? cleaned : `0x${cleaned}`;
  };

  // ------------------------------
  // Fetch user from DB
  // ------------------------------
  const fetchCurrentUser = async () => {
    if (!connected || !account?.address) return;
    setCheckingUser(true);

    try {
      const res = await fetch("/api/users");
      const data = await res.json();

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
      console.error("[fetchCurrentUser] error:", err);
      toast.error("Failed to load user data");
    }

    setCheckingUser(false);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [account?.address, connected]);

  // ------------------------------
  // MEMO DECODING
  // ------------------------------
  const decodeMemo = (raw: any): string => {
    try {
      if (typeof raw === "string") {
        const hex = raw.startsWith("0x") ? raw.slice(2) : raw;
        const bytes = new Uint8Array(
          hex.match(/.{1,2}/g)?.map((x) => parseInt(x, 16)) || []
        );
        return new TextDecoder().decode(bytes);
      }

      if (Array.isArray(raw)) {
        return new TextDecoder().decode(new Uint8Array(raw));
      }

      if (raw instanceof Uint8Array) {
        return new TextDecoder().decode(raw);
      }

      return JSON.stringify(raw);
    } catch {
      return String(raw);
    }
  };

  // ------------------------------
  // MAIN PAYMENT FUNCTION
  // ------------------------------
  const onPaymentComplete = async (
    recipient: User,
    amount: string,
    memo = "payment"
  ) => {
    const wallet = account?.address?.toString();
    if (!wallet) throw new Error("Wallet not connected");

    const senderAddr = normalizeAddress(wallet);
    const recipientAddr = normalizeAddress(recipient.walletAddress);

    if (!recipientAddr || !recipientAddr.startsWith("0x"))
      throw new Error("Invalid recipient address");

    if (!amount || Number(amount) <= 0) throw new Error("Invalid amount");

    // Convert APT → Octas
    const octas = Math.floor(Number(amount) * 1e8);

    // Encode memo
    const memoBytes = new TextEncoder().encode(memo);

    let txHash: string | null = null;

    try {
      // ------------------------------
      // 1) SUBMIT ON-CHAIN TRANSACTION
      // ------------------------------
      const txPayload: InputTransactionData = {
        data: {
          function: FUNCTION_PATH,
          typeArguments: [],
          functionArguments: [recipientAddr, octas, memoBytes],
        },
      };

      const submittedTx = await signAndSubmitTransaction(txPayload);
      txHash = submittedTx.hash;
      console.log("TX SUBMITTED:", txHash);

      await aptos.waitForTransaction({ transactionHash: txHash });

      // ------------------------------
      // 2) VERIFY ON-CHAIN STORAGE
      // ------------------------------
      try {
        const nextIdRes = await aptos.view({
          payload: {
            function: GET_NEXT_ID_PATH,
            typeArguments: [],
            functionArguments: [senderAddr],
          },
        });

        const nextId = Number(nextIdRes[0]);
        const lastId = nextId - 1;

        if (lastId >= 1) {
          const amountRes = await aptos.view({
            payload: {
              function: GET_PAYMENT_AMOUNT,
              typeArguments: [],
              functionArguments: [senderAddr, lastId],
            },
          });

          const recipientRes = await aptos.view({
            payload: {
              function: GET_PAYMENT_RECIPIENT,
              typeArguments: [],
              functionArguments: [senderAddr, lastId],
            },
          });

          const memoRes = await aptos.view({
            payload: {
              function: GET_PAYMENT_MEMO,
              typeArguments: [],
              functionArguments: [senderAddr, lastId],
            },
          });

          const statusRes = await aptos.view({
            payload: {
              function: GET_PAYMENT_STATUS,
              typeArguments: [],
              functionArguments: [senderAddr, lastId],
            },
          });

          console.log(
            `[ON-CHAIN PAYMENT]
             ID: ${lastId}
             amount: ${amountRes[0]}
             recipient: ${recipientRes[0]}
             status: ${statusRes[0]}
             memo: ${decodeMemo(memoRes[0])}`
          );

          toast.success(`On-chain payment verified: ID ${lastId}`);
        }
      } catch (err) {
        console.warn("On-chain verification failed:", err);
      }

      // ------------------------------
      // 3) SAVE DB RECORD
      // ------------------------------
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: senderAddr,
          senderName: currentUser?.name ?? "Unknown",
          receiverAddress: recipientAddr,
          receiverName: recipient.name,
          amount: octas.toString(),
          amountInEth: amount,
          transactionHash: txHash,
          status: "success",
        }),
      });

      // ------------------------------
      // 4) FIRE PHOTON REWARD
      // ------------------------------
      await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: senderAddr,
          eventType: "PAYMENT_COMPLETED",
          campaignId: "PAYMENT_REWARD_CAMPAIGN",
          metadata: {
            amount,
            to: recipientAddr,
            username: recipient.name,
            txHash,
          },
        }),
      });

      toast.success("Payment complete!");
    } catch (err: any) {
      console.error("Payment error:", err);

      // ------------------------------
      // LOG FAILURE IN DB
      // ------------------------------
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: senderAddr,
          senderName: currentUser?.name ?? "Unknown",
          receiverAddress: recipientAddr,
          receiverName: recipient.name,
          amount: octas.toString(),
          amountInEth: amount,
          transactionHash: txHash ?? "NO_HASH",
          status: "failed",
        }),
      });

      toast.error(`Payment failed: ${err.message}`);
      throw err;
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  if (!connected || !account?.address)
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Please connect your wallet
      </div>
    );

  if (checkingUser)
    return (
      <div className="min-h-screen flex justify-center items-center text-slate-300">
        Checking user...
      </div>
    );

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        <MakePaymentForm onPaymentComplete={onPaymentComplete} />
      </div>

      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onComplete={fetchCurrentUser}
        walletAddress={account.address.toString()}
      />
    </div>
  );
}
