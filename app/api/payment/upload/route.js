import { connectDB } from "@/lib/db";
import User from "@/models/User";

// ملاحظة: رفع صورة الوصل نفسها يصير من الفرونت مباشرة عبر Vercel Blob
// (@vercel/blob) ويتبعث هنا غير الرابط الناتج + المرجع.
// هذا endpoint يُستدعى بعد OTP مباشرة ولسه ما عندناش JWT (المستخدم ما دخلش بعد)
// لهذا نستعمل userId المرسل من صفحة /paiement (اللي جاية من verify-otp).

export async function POST(req) {
  try {
    await connectDB();
    const { userId, paymentProofUrl, paymentReference } = await req.json();

    if (!userId || !paymentProofUrl) {
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (!user.isVerified) {
      return Response.json({ error: "لازم تأكد حسابك أولا (OTP)" }, { status: 403 });
    }

    user.paymentProof = paymentProofUrl;
    user.paymentReference = paymentReference || "";
    user.paymentStatus = "pending";
    await user.save();

    return Response.json({ message: "تم استلام وصل الدفع، بانتظار التأكيد" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
