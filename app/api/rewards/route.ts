/** Enable Node.js runtime */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { User } from "@/Models/UserModel";
import { connectMongoose } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectMongoose();

    const { walletAddress, eventType, campaignId, metadata } = await req.json();

    if (!walletAddress || !eventType || !campaignId) {
      return NextResponse.json(
        { success: false, error: "Missing required params" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user || !user.photonUserId) {
      return NextResponse.json(
        { success: false, error: "User not registered with Photon" },
        { status: 404 }
      );
    }

    const eventBody = {
      event_id: `${eventType}-${Date.now()}`,
      event_type: eventType,
      client_user_id: user.photonUserId,
      campaign_id: campaignId,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    const photonRes = await fetch(
      "https://stage-api.getstan.app/identity-service/api/v1/attribution/events/campaign",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.PHOTON_API_KEY!,
        },
        body: JSON.stringify(eventBody),
      }
    );

    const data = await photonRes.json();

    if (!photonRes.ok) {
      console.error("Photon Reward Error:", data);
      return NextResponse.json(
        { success: false, error: "Photon reward failed", details: data },
        { status: 500 }
      );
    }

    // OPTIONAL: save reward to user profile
    user.rewards = user.rewards || [];
    user.rewards.push({
      eventType,
      timestamp: new Date(),
      reward: data, // photon reward response
    });

    await user.save();

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Reward API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
