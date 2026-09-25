# PV Dossier - Backend (كامل)

## خطوات التشغيل في GitHub Codespaces

1. ارفع هذا المجلد لريبو جديد على GitHub (أو دمجه مع ريبو pv-dossier-tool الموجود)
2. افتح الريبو → Code → Codespaces → Create codespace
3. في الـ terminal:
   ```
   npm install
   ```
4. انسخ `.env.example` إلى `.env.local` واملأ القيم (MongoDB Atlas URI, JWT secret, SMTP, CRON_SECRET)
5. شغل محليًا داخل الـ Codespace للتجربة:
   ```
   npm run dev
   ```

## النشر على Vercel

1. اربط الريبو بحساب Vercel (Import Project من GitHub)
2. أضف نفس متغيرات `.env.example` في Vercel → Project Settings → Environment Variables
   (بما فيها `CRON_SECRET` — Vercel يستعملها أوتوماتيكيًا في استدعاء الـ Cron المعرّف في `vercel.json`)
3. كل `git push` على branch main يعمل deploy تلقائي

## إنشاء أول Plans

الطريقة الأسهل: سجل كأدمن (شوف تحت)، وبعدها استعمل `POST /api/admin/plans` مباشرة.
أو أضفهم يدويًا في MongoDB Atlas، مثال:
```json
[
  { "name": "Mensuel", "price": 30, "durationDays": 30, "isActive": true },
  { "name": "Trimestriel", "price": 80, "durationDays": 90, "isActive": true },
  { "name": "Annuel", "price": 300, "durationDays": 365, "isActive": true }
]
```

## إنشاء أول Admin

بعد ما يسجل حساب عادي (ويكمل التحقق OTP)، بدّل يدويًا في MongoDB Atlas:
```
isAdmin: true
```

## كل الـ Endpoints

### Auth
| Method | Route | الوصف |
|---|---|---|
| POST | /api/auth/register | تسجيل + إرسال OTP |
| POST | /api/auth/verify-otp | تأكيد OTP |
| POST | /api/auth/resend-otp | إعادة إرسال رمز OTP |
| POST | /api/auth/login | تسجيل دخول (يرجع JWT) |
| POST | /api/auth/forgot-password | طلب رمز لإعادة تعيين كلمة المرور |
| POST | /api/auth/reset-password | تعيين كلمة مرور جديدة عبر OTP |

### Plans (عام)
| Method | Route | الوصف |
|---|---|---|
| GET | /api/plans | قائمة الخطط النشيطة (للتسجيل) |

### Payment
| Method | Route | الوصف |
|---|---|---|
| POST | /api/payment/upload | حفظ وصل الدفع (بعد رفعه لـ Vercel Blob) |

### Profile (محمي - JWT)
| Method | Route | الوصف |
|---|---|---|
| GET | /api/user/profile | جلب بيانات البروفايل |
| PUT | /api/user/profile | تعديل البروفايل / تغيير كلمة المرور |

### Dossiers (محمي - JWT)
| Method | Route | الوصف |
|---|---|---|
| GET/POST | /api/dossiers | قائمة/إنشاء دوسيات |
| GET/PUT/DELETE | /api/dossiers/[id] | دوسيه واحد |
| POST | /api/dossiers/[id]/export | تصدير الدوسيه (يبدّل الحالة لـ exporte) |

### Admin (محمي - JWT + isAdmin)
| Method | Route | الوصف |
|---|---|---|
| GET | /api/admin/confirm-payment | قائمة الدفعات المعلقة |
| POST | /api/admin/confirm-payment | تأكيد/رفض دفعة (يفعّل الاشتراك) |
| GET/POST | /api/admin/plans | قائمة/إنشاء خطط |
| PUT/DELETE | /api/admin/plans/[id] | تعديل خطة / تعطيلها |
| GET | /api/admin/users | قائمة كل المستخدمين (فلترة بـ ?status= و ?active=) |

### Cron (محمي - CRON_SECRET، يستدعيه Vercel تلقائيًا)
| Method | Route | الوصف |
|---|---|---|
| GET | /api/cron/check-subscriptions | يعطّل الاشتراكات المنتهية يوميًا |

## ملاحظات مهمة

1. **رفع صور الوصل**: لازم يصير من الفرونت مباشرة عبر `@vercel/blob`، ثم يتبعث
   الرابط الناتج فقط لـ `/api/payment/upload`.
2. **Export PDF الحقيقي**: `/api/dossiers/[id]/export` حاليًا يبدّل بس الحالة —
   توليد الـ PDF الفعلي (schéma unifilaire + plan d'implantation) يحتاج نربطه
   بمنطق الرسم متاع مشروع pv-dossier-tool (خطوة منفصلة لاحقة).
3. **Logout**: ما فيهوش route خاص — يكفي تمسح الـ token من الفرونت (localStorage/cookie).
   إذا تحب "logout من كل الأجهزة" نزيد نظام token blacklist لاحقًا.
