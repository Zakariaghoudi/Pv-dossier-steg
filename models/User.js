import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nomPrenom: { type: String, required: true },
    nomSociete: { type: String },
    refANME: { type: String, required: true }, // ex: "2D"
    codeSTEG: { type: String, required: true }, // ex: "328"
    email: { type: String, required: true, unique: true, lowercase: true },
    telephone: { type: String, required: true },
    password: { type: String, required: true }, // hashed

    // OTP
    otpCode: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },

    // الخطة المختارة
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    planPriceAtSubscription: { type: Number },

    // الدفع
    paymentProof: { type: String }, // رابط الصورة
    paymentReference: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },

    // الاشتراك
    subscriptionActive: { type: Boolean, default: false },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },

    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
