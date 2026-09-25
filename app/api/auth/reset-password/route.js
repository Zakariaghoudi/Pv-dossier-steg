import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, otpCode, newPassword } = await req.json();

    if (!userId || !otpCode || !newPassword) {
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      return Response.json({ error: "رمز التحقق غير صحيح" }, { status: 400 });
    }

    if (user.otpExpiry < new Date()) {
      return Response.json({ error: "انتهت صلاحية رمز التحقق" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: "كلمة المرور قصيرة برشة (6 أحرف على الأقل)" }, { status: 400 });
    }

    user.password = await hashPassword(newPassword);
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return Response.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
