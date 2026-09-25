import mongoose from "mongoose";

const ChaineSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // "Chaine 1", "MPPT 1"
    coffretDC: { type: Boolean, default: true },
    sectionneurDC: {
      marque: String, // "BENNY", "GEYA", "MERZ"
      tension: String, // "600VDC"
      courant: String, // "25A", "45A"
    },
  },
  { _id: false }
);

const DossierSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // معلومات الحريف والكارتوش
    clientNom: { type: String, required: true },
    date: { type: Date, default: Date.now },

    // الألواح الشمسية
    panneaux: {
      count: { type: Number, required: true },
      marque: String, // "Astroenergy", "LONGI"
      puissanceW: Number, // 585, 575, 620
    },

    // الأونداليور
    onduleur: {
      marque: String, // "GROWATT", "SUNGROW", "SOLAX POWER"
      modele: String, // "MIN6000TL-X2", "SG4.0RS", "X1-BOOST-4.2K-G4"
    },

    // الـ Chaines/MPPT (يحدد القالب: 1 ولا 2 شيمات)
    chaines: [ChaineSchema],

    // الحماية
    spdDC: {
      marque: { type: String, default: "GEYA" },
      tension: String, // "Uc:275V"
      courant: String, // "In:20kA"
    },
    spdAC: {
      marque: { type: String, default: "GEYA" },
      tension: String, // "600VDC"
      courant: String, // "In:20kA"
    },
    disjSTEG: Number, // 32 (بلا ماركة مذكورة)
    disjDiff: {
      marque: String, // "SIAME"
      courant: Number, // 32, 25
      tension: Number, // 230
      sensibilite: Number, // 30 (mA)
    },

    // الكابلات
    cableDC: {
      section: Number, // 4 (mm²)
      longueurM: Number, // 15, 13, 8
    },
    cableAC: {
      section: Number, // 6 (mm²)
      longueurM: Number, // 1, 14, 0.8
    },

    // عناصر اختيارية
    repartiteur: { type: Boolean, default: false },
    priseDeTerre: { type: Boolean, default: true },

    // النتيجة
    status: {
      type: String,
      enum: ["brouillon", "termine", "exporte"],
      default: "brouillon",
    },
    schemaExportUrl: String, // رابط PDF النهائي بعد التصدير
  },
  { timestamps: true }
);

export default mongoose.models.Dossier || mongoose.model("Dossier", DossierSchema);
