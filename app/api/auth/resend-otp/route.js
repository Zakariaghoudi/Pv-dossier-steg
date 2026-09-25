import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateOTP, sendOTPEmail } from "@/lib/otp";

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (user.isVerified) {
      return Response.json({ message: "الحساب موثّق مسبقًا" });
    }

    const otpCode = generateOTP();
    user.otpCode = otpCode;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otpCode);

    return Response.json({ message: "تم إرسال رمز جديد لإيميلك" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
