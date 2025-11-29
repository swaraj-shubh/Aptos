// Models/Request.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRequest extends Document {
  requestId: string;
  requesterAddress: string;
  requesterName?: string;
  payerAddress?: string | null;
  payerName?: string | null;
  amount: string; 
  amountInHuman?: string;
  memo?: string;
  // Added 'rejected' to status
  status: "pending" | "paid" | "cancelled" | "rejected";
  txHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    requestId: { type: String, required: true, unique: true },
    requesterAddress: { type: String, required: true, lowercase: true },
    requesterName: { type: String },
    payerAddress: { type: String, lowercase: true },
    payerName: { type: String },
    amount: { type: String, required: true },
    amountInHuman: { type: String },
    memo: { type: String },
    // Updated enum to include 'rejected'
    status: { type: String, enum: ["pending", "paid", "cancelled", "rejected"], default: "pending" },
    txHash: { type: String },
  },
  { timestamps: true }
);

const Request: Model<IRequest> = mongoose.models.Request || mongoose.model("Request", RequestSchema);
export default Request;
