// app/api/payments/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "../../../lib/mongodb";
import Payment from "../../../Models/Payment";

export async function POST(req: Request) {
  try {
    await connectMongoose();
    const body = await req.json();

    const payment = await Payment.create({
      senderAddress: body.senderAddress.toLowerCase(),
      senderName: body.senderName,
      receiverAddress: body.receiverAddress.toLowerCase(),
      receiverName: body.receiverName,
      amount: body.amount,
      amountInEth: body.amountInEth,
      transactionHash: body.transactionHash,
      status: body.status,
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save payment" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectMongoose();

    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address)
      return NextResponse.json({ success: true, payments: [] });

    const normalizedAddress = address.toLowerCase();

    const payments = await Payment.find({
      $or: [
        { senderAddress: normalizedAddress },
        { receiverAddress: normalizedAddress },
      ],
    }).sort({ createdAt: -1 });

    // Ensure amountInEth exists
    const cleaned = payments.map((p) => {
      const obj = p.toObject();
      return {
        ...obj,
        amountInEth:
          obj.amountInEth ??
          (Number(obj.amount) / 1e8).toString(), // fallback conversion
      };
    });

    return NextResponse.json({
      success: true,
      payments: cleaned,
    });
  } catch (err) {
    console.error("GET /api/payments error:", err);
    return NextResponse.json(
      { success: false, error: "Fetch error" },
      { status: 500 }
    );
  }
}
