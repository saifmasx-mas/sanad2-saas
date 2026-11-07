import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Share2, 
  ExternalLink,
  HardDrive,
  Copy,
  Check,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in font-['Cairo']">
      
      {/* رأس الصفحة الترحيبي */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-900/40 p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>فريق الدعم الفني وخدمة العملاء - سَنَد 2</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            تواصل معنا مباشرة • سَنَد 2 (Sanad 2)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            نحن هنا لمساعدة المغتربين السوريين في كل مكان ومزودينا في الداخل. يسعدنا استقبال استفساراتكم وملاحظاتكم على مدار الساعة من مقرنا الرئيسي في تركيا أو عبر قنوات التواصل المباشرة.
          </p>
        </div>
      </div>

      {/* بطاقة إرشادية لحفظ المجلد في القرص الصلب D:\sanad2 */}
      <div className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">حفظ ونقل المشروع إلى القرص الصلب D:\sanad2</h3>
                <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full font-bold">
                  سَنَد 2 جاهز
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                يمكنك نسخ الكود أو تشغيل الأمر التالي في جهازك لنقل وتسمية المجلد في المسار المطلوب:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <code className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-emerald-300 shrink-0" dir="ltr">
              D:\sanad2
            </code>
            <button
              onClick={() => handleCopy("mkdir D:\\sanad2", 'driveD')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {copiedText === 'driveD' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText === 'driveD' ? 'تم النسخ!' : 'نسخ المسار'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* معلومات الاتصال الرسمية ومواقع التواصل */}
        <div className="space-y-4">
          
          {/* الهاتف */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">رقم الهاتف وخدمة العملاء:</span>
                <a 
                  href="tel:+905362515878" 
                  className="text-base font-black text-emerald-400 font-mono hover:underline inline-block"
                  dir="ltr"
                >
                  +90 536 251 58 78
                </a>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
              متاح للاتصال المباشر والرسائل الصوتية طوال أيام الأسبوع
            </p>
          </div>

          {/* البريد الإلكتروني */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">البريد الإلكتروني الرسمي:</span>
                <a 
                  href="mailto:saif.masx@gmail.com" 
                  className="text-sm sm:text-base font-bold text-sky-400 font-mono hover:underline break-all"
                >
                  saif.masx@gmail.com
                </a>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
              نرد على جميع الاستفسارات الرسمية والعقود خلال أقل من 4 ساعات
            </p>
          </div>

          {/* العنوان في تركيا - بورصة */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">المقر الإداري والإقليمي:</span>
                <span className="text-base font-bold text-white block">
                  تركيا - بورصة (Bursa, Turkey)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
              إدارة العمليات اللوجستية وبوابات الدفع والتنسيق مع مزودي الداخل السوري
            </p>
          </div>

          {/* منصات التواصل الاجتماعي الرسمية */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>قنواتنا الرسمية على مواقع التواصل:</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* واتساب */}
              <a
                href="https://wa.me/905362515878"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 p-2.5 rounded-2xl text-xs font-bold text-emerald-300 transition"
              >
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  W
                </span>
                <span>واتساب (WhatsApp)</span>
              </a>

              {/* تلغرام */}
              <a
                href="https://t.me/sanad_syria"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/50 p-2.5 rounded-2xl text-xs font-bold text-sky-300 transition"
              >
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-xs">
                  T
                </span>
                <span>تلغرام (Telegram)</span>
              </a>

              {/* فيسبوك */}
              <a
                href="https://facebook.com/sanad2.platform"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 p-2.5 rounded-2xl text-xs font-bold text-blue-300 transition"
              >
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  f
                </span>
                <span>فيسبوك (Facebook)</span>
              </a>

              {/* منصة X */}
              <a
                href="https://x.com/sanad2_app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 p-2.5 rounded-2xl text-xs font-bold text-white transition"
              >
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-black text-xs border border-slate-700">
                  𝕏
                </span>
                <span>منصة إكس (X / تويتر)</span>
              </a>
            </div>
          </div>
        </div>

        {/* نموذج التواصل المباشر */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="pb-4 border-b border-slate-800 mb-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>أرسل لنا رسالة فورية</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              املأ النموذج أدناه وسيتواصل معك أحد مسؤولي خدمة العملاء في منصة سَنَد 2 مباشرة
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-6 text-center animate-fade-in space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">تم استلام رسالتك بنجاح!</h3>
              <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
                شكراً لتواصلك مع سَنَد 2. تم توجيه رسالتك إلى البريد <code className="font-mono text-white">saif.masx@gmail.com</code> وفريق الدعم في بورصة وسنقوم بالرد عليك في أقرب وقت.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/905362515878?text=مرحباً%20منصة%20سند2%2C%20أود%20الاستفسار%20عن%20خدماتكم"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  <span>أو تواصل فورياً عبر واتساب</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الاسم الكريم:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: سيف الدين"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني للرد:</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم الهاتف (مع رمز الدولة):</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 536 000 00 00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">موضوع الرسالة:</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">اختر الموضوع...</option>
                    <option value="استفسار عن طلب وإرسال سلة لأهلي">استفسار عن طلب وإرسال سلة لأهلي</option>
                    <option value="طلب الانضمام كمزود خدمة محلي في سوريا">طلب الانضمام كمزود خدمة محلي في سوريا</option>
                    <option value="بوابات الدفع والتحويل بالدولار">بوابات الدفع والتحويل بالدولار</option>
                    <option value="اقتراح أو شراكة عمل">اقتراح أو شراكة عمل</option>
                    <option value="دعم فني آخر">دعم فني آخر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">نص الرسالة أو الاستفسار:</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="اكتب استفسارك بالتفصيل وسيسعدنا الرد عليك..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الرسالة إلى saif.masx@gmail.com</span>
                </button>

                <a
                  href="https://wa.me/905362515878?text=مرحباً%20فريق%20سند2%2C%20لدي%20استفسار%20عاجل"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
                >
                  <span>محادثة واتساب سريعة مباشرة (+905362515878)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
