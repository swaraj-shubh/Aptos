import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Request from "@/Models/Request";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoose();
    const id = params.id;

    // Find and update status to 'rejected'
    // We use findOneAndUpdate to ensure atomic operation
    const r = await Request.findOneAndUpdate(
      { requestId: id },
      { status: "rejected" },
      { new: true }
    );

    if (!r) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: r });
  } catch (err) {
    console.error("Reject request error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}