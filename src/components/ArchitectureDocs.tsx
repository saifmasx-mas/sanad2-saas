import React, { useState } from 'react';
import { 
  SQL_SCHEMA_CODE, 
  NEXTJS_EXPAT_CODE, 
  NEXTJS_PROVIDER_CODE, 
  N8N_WORKFLOW_JSON, 
  PYTHON_AGENT_CODE, 
  SYSTEMD_SERVICE_FILE, 
  QA_ARCHITECTURAL_SOLUTIONS, 
  SPRINT_TIMELINE 
} from '../data/codeSnippets';
import { 
  Database, 
  CreditCard, 
  Cpu, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  Server, 
  AlertTriangle, 
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage1');
  const [subTab, setSubTab] = useState<'sql' | 'expat_ui' | 'provider_ui'>('sql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* رأس الصفحة مع شارات المراحل الأربعة */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-900/40 p-6 sm:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>المعمارية الهندسية الشاملة لمنصة سَنَد (Solutions Architecture Blueprint)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            خطة التنفيذ البرمجية المتقنة (4 مراحل دقيقة)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            أكواد برمجية جاهزة للإنتاج، خالية من الأخطاء، معمارية متينة تربط Next.js مع Supabase و Lemon Squeezy ومسارات n8n ووكيل بايثون المستقل مع Gemini 2.5 على سيرفر VPS.
          </p>
        </div>

        {/* أزرار التبديل بين المراحل الأربعة المطلوبة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveStage('stage1')}
            className={`p-3 rounded-2xl text-right transition cursor-pointer border ${
              activeStage === 'stage1'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] opacity-75 font-mono mb-1">المرحلة الأولى</div>
            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 shrink-0" />
              <span>قاعدة البيانات والواجهات</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStage('stage2')}
            className={`p-3 rounded-2xl text-right transition cursor-pointer border ${
              activeStage === 'stage2'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] opacity-75 font-mono mb-1">المرحلة الثانية</div>
            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>الدفع والأتمتة (n8n)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStage('stage3')}
            className={`p-3 rounded-2xl text-right transition cursor-pointer border ${
              activeStage === 'stage3'
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] opacity-75 font-mono mb-1">المرحلة الثالثة</div>
            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <Cpu className="w-4 h-4 shrink-0" />
              <span>الوكيل المستقل (Python 24/7)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStage('stage4')}
            className={`p-3 rounded-2xl text-right transition cursor-pointer border ${
              activeStage === 'stage4'
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] opacity-75 font-mono mb-1">المرحلة الرابعة</div>
            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>ضمان الجودة والجاهزية (QA)</span>
            </div>
          </button>
        </div>
      </div>

      {/* محتوى المرحلة 1: قاعدة البيانات والواجهات */}
      {activeStage === 'stage1' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>المرحلة 1: الواجهة وقاعدة البيانات (Next.js 14/15 App Router + Supabase)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              تم بناء المخطط وفق أعلى معايير أمان قواعد البيانات العلائقية (PostgreSQL 15+). يتضمن أنواع مخصصة (Enums)، مفاتيح أجنبية محكمة، فهارس تسريع الاستعلامات (Indexes)، وسياسات أمان مشددة (Row Level Security - RLS) تضمن عدم وصول مزود الخدمة إلا للطلبات المدفوعة التابعة لمدينته.
            </p>

            {/* أزرار فرعية للتبديل بين ملفات المرحلة الأولى */}
            <div className="flex gap-2 mb-4 border-b border-slate-800 pb-3">
              <button
                onClick={() => setSubTab('sql')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  subTab === 'sql' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                1. كود SQL الشامل (Supabase Tables + RLS)
              </button>
              <button
                onClick={() => setSubTab('expat_ui')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  subTab === 'expat_ui' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                2. واجهة المغترب (Next.js Expat Dashboard)
              </button>
              <button
                onClick={() => setSubTab('provider_ui')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  subTab === 'provider_ui' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                3. واجهة مزود سوريا (Next.js Provider Dashboard)
              </button>
            </div>

            {/* عرض كود الـ SQL أو كود الواجهات */}
            {subTab === 'sql' && (
              <div>
                <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-t-2xl border-t border-x border-slate-800 text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    supabase_schema_sanad.sql (نفذه مباشرة في SQL Editor بـ Supabase)
                  </span>
                  <button
                    onClick={() => handleCopy(SQL_SCHEMA_CODE, 'sql')}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sql' ? 'تم النسخ!' : 'نسخ الكود بالكامل'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-b-2xl p-4 overflow-x-auto text-[11px] font-mono text-indigo-200/90 leading-relaxed max-h-[500px]">
                  {SQL_SCHEMA_CODE}
                </pre>
              </div>
            )}

            {subTab === 'expat_ui' && (
              <div>
                <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-t-2xl border-t border-x border-slate-800 text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    app/expat/dashboard/page.tsx (كود واجهة المغترب)
                  </span>
                  <button
                    onClick={() => handleCopy(NEXTJS_EXPAT_CODE, 'expat_ui')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {copiedKey === 'expat_ui' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'expat_ui' ? 'تم النسخ!' : 'نسخ كود Next.js'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-b-2xl p-4 overflow-x-auto text-[11px] font-mono text-emerald-200/90 leading-relaxed max-h-[500px]">
                  {NEXTJS_EXPAT_CODE}
                </pre>
              </div>
            )}

            {subTab === 'provider_ui' && (
              <div>
                <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-t-2xl border-t border-x border-slate-800 text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    app/provider/dashboard/page.tsx (كود واجهة المزود بالاشتراك اللحظي Realtime)
                  </span>
                  <button
                    onClick={() => handleCopy(NEXTJS_PROVIDER_CODE, 'provider_ui')}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {copiedKey === 'provider_ui' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'provider_ui' ? 'تم النسخ!' : 'نسخ كود المزود'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-b-2xl p-4 overflow-x-auto text-[11px] font-mono text-amber-200/90 leading-relaxed max-h-[500px]">
                  {NEXTJS_PROVIDER_CODE}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* محتوى المرحلة 2: الدفع والأتمتة */}
      {activeStage === 'stage2' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>المرحلة 2: مرحلة الدفع والأتمتة (Lemon Squeezy + n8n + Telegram)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              كيف يعمل تدفق الدفع والأتمتة بدقة:
              <br />
              1. يدفع المغترب بالدولار عبر صفحة Lemon Squeezy Checkout المشفرة.
              <br />
              2. ترسل Lemon Squeezy حدث الويب هوك <code className="text-amber-400 font-mono">order_created</code> إلى رابط Webhook في مسار n8n الخاص بك على السيرفر.
              <br />
              3. يتحقق n8n من صحة التوقيع المشفر <code className="text-emerald-400 font-mono">x-signature (HMAC-SHA256)</code> لمنع أي تزييف.
              <br />
              4. يقوم عقد Supabase في n8n بتحديث <code className="text-emerald-400 font-mono">payment_status = 'paid'</code> و <code className="text-emerald-400 font-mono">order_status = 'paid'</code> فورياً.
              <br />
              5. يرسل عقد Telegram Bot في n8n إشعاراً فورياً بتفاصيل الطلب والمستلم في سوريا إلى حساب تليغرام الخاص بالمزود مع أزرار تفاعلية (Inline Keyboard) لبدء التجهيز.
            </p>

            {/* خطوات التنفيذ العملية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mb-2">1</div>
                <h4 className="font-bold text-white text-xs mb-1">إعداد Lemon Squeezy Webhook</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  من إعدادات Lemon Squeezy Settings ➔ Webhooks، أضف رابط n8n الخاص بك، وضع Secret Key وضعه أيضاً في متغيرات n8n، واختر حدث order_created.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">2</div>
                <h4 className="font-bold text-white text-xs mb-1">استيراد مسار n8n بنقرة واحدة</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  انسخ كود الـ JSON أدناه، ثم في واجهة n8n اضغط <code className="text-sky-300">Ctrl+V</code> وسيتم إنشاء المسار المكتمل مع كافة العقد والربط تلقائياً!
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs mb-2">3</div>
                <h4 className="font-bold text-white text-xs mb-1">إنشاء بوت Telegram السوري</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  تحدث مع <code className="text-sky-300">@BotFather</code> في تليغرام، أنشئ بوتاً جديداً واحصل على التوكن، ثم اربطه بعقد Telegram في مسار n8n.
                </p>
              </div>
            </div>

            {/* كود JSON لمسار n8n */}
            <div>
              <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-t-2xl border-t border-x border-slate-800 text-xs">
                <span className="font-mono text-slate-400 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  n8n_sanad_workflow.json (قابل للاستيراد المباشر في n8n)
                </span>
                <button
                  onClick={() => handleCopy(N8N_WORKFLOW_JSON, 'n8n')}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {copiedKey === 'n8n' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'n8n' ? 'تم النسخ!' : 'نسخ ملف JSON لمسار n8n'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-b-2xl p-4 overflow-x-auto text-[11px] font-mono text-emerald-200/90 leading-relaxed max-h-[450px]">
                {N8N_WORKFLOW_JSON}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* محتوى المرحلة 3: الوكيل المستقل ومحرك التسعير */}
      {activeStage === 'stage3' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span>المرحلة 3: مرحلة الوكيل المستقل (Python Agent 24/7 on VPS with Gemini API)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              نظراً لتغير أسعار الصرف والتضخم في سوريا، يعمل سكريبت بايثون المستقل كخدمة خلفية (Daemon Service) على سيرفر الـ VPS طوال 24 ساعة. يستخدم مكتبة Google GenAI الرسمية لتحليل نشرات الأسعار غير المنظمة واستخراج متوسط سعر الصرف الدقيق، ثم يطبق معادلة هامش التحوط (+4.5% إلى +6%) ويحدث حقل <code className="text-amber-400 font-mono">price_syp</code> في Supabase تلقائياً كل 12 ساعة.
            </p>

            {/* بطاقات الميزات والمعادلة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-400 text-xs mb-1.5 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>معادلة التحوط المالي ضد تقلب الليرة السورية:</span>
                </h4>
                <code className="block bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300 mb-2">
                  Hedged_Rate = Market_Rate × (1 + 0.045)<br />
                  Price_SYP = round(Price_USD × Hedged_Rate, -2)
                </code>
                <p className="text-[11px] text-slate-400">
                  تضمن هذه المعادلة عدم خسارة المزود المحلي السوري في حال تغير الصرف بين لحظة دفع المغترب بالدولار ولحظة شراء المواد في الداخل.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-400 text-xs mb-1.5 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span>التشغيل الدائم (24/7) عبر Systemd Daemon:</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يتم تشغيل السكريبت كـ Service مستقل في نظام Linux/Ubuntu على الـ VPS، مع خاصية <code className="text-amber-300">Restart=always</code> لإعادة التشغيل الذاتي في حال حدوث أي انقطاع، مع تدوير ملفات السجلات في <code className="text-slate-300">/var/log/sanad-agent.log</code>.
                </p>
              </div>
            </div>

            {/* كود سكريبت البايثون */}
            <div className="mb-6">
              <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-t-2xl border-t border-x border-slate-800 text-xs">
                <span className="font-mono text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  /opt/sanad-agent/sanad_price_agent.py (سكريبت بايثون + Gemini API + Supabase)
                </span>
                <button
                  onClick={() => handleCopy(PYTHON_AGENT_CODE, 'python')}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {copiedKey === 'python' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'python' ? 'تم النسخ!' : 'نسخ سكريبت البايثون'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-b-2xl p-4 overflow-x-auto text-[11px] font-mono text-amber-200/90 leading-relaxed max-h-[450px]">
                {PYTHON_AGENT_CODE}
              </pre>
            </div>

            {/* ملف خدمة Systemd */}
            <div>
              <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-t-2xl border-t border-x border-slate-800 text-xs">
                <span className="font-mono text-slate-400 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-sky-400" />
                  /etc/systemd/system/sanad-agent.service (ملف خدمة التشغيل الدائم على السيرفر)
                </span>
                <button
                  onClick={() => handleCopy(SYSTEMD_SERVICE_FILE, 'systemd')}
                  className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {copiedKey === 'systemd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'systemd' ? 'تم النسخ!' : 'نسخ ملف Systemd'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-b-2xl p-4 overflow-x-auto text-[11px] font-mono text-sky-200/90 leading-relaxed">
                {SYSTEMD_SERVICE_FILE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* محتوى المرحلة 4: ضمان الجودة والحلول الجذرية للمشاكل التقنية الثلاث */}
      {activeStage === 'stage4' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span>المرحلة 4: مرحلة ضمان الجودة (QA) وحل المشاكل التقنية الثلاث للجاهزية العائلية</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              لتكون المنصة جاهزة للعرض كمنتج إنتاجي حقيقي أمام عائلتك والمستثمرين، تم تحديد أهم 3 تحديات تقنية حقيقية قد تتسبب بإحراج أثناء العرض الحي، ووضع الحلول الجذرية لها بالأكواد:
            </p>

            {/* المشاكل الثلاث مع الحلول */}
            <div className="space-y-6 mb-8">
              {QA_ARCHITECTURAL_SOLUTIONS.map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <h3 className="font-bold text-white text-sm sm:text-base">{item.title}</h3>
                  </div>

                  <div className="bg-rose-950/30 border border-rose-900/40 p-3 rounded-xl mb-3 text-xs text-rose-200/90 leading-relaxed">
                    <b>السبب والخلل المحتمل:</b> {item.cause}
                  </div>

                  <div className="space-y-1.5 mb-4 text-xs text-slate-300">
                    <b className="text-emerald-400 block mb-1">الحلول المعمارية المطبقة في سَنَد:</b>
                    {item.solution.map((sol, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold font-mono">✔</span>
                        <span>{sol}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto">
                    {item.codeExample}
                  </div>
                </div>
              ))}
            </div>

            {/* خطة الـ 7 أيام للإنجاز قبل العرض */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">الجدول الزمني التنفيذي (أسبوع واحد 7-Day Sprint)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SPRINT_TIMELINE.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl">
                    <div className="text-xs font-bold text-indigo-400 mb-1 font-mono">{item.day}</div>
                    <div className="text-xs font-bold text-white mb-1">{item.title}</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">{item.tasks}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
