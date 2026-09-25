import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "Mensuel", "Trimestriel", "Annuel"
    price: { type: Number, required: true }, // بالدينار
    durationDays: { type: Number, required: true }, // 30, 90, 365
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
