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
      
      {/* رأس الصفحة الترحيبي بنفحات ملكية أرجوانية وذهبية */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#280754] via-[#3b0b78] to-[#180238] border border-amber-400/40 p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>فريق الدعم الفني وخدمة العملاء - سَنَد 2</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight mb-2">
            تواصل معنا مباشرة • سَنَد 2 (Sanad 2)
          </h1>
          <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed">
            نحن هنا لمساعدة المغتربين السوريين في كل مكان ومزودينا في الداخل. يسعدنا استقبال استفساراتكم وملاحظاتكم على مدار الساعة من مقرنا الرئيسي في تركيا أو عبر قنوات التواصل المباشرة.
          </p>
        </div>
      </div>

      {/* بطاقة إرشادية لحفظ المجلد في القرص الصلب D:\sanad2 */}
      <div className="bg-[#180530]/90 border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">حفظ ونقل المشروع إلى القرص الصلب D:\sanad2</h3>
                <span className="text-[10px] font-mono bg-purple-950 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  سَنَد 2 جاهز
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">
                يمكنك نسخ الكود أو تشغيل الأمر التالي في جهازك لنقل وتسمية المجلد في المسار المطلوب:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <code className="bg-[#0e021f] border border-purple-800 px-3 py-2 rounded-xl text-xs font-mono text-amber-300 shrink-0 font-bold" dir="ltr">
              D:\sanad2
            </code>
            <button
              onClick={() => handleCopy("mkdir D:\\sanad2", 'driveD')}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-400/20"
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
          <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 hover:border-amber-400/60 transition shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-purple-300/80 block">رقم الهاتف وخدمة العملاء:</span>
                <a 
                  href="tel:+905362515878" 
                  className="text-base font-black text-amber-300 font-mono hover:underline inline-block"
                  dir="ltr"
                >
                  +90 536 251 58 78
                </a>
              </div>
            </div>
            <p className="text-[11px] text-purple-300/70 mt-2 pt-2 border-t border-purple-800/60">
              متاح للاتصال المباشر والرسائل الصوتية طوال أيام الأسبوع
            </p>
          </div>

          {/* البريد الإلكتروني */}
          <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 hover:border-amber-400/60 transition shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-700/30 text-amber-300 border border-purple-700/40 flex items-center justify-center shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-purple-300/80 block">البريد الإلكتروني الرسمي:</span>
                <a 
                  href="mailto:saif.masx@gmail.com" 
                  className="text-sm sm:text-base font-bold text-yellow-300 font-mono hover:underline break-all"
                >
                  saif.masx@gmail.com
                </a>
              </div>
            </div>
            <p className="text-[11px] text-purple-300/70 mt-2 pt-2 border-t border-purple-800/60">
              نرد على جميع الاستفسارات الرسمية والعقود خلال أقل من 4 ساعات
            </p>
          </div>

          {/* العنوان في تركيا - بورصة */}
          <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 hover:border-amber-400/60 transition shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-purple-300/80 block">المقر الإداري والإقليمي:</span>
                <span className="text-base font-bold text-white block">
                  تركيا - بورصة (Bursa, Turkey)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-purple-300/70 mt-2 pt-2 border-t border-purple-800/60">
              إدارة العمليات اللوجستية وبوابات الدفع والتنسيق مع مزودي الداخل السوري
            </p>
          </div>

          {/* منصات التواصل الاجتماعي الرسمية */}
          <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 shadow-xl backdrop-blur-md">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>قنواتنا الرسمية على مواقع التواصل:</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* واتساب */}
              <a
                href="https://wa.me/905362515878"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#0e021f] hover:bg-purple-950 border border-emerald-500/40 hover:border-emerald-400 p-2.5 rounded-2xl text-xs font-bold text-emerald-300 transition"
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
                className="flex items-center gap-2 bg-[#0e021f] hover:bg-purple-950 border border-sky-500/40 hover:border-sky-400 p-2.5 rounded-2xl text-xs font-bold text-sky-300 transition"
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
                className="flex items-center gap-2 bg-[#0e021f] hover:bg-purple-950 border border-blue-500/40 hover:border-blue-400 p-2.5 rounded-2xl text-xs font-bold text-blue-300 transition"
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
                className="flex items-center gap-2 bg-[#0e021f] hover:bg-purple-950 border border-purple-700/60 hover:border-amber-400/60 p-2.5 rounded-2xl text-xs font-bold text-white transition"
              >
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-black text-xs border border-purple-700">
                  𝕏
                </span>
                <span>منصة إكس (X / تويتر)</span>
              </a>
            </div>
          </div>
        </div>

        {/* نموذج التواصل المباشر */}
        <div className="lg:col-span-2 bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="pb-4 border-b border-purple-800/60 mb-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>أرسل لنا رسالة فورية</span>
            </h2>
            <p className="text-xs text-purple-300/80 mt-1">
              املأ النموذج أدناه وسيتواصل معك أحد مسؤولي خدمة العملاء في منصة سَنَد 2 مباشرة
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-[#240645] border border-amber-400/60 rounded-2xl p-6 text-center animate-fade-in space-y-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">تم استلام رسالتك بنجاح!</h3>
              <p className="text-xs text-purple-200 max-w-md mx-auto leading-relaxed">
                شكراً لتواصلك مع سَنَد 2. تم توجيه رسالتك إلى البريد <code className="font-mono text-amber-300 font-bold">saif.masx@gmail.com</code> وفريق الدعم في بورصة وسنقوم بالرد عليك في أقرب وقت.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/905362515878?text=مرحباً%20منصة%20سند2%2C%20أود%20الاستفسار%20عن%20خدماتكم"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-400/20"
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
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">الاسم الكريم:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: سيف الدين"
                    className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-xs text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">البريد الإلكتروني للرد:</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-xs text-purple-100 placeholder:text-purple-400/60 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">رقم الهاتف (مع رمز الدولة):</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 536 000 00 00"
                    className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-xs text-purple-100 placeholder:text-purple-400/60 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">موضوع الرسالة:</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-xs text-purple-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="" className="bg-[#180530]">اختر الموضوع...</option>
                    <option value="استفسار عن طلب وإرسال سلة لأهلي" className="bg-[#180530]">استفسار عن طلب وإرسال سلة لأهلي</option>
                    <option value="طلب الانضمام كمزود خدمة محلي في سوريا" className="bg-[#180530]">طلب الانضمام كمزود خدمة محلي في سوريا</option>
                    <option value="بوابات الدفع والتحويل بالدولار" className="bg-[#180530]">بوابات الدفع والتحويل بالدولار</option>
                    <option value="اقتراح أو شراكة عمل" className="bg-[#180530]">اقتراح أو شراكة عمل</option>
                    <option value="دعم فني آخر" className="bg-[#180530]">دعم فني آخر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">نص الرسالة أو الاستفسار:</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="اكتب استفسارك بالتفصيل وسيسعدنا الرد عليك..."
                  className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl p-3.5 text-xs text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الرسالة إلى saif.masx@gmail.com</span>
                </button>

                <a
                  href="https://wa.me/905362515878?text=مرحباً%20فريق%20سند2%2C%20لدي%20استفسار%20عاجل"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition font-semibold"
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
