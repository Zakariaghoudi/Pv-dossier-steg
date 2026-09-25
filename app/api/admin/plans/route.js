import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";
import { requireAdmin } from "@/lib/guard";

// GET: كل الخطط (نشيطة وغير نشيطة) - للأدمن
export async function GET(req) {
  await connectDB();
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  const plans = await Plan.find().sort({ price: 1 });
  return Response.json({ plans });
}

// POST: إنشاء خطة جديدة
export async function POST(req) {
  await connectDB();
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { name, price, durationDays, isActive } = await req.json();

  if (!name || price == null || !durationDays) {
    return Response.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const plan = await Plan.create({
    name,
    price,
    durationDays,
    isActive: isActive !== undefined ? isActive : true,
  });

  return Response.json({ plan }, { status: 201 });
}
