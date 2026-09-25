import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateOTP, sendOTPEmail } from "@/lib/otp";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email: email?.toLowerCase() });
    // ملاحظة أمان: نرجع نفس الرسالة سواء الإيميل موجود ولا لا، باش ما نكشفوش
    // إذا الإيميل مسجل عندنا ولا لا
    if (!user) {
      return Response.json({ message: "إذا كان الإيميل مسجل، غادي توصلك رسالة" });
    }

    const otpCode = generateOTP();
    user.otpCode = otpCode;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otpCode);

    return Response.json({
      message: "إذا كان الإيميل مسجل، غادي توصلك رسالة",
      userId: user._id, // يُستعمل من الفرونت في خطوة reset-password
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
