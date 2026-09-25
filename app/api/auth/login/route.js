import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    if (!user.isVerified) {
      return Response.json({ error: "حسابك غير موثّق، أدخل رمز OTP أولا" }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    if (!user.subscriptionActive) {
      return Response.json(
        { error: "اشتراكك غير مفعّل بعد. انتظر تأكيد الدفع" },
        { status: 403 }
      );
    }

    if (user.subscriptionEnd && user.subscriptionEnd < new Date()) {
      return Response.json({ error: "انتهت مدة اشتراكك، جدد اشتراكك" }, { status: 403 });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return Response.json({
      token,
      user: {
        id: user._id,
        nomPrenom: user.nomPrenom,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
