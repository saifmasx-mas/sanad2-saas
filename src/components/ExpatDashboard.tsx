import React, { useState } from 'react';
import { 
  ServicePackage, 
  Order, 
  ExchangeRateInfo, 
  UserProfile 
} from '../types/sanad';
import { 
  ShoppingBag, 
  Zap, 
  HeartPulse, 
  Flame, 
  Droplets, 
  Receipt, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Info,
  Navigation
} from 'lucide-react';

interface ExpatDashboardProps {
  services: ServicePackage[];
  exchangeRate: ExchangeRateInfo;
  currentUser: UserProfile;
  onPlaceOrder: (newOrder: Order) => void;
  onGoToProvider: () => void;
  onGoToTracking?: (orderId?: string) => void;
}

export const ExpatDashboard: React.FC<ExpatDashboardProps> = ({
  services,
  exchangeRate,
  currentUser,
  onPlaceOrder,
  onGoToProvider,
  onGoToTracking
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('دمشق');
  const [cart, setCart] = useState<{ [serviceId: string]: number }>({
    'srv-food-01': 1 // Default 1 food basket in cart for quick testing
  });
  
  const [recipient, setRecipient] = useState({
    name: 'أم محمد الجزائري',
    phone: '+963 944 123 456',
    address: 'شارع بغداد - نزلة السبكي - بناء الأمل طابق 3',
    notes: 'يرجى الاتصال قبل نصف ساعة من الوصول'
  });

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState<string>('');

  const cities = ['دمشق', 'ريف دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس', 'حماة'];

  const filteredServices = services.filter(
    s => s.availableCities.includes(selectedCity) || s.availableCities.includes('جميع المحافظات')
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-pink-400" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'Receipt': return <Receipt className="w-5 h-5 text-purple-400" />;
      default: return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleAddToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const totalUSD = Object.entries(cart).reduce((sum, [id, qty]) => {
    const s = services.find(item => item.id === id);
    return sum + (s ? s.priceUSD * qty : 0);
  }, 0);

  const totalSYP = totalUSD * exchangeRate.hedgedRate;

  const handleStartCheckout = () => {
    if (!recipient.name.trim() || !recipient.phone.trim() || !recipient.address.trim()) {
      setFormError('يرجى كتابة اسم المستلم ورقم هاتفه وعنوانه في سوريا');
      return;
    }
    if (totalUSD <= 0) {
      setFormError('يرجى اختيار باقة واحدة على الأقل لإتمام الطلب');
      return;
    }
    setFormError('');
    setIsCheckoutModalOpen(true);
  };

  const handleSimulateLemonSqueezyPay = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const orderNumber = `SND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const srv = services.find(s => s.id === id)!;
        return {
          serviceId: srv.id,
          serviceTitle: srv.titleAr,
          quantity: qty,
          unitPriceUSD: srv.priceUSD,
          totalUSD: srv.priceUSD * qty
        };
      });

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        expatId: currentUser.id,
        expatName: currentUser.fullName,
        expatPhone: currentUser.phone,
        expatCountry: currentUser.country,
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        recipientCity: selectedCity,
        recipientAddress: recipient.address,
        recipientNotes: recipient.notes,
        items: orderItems,
        totalUSD,
        totalSYP,
        exchangeRateUsed: exchangeRate.hedgedRate,
        paymentStatus: 'paid',
        paymentReference: `LS_PAY_${Math.floor(100000000 + Math.random() * 900000000)}`,
        orderStatus: 'preparing', // Immediately ready for provider
        providerId: 'usr-prv-01',
        providerName: 'مؤسسة ياسمين الشام للخدمات اللوجستية (دمشق)',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        telegramNotificationSent: true
      };

      onPlaceOrder(newOrder);
      setLastPlacedOrder(newOrder);
      setIsProcessingPayment(false);
      setIsCheckoutModalOpen(false);
      setCart({});
    }, 1400);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* البانر الترحيبي والتوضيحي بنمط البنفسجي الكوني والذهب */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#280754] via-[#3b0b78] to-[#180238] border border-amber-400/40 p-6 sm:p-8 shadow-2xl shadow-purple-950/50">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-yellow-300/10 text-amber-300 border border-amber-400/50 px-3.5 py-1 rounded-full text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>بوابة المغترب السوري في المغترب (أوروبا، الخليج، أمريكا)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 gold-gradient-text">
            وصل خيرك لأهلك في سوريا بأمان وكرامة
          </h1>
          <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed">
            بدلاً من الحوالات المعقدة ومخاطر الصرافة، اختر السلال الغذائية، منظومات الطاقة الشمسية، الأدوية الشهرية، أو المحروقات بالدولار، ومزودونا المحليون الموثوقون سيسلمونها مباشرة لبيت عائلتك في أي محافظة سورية مع توثيق مصور.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-purple-200">
            <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/80 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>دفع دولي مؤمن بالفيزا/ماستركارد (Lemon Squeezy)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/80 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>تسليم خلال 12 - 48 ساعة كحد أقصى</span>
            </div>

            {onGoToTracking && (
              <button
                onClick={() => onGoToTracking()}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black px-4 py-1.5 rounded-full text-xs transition cursor-pointer shadow-md shadow-amber-400/20"
              >
                <Navigation className="w-3.5 h-3.5 text-purple-950" />
                <span>تتبع موقع المندوب المباشر على خريطة Google Maps</span>
                <span className="w-2 h-2 rounded-full bg-purple-950 animate-ping" />
              </button>
            )}
          </div>
        </div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* تنبيه نجاح الطلب إذا وجد */}
      {lastPlacedOrder && (
        <div className="bg-gradient-to-r from-purple-900/90 via-[#26074a] to-purple-900/90 border border-amber-400/60 rounded-2xl p-5 shadow-2xl animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-purple-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/30 font-black">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">تم دفع الطلب بنجاح عبر Lemon Squeezy!</h3>
                <span className="font-mono text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-bold">
                  {lastPlacedOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                تم استلام إشعار الدفع آلياً عبر مسار n8n وإرسال برقية فورية إلى مزود دمشق عبر تليغرام للبدء بالتجهيز.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onGoToTracking && (
              <button
                onClick={() => onGoToTracking(lastPlacedOrder.id)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-400/25"
              >
                <Navigation className="w-4 h-4 text-purple-950" />
                <span>تتبع الطلب على الخريطة مباشرة ➔</span>
              </button>
            )}
            <button
              onClick={onGoToProvider}
              className="flex items-center gap-2 bg-[#120326] hover:bg-purple-950 border border-purple-700 text-purple-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <span>بوابة المزود في سوريا</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* الخطوة 1: اختيار المحافظة المستهدفة باللون البنفسجي والذهب */}
      <section className="bg-[#180530]/90 border border-purple-800/60 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-purple-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>اختر المحافظة السورية التي يتواجد فيها المستلم:</span>
          </label>
          <span className="text-xs text-purple-300/70">مزودون محليون معتمدون في كل محافظة</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selectedCity === city
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black shadow-lg shadow-amber-400/25 scale-102 ring-1 ring-amber-200'
                  : 'bg-[#20073e] text-purple-200 border border-purple-700/60 hover:border-amber-400/60 hover:text-white'
              }`}
            >
              📍 {city}
            </button>
          ))}
        </div>
      </section>

      {/* الحاوية الرئيسية: الباقات يساراً، وسلة الشراء مع المستلم يميناً */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* قائمة الباقات والخدمات */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>الباقات المتاحة للتوصيل الفوري في {selectedCity}:</span>
            </h2>
            <span className="text-xs text-amber-300 font-mono bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800">
              {filteredServices.length} باقة مفعلة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(srv => {
              const qty = cart[srv.id] || 0;
              return (
                <div 
                  key={srv.id}
                  className={`relative bg-[#180530]/90 border rounded-2xl p-5 transition flex flex-col justify-between ${
                    qty > 0 
                      ? 'border-amber-400 shadow-xl shadow-amber-400/15 ring-1 ring-amber-400/40' 
                      : 'border-purple-800/60 hover:border-amber-400/60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-[#230744] border border-purple-700/60">
                        {getIcon(srv.iconName)}
                      </div>
                      {srv.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          {srv.badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-white text-base mb-1.5">{srv.titleAr}</h3>
                    <p className="text-xs text-purple-200/70 leading-relaxed mb-4">{srv.descriptionAr}</p>
                    
                    <div className="flex items-center gap-3 text-[11px] text-purple-300 mb-4 bg-[#230744]/70 p-2 rounded-xl border border-purple-800/60">
                      <span>الكمية: <b className="text-amber-300">{srv.unit}</b></span>
                      <span>•</span>
                      <span>التسليم: <b className="text-amber-300">{srv.estimatedDeliveryHours} ساعة</b></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-800/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-amber-400 font-mono">${srv.priceUSD}</span>
                        <span className="text-xs text-purple-300">USD</span>
                      </div>
                      <span className="text-[11px] text-purple-300/80 block font-mono">
                        ≈ {srv.priceSYP.toLocaleString()} ل.س
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button
                          onClick={() => handleRemoveFromCart(srv.id)}
                          className="w-8 h-8 rounded-xl bg-[#2b0852] hover:bg-purple-800 text-purple-200 font-bold flex items-center justify-center transition cursor-pointer"
                        >
                          -
                        </button>
                      )}
                      {qty > 0 && (
                        <span className="w-7 text-center font-mono font-bold text-sm text-amber-300">
                          {qty}
                        </span>
                      )}
                      <button
                        onClick={() => handleAddToCart(srv.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          qty > 0
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-purple-950 font-black shadow-md shadow-amber-400/25'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/50 hover:bg-amber-400 hover:text-purple-950'
                        }`}
                      >
                        {qty > 0 ? '+ إضافة' : 'اختيار السلة'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* سلة المشتريات ونموذج المستلم بالنمط البنفسجي والذهب */}
        <div className="bg-[#180530] border border-purple-800/80 rounded-3xl p-6 sticky top-24 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-purple-800/80 mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>تفاصيل الطلب والمستلم</span>
            </h2>
            <span className="text-xs text-amber-300 font-bold bg-[#26074a] px-2.5 py-0.5 rounded-full border border-purple-700">
              {Object.keys(cart).length} سلة مختارة
            </span>
          </div>

          {/* الباقات المختارة بالسلة */}
          <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-6 text-purple-300/50 text-xs">
                السلة فارغة حالياً، اختر باقة واحدة على الأقل من القائمة
              </div>
            ) : (
              Object.entries(cart).map(([id, qty]) => {
                const s = services.find(item => item.id === id);
                if (!s) return null;
                return (
                  <div key={id} className="flex justify-between items-center text-xs bg-[#240647] p-2.5 rounded-xl border border-purple-700/60">
                    <div>
                      <div className="font-bold text-purple-100">{s.titleAr}</div>
                      <div className="text-purple-300/80 font-mono text-[11px]">${s.priceUSD} × {qty}</div>
                    </div>
                    <div className="font-mono font-bold text-amber-300 text-sm">
                      ${s.priceUSD * qty}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* نموذج بيانات المستلم في سوريا */}
          <div className="space-y-3.5 mb-6 text-xs">
            <h3 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>عنوان الأهل في {selectedCity}:</span>
            </h3>

            <div>
              <label className="block text-purple-200 mb-1">اسم المستلم الثلاثي (كما بالهوية):</label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={recipient.name}
                  onChange={e => setRecipient({ ...recipient, name: e.target.value })}
                  placeholder="مثال: أم محمد الجزائري"
                  className="w-full bg-[#120227] border border-purple-800 rounded-xl pr-9 pl-3 py-2 text-purple-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-200 mb-1">رقم الهاتف للتواصل السريع (سيريتل / MTN):</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
                <input
                  type="tel"
                  value={recipient.phone}
                  onChange={e => setRecipient({ ...recipient, phone: e.target.value })}
                  placeholder="+963 944 000 000"
                  className="w-full bg-[#120227] border border-purple-800 rounded-xl pr-9 pl-3 py-2 text-purple-100 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-purple-200 mb-1">العنوان بالتفصيل الدقيق:</label>
              <input
                type="text"
                value={recipient.address}
                onChange={e => setRecipient({ ...recipient, address: e.target.value })}
                placeholder="الشارع، البناء، رقم الطابق، معلم بارز"
                className="w-full bg-[#120227] border border-purple-800 rounded-xl px-3 py-2 text-purple-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-1">ملاحظات للمندوب والمزود (اختياري):</label>
              <input
                type="text"
                value={recipient.notes}
                onChange={e => setRecipient({ ...recipient, notes: e.target.value })}
                placeholder="مثال: المصعد معطل، أو يرجى الاتصال قبل الوصول"
                className="w-full bg-[#120227] border border-purple-800 rounded-xl px-3 py-2 text-purple-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* التكلفة الإجمالية والعملة */}
          <div className="pt-4 border-t border-purple-800/80 mb-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-purple-300 text-xs">إجمالي المبلغ المطلوب:</span>
              <div className="text-right">
                <span className="text-3xl font-black text-amber-400 font-mono">${totalUSD}</span>
                <span className="text-xs text-purple-300 mr-1">USD</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-purple-300/80">
              <span>القيمة المعادلة بالليرة السورية:</span>
              <span className="font-mono text-amber-300 font-bold">
                {totalSYP.toLocaleString()} ل.س
              </span>
            </div>
            <p className="text-[11px] text-amber-300/90 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>سعر الصرف مثبت ومحمي ضد أي تقلبات مفاجئة</span>
            </p>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* زر التوجه للدفع بالذهب الساطع */}
          <button
            onClick={handleStartCheckout}
            disabled={totalUSD <= 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-purple-950 font-black text-sm transition cursor-pointer shadow-lg shadow-amber-400/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-purple-950" />
            <span>متابعة الدفع عبر Lemon Squeezy (${totalUSD})</span>
          </button>
        </div>
      </div>

      {/* نافذة محاكاة بوابة الدفع Lemon Squeezy Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#180530] border border-amber-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in text-purple-100">
            
            {/* رأس النافذة بشعار ليمون سكويزي والذهب */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-800/80 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-purple-950 font-black flex items-center justify-center text-sm shadow-md">
                  🍋
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Lemon Squeezy Checkout</h3>
                  <p className="text-[11px] text-amber-300/80">بوابة الدفع الدولية المعتمدة لمنصة سَنَد 2</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-purple-300 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* ملخص الدفع */}
            <div className="bg-[#100222] p-4 rounded-2xl border border-purple-800/80 mb-5">
              <div className="flex justify-between items-center text-xs text-purple-300 mb-2">
                <span>الدافع (المغترب):</span>
                <span className="font-semibold text-white">{currentUser.fullName} ({currentUser.country})</span>
              </div>
              <div className="flex justify-between items-center text-xs text-purple-300 mb-2">
                <span>المستلم في سوريا:</span>
                <span className="font-semibold text-white">{recipient.name} ({selectedCity})</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-purple-800">
                <span className="text-purple-200">المبلغ الإجمالي المخصوم:</span>
                <span className="text-xl font-black text-amber-400 font-mono">${totalUSD}.00 USD</span>
              </div>
            </div>

            {/* محاكاة بيانات البطاقة الائتمانية */}
            <div className="space-y-3 mb-6 text-xs">
              <div>
                <label className="block text-purple-300 mb-1">رقم البطاقة (Visa / MasterCard):</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (وضع الاختبار التجريبي)"
                    className="w-full bg-[#100222] border border-purple-800 rounded-xl pr-9 pl-3 py-2 text-purple-200 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-300 mb-1">تاريخ الانتهاء:</label>
                  <input
                    type="text"
                    disabled
                    value="12/28"
                    className="w-full bg-[#100222] border border-purple-800 rounded-xl px-3 py-2 text-purple-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-purple-300 mb-1">رمز الأمان CVC:</label>
                  <input
                    type="text"
                    disabled
                    value="••• 123"
                    className="w-full bg-[#100222] border border-purple-800 rounded-xl px-3 py-2 text-purple-200 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* زر الدفع النهائي */}
            <button
              onClick={handleSimulateLemonSqueezyPay}
              disabled={isProcessingPayment}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-purple-950 font-black text-sm transition cursor-pointer shadow-xl shadow-amber-400/30 flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري معالجة الدفع وتوليد الـ Webhook...</span>
                </>
              ) : (
                <>
                  <span>تأكيد ودفع ${totalUSD}.00 الآن 🔒</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-purple-400 mt-3">
              محاكاة حقيقية لحدث الويب هوك الخاص بـ Lemon Squeezy order_created
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
