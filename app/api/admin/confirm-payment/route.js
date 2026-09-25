import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/guard";
import { sendAccountActivatedEmail } from "@/lib/otp";

// GET: قائمة الدفعات المعلقة (Admin فقط)
export async function GET(req) {
  await connectDB();
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  const pendingUsers = await User.find({ paymentStatus: "pending", isVerified: true })
    .populate("planId")
    .sort({ createdAt: -1 });

  return Response.json({ users: pendingUsers });
}

// POST: تأكيد/رفض دفعة معينة
export async function POST(req) {
  try {
    await connectDB();
    const { errorResponse } = requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { userId, action } = await req.json(); // action: "confirm" | "reject"

    const user = await User.findById(userId).populate("planId");
    if (!user) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (action === "confirm") {
      const plan = user.planId;
      user.paymentStatus = "confirmed";
      user.subscriptionActive = true;
      user.subscriptionStart = new Date();
      user.subscriptionEnd = new Date(
        Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
      );
      await user.save();
      await sendAccountActivatedEmail(user.email);
      return Response.json({ message: "تم تفعيل اشتراك المستخدم" });
    }

    if (action === "reject") {
      user.paymentStatus = "rejected";
      await user.save();
      return Response.json({ message: "تم رفض الدفعة" });
    }

    return Response.json({ error: "action غير صحيح" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
