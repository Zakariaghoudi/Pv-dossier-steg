import { connectDB } from "@/lib/db";
import User from "@/models/User";

// هذا الـ route يُستدعى تلقائيًا من Vercel Cron (شوف vercel.json)
// محمي بـ CRON_SECRET باش حتى شخص ما يقدر يستدعيه يدويًا من برا

export async function GET(req) {
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  await connectDB();

  const result = await User.updateMany(
    {
      subscriptionActive: true,
      subscriptionEnd: { $lt: new Date() },
    },
    { $set: { subscriptionActive: false } }
  );

  return Response.json({
    message: "تم فحص الاشتراكات المنتهية",
    deactivatedCount: result.modifiedCount,
  });
}
