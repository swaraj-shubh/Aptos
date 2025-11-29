// app/api/requests/[id]/accept/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Request from "@/Models/Request"; // Your Request Model
import Payment from "@/Models/PaymentModel"; // 🔥 Your Payment History Model

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoose();
    const body = await req.json();
    const { txHash, payerAddress } = body;
    const id = params.id;

    if (!txHash) {
      return NextResponse.json({ success: false, error: "Missing txHash" }, { status: 400 });
    }

    // 1. Find the Request
    const r = await Request.findOne({ requestId: id });
    if (!r) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // 2. Update Request Status
    r.status = "paid";
    r.txHash = txHash;
    if (payerAddress) r.payerAddress = payerAddress.toLowerCase();
    await r.save();

    // 3. 🔥 SAVE TO PAYMENT HISTORY 🔥
    // This ensures it shows up in your "Transaction History" tab
    await Payment.create({
      senderAddress: r.payerAddress,       // The person who paid (You)
      senderName: r.payerName || "You",
      receiverAddress: r.requesterAddress, // The person who asked (Them)
      receiverName: r.requesterName || "Unknown",
      amount: r.amount,                    // Amount in Octas
      amountInEth: r.amountInHuman,        // Readable amount (e.g. 0.1)
      expirationTimestamp: 0,              // Instant payment, no expiry needed
      status: "completed",
      transactionHash: txHash,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, request: r });
  } catch (err) {
    console.error("Accept request error:", err);
    return NextResponse.json({ success: false, error: "Internal" }, { status: 500 });
  }
}
