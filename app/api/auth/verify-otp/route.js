import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, otpCode } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (user.isVerified) {
      return Response.json({ message: "الحساب موثّق مسبقًا" });
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      return Response.json({ error: "رمز التحقق غير صحيح" }, { status: 400 });
    }

    if (user.otpExpiry < new Date()) {
      return Response.json({ error: "انتهت صلاحية رمز التحقق" }, { status: 400 });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return Response.json({ message: "تم التحقق بنجاح، توجه الآن لصفحة الدفع" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
