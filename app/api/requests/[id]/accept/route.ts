// app/api/requests/[id]/accept/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Request from "@/Models/Request";
// Import your Payment model (using the complex one you provided earlier)
import Payment from "@/Models/PaymentModel"; 

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoose();
    const body = await req.json();
    const { txHash, payerAddress } = body;
    const id = params.id;

    if (!txHash) {
      return NextResponse.json({ success: false, error: "Missing txHash" }, { status: 400 });
    }

    // 1. Update the Request Status
    const r = await Request.findOne({ requestId: id });
    if (!r) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    r.status = "paid";
    r.txHash = txHash;
    if (payerAddress) r.payerAddress = payerAddress.toLowerCase();
    await r.save();

    // 2. Create Transaction History (Payment Model)
    // We map Requester -> Receiver and Payer -> Sender
    await Payment.create({
      senderAddress: r.payerAddress,
      senderName: r.payerName || "Unknown",
      receiverAddress: r.requesterAddress,
      receiverName: r.requesterName || "Unknown",
      amount: r.amount, // octas
      amountInEth: r.amountInHuman, // display amount
      expirationTimestamp: 0, // Completed immediately
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
