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
  LogIn,
  Navigation
} from 'lucide-react';
import { ExchangeRateInfo, UserProfile } from '../types/sanad';

interface NavbarProps {
  activeTab: 'expat' | 'tracking' | 'provider' | 'architecture' | 'pipeline' | 'contact';
  setActiveTab: (tab: 'expat' | 'tracking' | 'provider' | 'architecture' | 'pipeline' | 'contact') => void;
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
    <header className="sticky top-0 z-50 bg-[#120326]/95 backdrop-blur-md border-b border-purple-800/50 font-['Cairo'] shadow-lg shadow-purple-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* الشعار والهوية الملكية بالبنفسجي والذهب */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/30 text-purple-950 font-black text-2xl tracking-tighter border border-amber-200">
              سَـ2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight gold-gradient-text">سَنَد 2</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-purple-900/80 border border-amber-400/40 px-2 py-0.5 rounded-full shadow-sm">
                  SANAD 2 SaaS
                </span>
              </div>
              <p className="text-[11px] text-purple-200/70 leading-tight">
                المنصة المتكاملة لخدمة المغتربين السوريين • تركيا بورصة ➔ دمشق والمحافظات
              </p>
            </div>
          </div>

          {/* شريط أسعار الصرف والتحديث الذكي باللون البنفسجي والذهب */}
          <div className="hidden xl:flex items-center gap-3 bg-[#1e073c]/90 border border-purple-700/60 px-3.5 py-1.5 rounded-2xl shadow-inner">
            <div className="flex items-center gap-1.5 text-xs text-purple-200">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>سعر الصرف المحمي:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                1$ = {exchangeRate.hedgedRate.toLocaleString()} ل.س
              </span>
            </div>
            <div className="h-4 w-px bg-purple-800/80" />
            <button
              onClick={onRefreshPricing}
              disabled={isRefreshingRate}
              className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-amber-300 transition cursor-pointer"
              title="محاكاة تشغيل وكيل بايثون المستقل مع Gemini لتحديث الأسعار"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRate ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isRefreshingRate ? 'جاري التحليل...' : 'تحديث الوكيل الذكي'}</span>
            </button>
          </div>

          {/* أزرار التبديل الرئيسية */}
          <nav className="flex items-center gap-1 bg-[#1a0533]/90 p-1.5 rounded-2xl border border-purple-800/60 overflow-x-auto shadow-inner">
            <button
              onClick={() => setActiveTab('expat')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'expat'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 shadow-md shadow-amber-400/25 font-black'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>لوحة المغترب</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-950 text-amber-300 text-[10px] font-mono flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* زر تتبع الطلبات المباشر للمغترب */}
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'tracking'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 shadow-md shadow-amber-400/25 font-black'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>تتبع الطلبات (Live)</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </button>

            <button
              onClick={() => setActiveTab('provider')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'provider'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 shadow-md shadow-amber-400/25 font-black'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>بوابة مزود سوريا</span>
              {paidOrdersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-950 text-amber-300 text-[10px] font-mono flex items-center justify-center font-bold">
                  {paidOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'architecture'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30 font-black'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>المخطط والأكواد</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                activeTab === 'pipeline'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30 font-black'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
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
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 shadow-md shadow-amber-400/25 font-black'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>تواصل معنا</span>
            </button>
          </nav>

          {/* زر تواصل معنا البارز الذهبي وزر تسجيل الدخول */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer shadow-md ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-purple-950 shadow-amber-400/40 ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 shadow-amber-500/20'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-purple-950" />
              <span>تواصل معنا</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-[#20073e] hover:bg-[#2c0b55] border border-purple-700/60 text-purple-200 hover:text-amber-300 px-3 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer"
              title="تسجيل الدخول / إنشاء حساب"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">حسابي</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
