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
  Info
} from 'lucide-react';

interface ExpatDashboardProps {
  services: ServicePackage[];
  exchangeRate: ExchangeRateInfo;
  currentUser: UserProfile;
  onPlaceOrder: (newOrder: Order) => void;
  onGoToProvider: () => void;
}

export const ExpatDashboard: React.FC<ExpatDashboardProps> = ({
  services,
  exchangeRate,
  currentUser,
  onPlaceOrder,
  onGoToProvider
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
      {/* البانر الترحيبي والتوضيحي */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-900/40 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوابة المغترب السوري في المغترب (أوروبا، الخليج، أمريكا)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            وصل خيرك لأهلك في سوريا بأمان وكرامة
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            بدلاً من الحوالات المعقدة ومخاطر الصرافة، اختر السلال الغذائية، منظومات الطاقة الشمسية، الأدوية الشهرية، أو المحروقات بالدولار، ومزودونا المحليون الموثوقون سيسلمونها مباشرة لبيت عائلتك في أي محافظة سورية مع توثيق مصور.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>دفع دولي مؤمن بالفيزا/ماستركارد (Lemon Squeezy)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>تسليم خلال 12 - 48 ساعة كحد أقصى</span>
            </div>
          </div>
        </div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* تنبيه نجاح الطلب إذا وجد */}
      {lastPlacedOrder && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-5 shadow-xl animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">تم دفع الطلب بنجاح عبر Lemon Squeezy!</h3>
                <span className="font-mono text-xs bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">
                  {lastPlacedOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                تم استلام إشعار الدفع آلياً عبر مسار n8n وإرسال برقية فورية إلى مزود دمشق عبر تليغرام للبدء بالتجهيز.
              </p>
            </div>
          </div>
          <button
            onClick={onGoToProvider}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
          >
            <span>انتقل إلى بوابة المزود في سوريا لرؤية الطلب</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* الخطوة 1: اختيار المحافظة المستهدفة */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>اختر المحافظة السورية التي يتواجد فيها المستلم:</span>
          </label>
          <span className="text-xs text-slate-400">مزودون محليون معتمدون في كل محافظة</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selectedCity === city
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-102'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
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
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>الباقات المتاحة للتوصيل الفوري في {selectedCity}:</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {filteredServices.length} باقة مفعلة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(srv => {
              const qty = cart[srv.id] || 0;
              return (
                <div 
                  key={srv.id}
                  className={`relative bg-slate-900/90 border rounded-2xl p-5 transition flex flex-col justify-between ${
                    qty > 0 
                      ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        {getIcon(srv.iconName)}
                      </div>
                      {srv.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {srv.badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-white text-base mb-1.5">{srv.titleAr}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{srv.descriptionAr}</p>
                    
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                      <span>الكمية: <b className="text-slate-200">{srv.unit}</b></span>
                      <span>•</span>
                      <span>التسليم: <b className="text-emerald-400">{srv.estimatedDeliveryHours} ساعة</b></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-400 font-mono">${srv.priceUSD}</span>
                        <span className="text-xs text-slate-400">USD</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        ≈ {srv.priceSYP.toLocaleString()} ل.س
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button
                          onClick={() => handleRemoveFromCart(srv.id)}
                          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition cursor-pointer"
                        >
                          -
                        </button>
                      )}
                      {qty > 0 && (
                        <span className="w-7 text-center font-mono font-bold text-sm text-emerald-300">
                          {qty}
                        </span>
                      )}
                      <button
                        onClick={() => handleAddToCart(srv.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          qty > 0
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
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

        {/* سلة المشتريات ونموذج المستلم */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>تفاصيل الطلب والمستلم</span>
            </h2>
            <span className="text-xs text-slate-400">
              {Object.keys(cart).length} سلة مختارة
            </span>
          </div>

          {/* الباقات المختارة بالسلة */}
          <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                السلة فارغة حالياً، اختر باقة واحدة على الأقل من القائمة
              </div>
            ) : (
              Object.entries(cart).map(([id, qty]) => {
                const s = services.find(item => item.id === id);
                if (!s) return null;
                return (
                  <div key={id} className="flex justify-between items-center text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="font-bold text-slate-200">{s.titleAr}</div>
                      <div className="text-slate-400 font-mono text-[11px]">${s.priceUSD} × {qty}</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      ${s.priceUSD * qty}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* نموذج بيانات المستلم في سوريا */}
          <div className="space-y-3.5 mb-6 text-xs">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
              <Building className="w-3.5 h-3.5" />
              <span>عنوان الأهل في {selectedCity}:</span>
            </h3>

            <div>
              <label className="block text-slate-400 mb-1">اسم المستلم الثلاثي (كما بالهوية):</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={recipient.name}
                  onChange={e => setRecipient({ ...recipient, name: e.target.value })}
                  placeholder="مثال: أم محمد الجزائري"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">رقم الهاتف للتواصل السريع (سيريتل / MTN):</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                <input
                  type="tel"
                  value={recipient.phone}
                  onChange={e => setRecipient({ ...recipient, phone: e.target.value })}
                  placeholder="+963 944 000 000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">العنوان بالتفصيل الدقيق:</label>
              <input
                type="text"
                value={recipient.address}
                onChange={e => setRecipient({ ...recipient, address: e.target.value })}
                placeholder="الشارع، البناء، رقم الطابق، معلم بارز"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ملاحظات للمندوب والمزود (اختياري):</label>
              <input
                type="text"
                value={recipient.notes}
                onChange={e => setRecipient({ ...recipient, notes: e.target.value })}
                placeholder="مثال: المصعد معطل، أو يرجى الاتصال قبل الوصول"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* التكلفة الإجمالية والعملة */}
          <div className="pt-4 border-t border-slate-800 mb-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 text-xs">إجمالي المبلغ المطلوب:</span>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400 font-mono">${totalUSD}</span>
                <span className="text-xs text-slate-400 mr-1">USD</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>القيمة المعادلة بالليرة السورية:</span>
              <span className="font-mono text-slate-300 font-bold">
                {totalSYP.toLocaleString()} ل.س
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/90 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>سعر الصرف مثبت ومحمي ضد أي تقلبات مفاجئة</span>
            </p>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* زر التوجه للدفع */}
          <button
            onClick={handleStartCheckout}
            disabled={totalUSD <= 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>متابعة الدفع عبر Lemon Squeezy (${totalUSD})</span>
          </button>
        </div>
      </div>

      {/* نافذة محاكاة بوابة الدفع Lemon Squeezy Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in">
            
            {/* رأس النافذة بشعار ليمون سكويزي */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
                  🍋
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Lemon Squeezy Checkout</h3>
                  <p className="text-[11px] text-slate-400">بوابة الدفع الدولية المعتمدة لمنصة سَنَد</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* ملخص الدفع */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-5">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>الدافع (المغترب):</span>
                <span className="font-semibold text-slate-200">{currentUser.fullName} ({currentUser.country})</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>المستلم في سوريا:</span>
                <span className="font-semibold text-slate-200">{recipient.name} ({selectedCity})</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-800">
                <span className="text-slate-300">المبلغ الإجمالي المخصوم:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">${totalUSD}.00 USD</span>
              </div>
            </div>

            {/* محاكاة بيانات البطاقة الائتمانية */}
            <div className="space-y-3 mb-6 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">رقم البطاقة (Visa / MasterCard):</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (وضع الاختبار التجريبي)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تاريخ الانتهاء:</label>
                  <input
                    type="text"
                    disabled
                    value="12/28"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رمز الأمان CVC:</label>
                  <input
                    type="text"
                    disabled
                    value="••• 123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* زر الدفع النهائي */}
            <button
              onClick={handleSimulateLemonSqueezyPay}
              disabled={isProcessingPayment}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition cursor-pointer shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري معالجة الدفع وتوليد الـ Webhook...</span>
                </>
              ) : (
                <>
                  <span>تأكيد ودفع ${totalUSD}.00 الآن 🔒</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-3">
              محاكاة حقيقية لحدث الويب هوك الخاص بـ Lemon Squeezy order_created
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
