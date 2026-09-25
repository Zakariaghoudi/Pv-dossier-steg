import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireUser } from "@/lib/guard";
import { hashPassword, comparePassword } from "@/lib/auth";

// GET: بيانات البروفايل الحالي
export async function GET(req) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const user = await User.findById(auth.userId)
    .select("-password -otpCode -otpExpiry")
    .populate("planId");

  if (!user) return Response.json({ error: "غير موجود" }, { status: 404 });

  return Response.json({ user });
}

// PUT: تعديل البروفايل (بيانات عامة + تغيير كلمة المرور اختياري)
export async function PUT(req) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { nomPrenom, nomSociete, telephone, currentPassword, newPassword } = body;

  const user = await User.findById(auth.userId);
  if (!user) return Response.json({ error: "غير موجود" }, { status: 404 });

  if (nomPrenom) user.nomPrenom = nomPrenom;
  if (nomSociete !== undefined) user.nomSociete = nomSociete;
  if (telephone) user.telephone = telephone;

  // تغيير كلمة المرور (اختياري، يحتاج التأكد من الباسورد الحالي)
  if (newPassword) {
    if (!currentPassword) {
      return Response.json({ error: "أدخل كلمة المرور الحالية باش تبدلها" }, { status: 400 });
    }
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return Response.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 });
    }
    if (newPassword.length < 6) {
      return Response.json({ error: "كلمة المرور الجديدة قصيرة برشة" }, { status: 400 });
    }
    user.password = await hashPassword(newPassword);
  }

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.otpCode;
  delete safeUser.otpExpiry;

  return Response.json({ user: safeUser });
}
