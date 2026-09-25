import { verifyToken } from "@/lib/auth";

// يرجع { auth, errorResponse } — إذا errorResponse موجود لازم ترجعه فورًا من الـ route
export function requireUser(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const auth = token ? verifyToken(token) : null;

  if (!auth) {
    return { auth: null, errorResponse: Response.json({ error: "غير مصرح" }, { status: 401 }) };
  }
  return { auth, errorResponse: null };
}

export function requireAdmin(req) {
  const { auth, errorResponse } = requireUser(req);
  if (errorResponse) return { auth: null, errorResponse };

  if (!auth.isAdmin) {
    return { auth: null, errorResponse: Response.json({ error: "هذا الإجراء للأدمن فقط" }, { status: 403 }) };
  }
  return { auth, errorResponse: null };
}
