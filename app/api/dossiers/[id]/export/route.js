import { connectDB } from "@/lib/db";
import Dossier from "@/models/Dossier";
import { requireUser } from "@/lib/guard";

// POST /api/dossiers/[id]/export
// ملاحظة: توليد الـ PDF الفعلي (schéma unifilaire + plan d'implantation) يتطلب
// منطق الرسم من مشروع pv-dossier-tool. هذا الـ endpoint يحضّر البيانات ويبدّل
// الحالة لـ "exporte" — توليد الملف نفسه يصير في الفرونت (canvas/svg → PDF)
// أو في خطوة لاحقة نربطها بمكتبة توليد PDF على السيرفر.
export async function POST(req, { params }) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const dossier = await Dossier.findById(params.id);
  if (!dossier || dossier.owner.toString() !== auth.userId) {
    return Response.json({ error: "غير موجود" }, { status: 404 });
  }

  dossier.status = "exporte";
  await dossier.save();

  return Response.json({ dossier });
}
