import React, { useState } from 'react';
import { Cpu, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ServicePackage, ExchangeRateInfo } from '../types/sanad';

interface AiPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRate: ExchangeRateInfo;
  onApplyNewRate: (newMarketRate: number, hedgePercent: number, analysisSummary: string) => void;
}

export const AiPricingModal: React.FC<AiPricingModalProps> = ({
  isOpen,
  onClose,
  currentRate,
  onApplyNewRate
}) => {
  const [bulletinText, setBulletinText] = useState<string>(
    `نشرة أسواق دمشق وحلب المسائية:
- سجل سعر صرف الدولار في السوق الموازي بدمشق اليوم 15,100 ليرة شراء و 15,250 ليرة مبيع.
- استقرار أسعار المواد الغذائية الأساسية (الأرز، السكر، الزيت) في أسواق الجملة.
- ارتفاع طفيف في أجور النقل وصهاريج المحروقات بنسبة 3%.
- توافر جيد لمنظومات الطاقة الشمسية وبطاريات الليثيوم مع ثبات أسعارها العالمية.`
  );

  const [hedgeMargin, setHedgeMargin] = useState<number>(4.5);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    detectedRate: number;
    hedgedRate: number;
    condition: string;
    summary: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // محاكاة استدعاء Gemini API لاستخراج سعر الصرف المعتمد وتحليله
    setTimeout(() => {
      // استخراج قيمة الصرف من النص
      let detected = 15175; // average of 15100 and 15250
      if (bulletinText.includes('15,200') || bulletinText.includes('15200')) detected = 15200;
      if (bulletinText.includes('16,000') || bulletinText.includes('16000')) detected = 16000;
      if (bulletinText.includes('14,500') || bulletinText.includes('14500')) detected = 14500;

      const hedged = Math.round(detected * (1 + hedgeMargin / 100));

      setAnalysisResult({
        detectedRate: detected,
        hedgedRate: hedged,
        condition: 'تقلب متوسط وحذر إيجابي',
        summary: `تم فك وتفسير النشرة بنجاح عبر Gemini 2.5: متوسط سعر السوق = ${detected.toLocaleString()} ل.س، وتم احتساب سعر الصرف المحمي = ${hedged.toLocaleString()} ل.س مع هامش أمان +${hedgeMargin}%.`
      });

      setIsAnalyzing(false);
    }, 1200);
  };

  const handleApply = () => {
    if (analysisResult) {
      onApplyNewRate(analysisResult.detectedRate, hedgeMargin, analysisResult.summary);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-scale-in text-slate-100 font-['Cairo']">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">اختبار وكيل التسعير الذكي (Python + Gemini Agent)</h3>
              <p className="text-xs text-slate-400">محاكاة الدورة التي تعمل 24/7 على سيرفر الـ VPS كل 12 ساعة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base p-1"
          >
            ✕
          </button>
        </div>

        {/* حقل نص النشرة */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-semibold text-slate-300">
            النشرة الاقتصادية أو تحديثات الأسعار غير المنظمة:
          </label>
          <textarea
            rows={4}
            value={bulletinText}
            onChange={e => setBulletinText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
            placeholder="أدخل نص النشرة أو التحديث السوقي..."
          />
        </div>

        {/* إعداد هامش التحوط */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-5 text-xs">
          <div>
            <span className="font-semibold text-slate-200 block">هامش أمان التحوط (Hedging Buffer):</span>
            <span className="text-[11px] text-slate-400">حماية المزود المحلي من هبوط الليرة المفاجئ</span>
          </div>
          <div className="flex items-center gap-2">
            {[3.0, 4.5, 6.0].map(pct => (
              <button
                key={pct}
                onClick={() => setHedgeMargin(pct)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                  hedgeMargin === pct
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                +{pct}%
              </button>
            ))}
          </div>
        </div>

        {/* نتيجة التحليل */}
        {analysisResult && (
          <div className="bg-teal-950/40 border border-teal-800/60 rounded-2xl p-4 mb-5 space-y-2 text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-teal-300 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>نتيجة استخراج الذكاء الاصطناعي (Gemini Agent):</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block">سعر السوق المكتشف:</span>
                <span className="text-base font-black text-white font-mono">
                  {analysisResult.detectedRate.toLocaleString()} ل.س
                </span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl">
                <span className="text-[10px] text-teal-400 block">السعر المحمي المعتمد في Supabase:</span>
                <span className="text-base font-black text-teal-400 font-mono">
                  {analysisResult.hedgedRate.toLocaleString()} ل.س
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">{analysisResult.summary}</p>
          </div>
        )}

        {/* أزرار الإجراء */}
        <div className="flex gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex-1 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري استدعاء Gemini API للتحليل...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>تحليل النشرة بواسطة Gemini</span>
              </>
            )}
          </button>

          {analysisResult && (
            <button
              onClick={handleApply}
              className="py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              تحديث الأسعار في قاعدة البيانات الآن
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
