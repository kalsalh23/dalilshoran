# بناء ملف APK لتطبيق دليل صوران الطبي

## المتطلبات (على جهازك الخاص، ليس على هذا السيرفر)

- **Node.js** (v18 이상)
- **Java JDK 17** (Eclipse Adoptium Temurin أو Oracle JDK 17)
- **Android Studio** مع Android SDK و build-tools
- متغير بيئة `ANDROID_HOME` يشير إلى مسار Android SDK

## الخطوات

### 1. نسخ ملفات المشروع إلى جهازك
انسخ محتويات مجلد `dalilshoran-main` بالكامل إلى جهازك الذي يحتوي على Java و Android Studio.

### 2. تثبيت dépendencies Capacitor
```powershell
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 3. إضافة منصة Android
```powershell
npx cap add android
```

### 4. مزامنة الويب مع Android
```powershell
npx cap copy
npx cap sync
```

### 5. فتح المشروع في Android Studio وإنشاء APK
```powershell
npx cap open android
```

ثم في Android Studio:
- اختر **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- ملف الـ APK سيكون في: `android/app/build/outputs/apk/debug/app-debug.apk`
- للإصدار الموقّع (release): اختر **Build → Generate Signed Bundle / APK**

### 6. تثبيت APK على الهاتف
انقل ملف `app-debug.apk` إلى هاتفك وقم بتثبيته (قد تحتاج لتفعيل "التثبيت من مصادر غير معروفة" في إعدادات الأمان).

---

## بديل فوري بدون بناء APK

التطبيق متوفر كحزمة ويب تقدمية (PWA) على:
**https://dalilshoran-main.vercel.app**

افتح الرابط في متصفح كروم على أندرويد، ثم اختر من قائمة المتصفح **"إضافة إلى الشاشة الرئيسية"** (Add to Home Screen). سيعمل كتطبيق مثبت مع أيقونة على الشاشة الرئيسية بدون الحاجة إلى APK.

---

## ملاحظات
- التكوين الحالي يُحمّل المحتوى من رابط فيرسيل المباشر (`server.url`). إذا أردت حزم الملفات محلياً داخل الـ APK، غيّر `bundledWebAssets` إلى `true` وأزل `server.url` من `capacitor.config.ts`.
- الأيقونات الحالية تستخدم SVG (favicon.svg). لأفضل مظهر على أندرويد، يُنصح بإضافة أيقونات PNG بأحجام 192x192 و 512x512 في مجلد `assets/` وتحديث `manifest.webmanifest`.
