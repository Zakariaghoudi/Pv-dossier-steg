import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";
import { requireAdmin } from "@/lib/guard";

export async function PUT(req, { params }) {
  await connectDB();
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  const plan = await Plan.findById(params.id);
  if (!plan) return Response.json({ error: "غير موجود" }, { status: 404 });

  const body = await req.json();
  Object.assign(plan, body);
  await plan.save();

  return Response.json({ plan });
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { errorResponse } = requireAdmin(req);
  if (errorResponse) return errorResponse;

  const plan = await Plan.findById(params.id);
  if (!plan) return Response.json({ error: "غير موجود" }, { status: 404 });

  // بالأحسن ما نمسحوش نهائي (باش ما نخسروش تاريخ اللي مشتركين فيه) —
  // بس نعطّلوه
  plan.isActive = false;
  await plan.save();

  return Response.json({ message: "تم تعطيل الخطة" });
}
