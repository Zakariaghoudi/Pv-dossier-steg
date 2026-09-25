import { connectDB } from "@/lib/db";
import Plan from "@/models/Plan";

export async function GET() {
  try {
    await connectDB();
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    return Response.json({ plans });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
