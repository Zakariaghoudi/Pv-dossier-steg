import { connectDB } from "@/lib/db";
import Dossier from "@/models/Dossier";
import { requireUser } from "@/lib/guard";

async function getOwnedDossier(id, userId) {
  const dossier = await Dossier.findById(id);
  if (!dossier || dossier.owner.toString() !== userId) return null;
  return dossier;
}

export async function GET(req, { params }) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const dossier = await getOwnedDossier(params.id, auth.userId);
  if (!dossier) return Response.json({ error: "غير موجود" }, { status: 404 });

  return Response.json({ dossier });
}

export async function PUT(req, { params }) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const dossier = await getOwnedDossier(params.id, auth.userId);
  if (!dossier) return Response.json({ error: "غير موجود" }, { status: 404 });

  const body = await req.json();
  Object.assign(dossier, body);
  await dossier.save();

  return Response.json({ dossier });
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return errorResponse;

  const dossier = await getOwnedDossier(params.id, auth.userId);
  if (!dossier) return Response.json({ error: "غير موجود" }, { status: 404 });

  await dossier.deleteOne();
  return Response.json({ message: "تم الحذف" });
}
