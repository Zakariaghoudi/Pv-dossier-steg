import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Plan from "@/models/Plan";
import { hashPassword } from "@/lib/auth";
import { generateOTP, sendOTPEmail } from "@/lib/otp";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      nomPrenom,
      nomSociete,
      refANME,
      codeSTEG,
      email,
      telephone,
      password,
      planId,
    } = body;

    if (!nomPrenom || !refANME || !codeSTEG || !email || !telephone || !password || !planId) {
      return Response.json({ error: "رجاء عبي كل الخانات" }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return Response.json({ error: "هذا الإيميل مسجل من قبل" }, { status: 409 });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return Response.json({ error: "الخطة المختارة غير موجودة" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // صالح 10 دقايق

    const user = await User.create({
      nomPrenom,
      nomSociete,
      refANME,
      codeSTEG,
      email: email.toLowerCase(),
      telephone,
      password: hashedPassword,
      planId,
      planPriceAtSubscription: plan.price,
      otpCode,
      otpExpiry,
    });

    await sendOTPEmail(email, otpCode);

    return Response.json({
      message: "تم التسجيل، تفقد إيميلك لرمز التحقق",
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
