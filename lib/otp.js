import nodemailer from "nodemailer";

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 أرقام
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(toEmail, otpCode) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: "رمز التحقق - PV Dossier",
    text: `رمز التحقق متاعك هو: ${otpCode}\nصالح لمدة 10 دقائق.`,
    html: `<p>رمز التحقق متاعك هو: <strong style="font-size:20px">${otpCode}</strong></p><p>صالح لمدة 10 دقائق.</p>`,
  });
}

export async function sendAccountActivatedEmail(toEmail) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: "تفعيل حسابك - PV Dossier",
    text: "تم تأكيد الدفع وتفعيل اشتراكك. تقدر تدخل الآن لحسابك.",
  });
}
