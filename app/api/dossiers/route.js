import { connectDB } from "@/lib/db";
import Dossier from "@/models/Dossier";
import { requireUser } from "@/lib/guard";

// GET: قائمة دوسيات المستخدم الحالي
export async function GET(req) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const dossiers = await Dossier.find({ owner: auth.userId }).sort({ createdAt: -1 });
  return Response.json({ dossiers });
}

// POST: إنشاء دوسيه جديد
export async function POST(req) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const dossier = await Dossier.create({ ...body, owner: auth.userId });
  return Response.json({ dossier }, { status: 201 });
}
