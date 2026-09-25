import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/guard";

// GET /api/admin/users?status=pending|confirmed|rejected&active=true|false
export async function GET(req) {
  await connectDB();
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const paymentStatus = searchParams.get("status");
  const active = searchParams.get("active");

  const filter = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (active !== null && active !== undefined && active !== "") {
    filter.subscriptionActive = active === "true";
  }

  const users = await User.find(filter)
    .select("-password -otpCode -otpExpiry")
    .populate("planId")
    .sort({ createdAt: -1 });

  return Response.json({ users });
}
