import React from 'react';
import { 
  Building2, 
  ShoppingBag, 
  Truck, 
  Code2, 
  PlayCircle, 
  ShieldCheck, 
  RefreshCw,
  Coins,
  PhoneCall,
  User,
  LogIn
} from 'lucide-react';
import { ExchangeRateInfo, UserProfile } from '../types/sanad';

interface NavbarProps {
  activeTab: 'expat' | 'provider' | 'architecture' | 'pipeline' | 'contact';
  setActiveTab: (tab: 'expat' | 'provider' | 'architecture' | 'pipeline' | 'contact') => void;
  exchangeRate: ExchangeRateInfo;
  onRefreshPricing: () => void;
  isRefreshingRate: boolean;
  cartCount: number;
  paidOrdersCount: number;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  exchangeRate,
  onRefreshPricing,
  isRefreshingRate,
  cartCount,
  paidOrdersCount,
  currentUser,
  onOpenAuth
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 font-['Cairo']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* الشعار والهوية المحدثة لسَنَد 2 */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-2xl tracking-tighter">
              سَـ2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white tracking-tight">سَنَد 2</span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  SANAD 2 SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                المنصة المتكاملة لخدمة المغتربين السوريين • تركيا بورصة ➔ دمشق والمحافظات
              </p>
            </div>
          </div>

          {/* شريط أسعار الصرف والتحديث الذكي */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>سعر الصرف المحمي:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                1$ = {exchangeRate.hedgedRate.toLocaleString()} ل.س
              </span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <button
              onClick={onRefreshPricing}
              disabled={isRefreshingRate}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition cursor-pointer"
              title="محاكاة تشغيل وكيل بايثون المستقل مع Gemini لتحديث الأسعار"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRate ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRefreshingRate ? 'جاري التحليل...' : 'تحديث الوكيل الذكي'}</span>
            </button>
          </div>

          {/* أزرار التبديل الرئيسية */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('expat')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'expat'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>لوحة المغترب</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-950 text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('provider')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'provider'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>بوابة مزود سوريا</span>
              {paidOrdersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-mono flex items-center justify-center font-bold">
                  {paidOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>المخطط والأكواد</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'pipeline'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>محاكي الدورة</span>
            </button>

            {/* صفحة تواصل معنا */}
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'contact'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>تواصل معنا</span>
            </button>
          </nav>

          {/* زر تواصل معنا وزر تسجيل الدخول */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer shadow-md ${
                activeTab === 'contact'
                  ? 'bg-teal-400 text-slate-950 shadow-teal-400/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>تواصل معنا</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer"
              title="تسجيل الدخول / إنشاء حساب"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">حسابي</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
