import React, { useState, useEffect, useMemo } from 'react';
import { 
  Order, 
  OrderStatus 
} from '../types/sanad';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Package, 
  Navigation, 
  Compass, 
  ExternalLink, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  User, 
  Radio, 
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
  Check,
  Share2
} from 'lucide-react';

interface OrderTrackingProps {
  orders: Order[];
  activeOrderId?: string;
  onGoToExpatStore: () => void;
}

// مركز مستودع سَنَد 2 اللوجستي الرئيسي في دمشق
const WAREHOUSE_HUB = {
  name: 'مستودع سَنَد 2 المركزي للتجهيز والفرز (دمشق - البرامكة)',
  lat: 33.5074,
  lng: 36.2842
};

// إحداثيات مواقع الأحياء والمدن
const COORDINATES_DATABASE: Record<string, { lat: number; lng: number }> = {
  'شارع بغداد': { lat: 33.5220, lng: 36.3015 },
  'الميدان': { lat: 33.4925, lng: 36.3010 },
  'القصاع': { lat: 33.5180, lng: 36.3210 },
  'المزة': { lat: 33.5010, lng: 36.2550 },
  'باب توما': { lat: 33.5140, lng: 36.3150 },
  'دمشق': { lat: 33.5138, lng: 36.2765 },
  'ريف دمشق': { lat: 33.5600, lng: 36.3200 },
  'حلب': { lat: 36.2021, lng: 37.1343 },
  'حمص': { lat: 34.7324, lng: 36.7137 },
  'اللاذقية': { lat: 35.5317, lng: 35.7917 },
  'طرطوس': { lat: 34.8959, lng: 35.8866 },
  'حماة': { lat: 35.1318, lng: 36.7578 }
};

// رسم خطوط المسار الأقصر المذهبة بين المستودع ➔ المندوب ➔ منزل المستلم
const TrackingPolyline: React.FC<{ 
  warehouse: { lat: number; lng: number };
  courier: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}> = ({ warehouse, courier, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const g = (window as any).google;
    if (!g || !g.maps) return;

    // خط المسار المكتمل من المستودع إلى موقع المندوب
    const completedPath = [
      { lat: warehouse.lat, lng: warehouse.lng },
      { lat: courier.lat, lng: courier.lng }
    ];

    // خط المسار المتبقي من المندوب إلى منزل المستلم
    const remainingPath = [
      { lat: courier.lat, lng: courier.lng },
      { lat: destination.lat, lng: destination.lng }
    ];

    const completedPolyline = new g.maps.Polyline({
      path: completedPath,
      geodesic: true,
      strokeColor: '#a855f7',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map
    });

    const remainingPolyline = new g.maps.Polyline({
      path: remainingPath,
      geodesic: true,
      strokeColor: '#fbbf24', // ذهبي ساطع
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map
    });

    return () => {
      completedPolyline.setMap(null);
      remainingPolyline.setMap(null);
    };
  }, [map, warehouse, courier, destination]);

  return null;
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orders,
  activeOrderId,
  onGoToExpatStore
}) => {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // تصفية الطلبات الخاصة بالمغترب (أو كافة الطلبات المتاحة للتجربة)
  const availableOrders = useMemo(() => {
    return orders.length > 0 ? orders : [];
  }, [orders]);

  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (activeOrderId) return activeOrderId;
    const active = availableOrders.find(o => o.orderStatus === 'out_for_delivery' || o.orderStatus === 'preparing');
    return active ? active.id : (availableOrders[0]?.id || '');
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [courierProgressRatio, setCourierProgressRatio] = useState<number>(0.65); // نسبة تقدم المندوب في المسار (0 إلى 1)
  const [isSimulatingLiveMove, setIsSimulatingLiveMove] = useState(false);

  // تحديث الطلب عند تغير activeOrderId من الخارج
  useEffect(() => {
    if (activeOrderId) {
      setSelectedOrderId(activeOrderId);
    }
  }, [activeOrderId]);

  // الطلب المحدد حالياً
  const currentOrder = useMemo(() => {
    return availableOrders.find(o => o.id === selectedOrderId) || availableOrders[0] || null;
  }, [availableOrders, selectedOrderId]);

  // استخراج إحداثيات وجهة المستلم
  const destinationCoords = useMemo(() => {
    if (!currentOrder) return { lat: 33.5220, lng: 36.3015 }; // افتراضي شارع بغداد
    if (currentOrder.recipientAddress.includes('بغداد')) return COORDINATES_DATABASE['شارع بغداد'];
    if (currentOrder.recipientAddress.includes('ميدان') || currentOrder.recipientAddress.includes('جزماتية')) return COORDINATES_DATABASE['الميدان'];
    if (currentOrder.recipientAddress.includes('مزة')) return COORDINATES_DATABASE['المزة'];
    if (currentOrder.recipientAddress.includes('قصاع') || currentOrder.recipientAddress.includes('توما')) return COORDINATES_DATABASE['القصاع'];
    return COORDINATES_DATABASE[currentOrder.recipientCity] || { lat: 33.5138, lng: 36.2765 };
  }, [currentOrder]);

  // حساب موقع المندوب اللحظي بين المستودع والوجهة
  const courierCoords = useMemo(() => {
    const lat = WAREHOUSE_HUB.lat + (destinationCoords.lat - WAREHOUSE_HUB.lat) * courierProgressRatio;
    const lng = WAREHOUSE_HUB.lng + (destinationCoords.lng - WAREHOUSE_HUB.lng) * courierProgressRatio;
    return { lat, lng };
  }, [destinationCoords, courierProgressRatio]);

  // حساب المسافة المتبقية بالكيلومتر والوقت التقديري
  const distanceRemainingKm = useMemo(() => {
    const dLat = destinationCoords.lat - courierCoords.lat;
    const dLng = destinationCoords.lng - courierCoords.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    return Math.max(0.4, Math.round(dist * 10) / 10);
  }, [destinationCoords, courierCoords]);

  const etaMinutes = useMemo(() => {
    if (currentOrder?.orderStatus === 'delivered') return 0;
    return Math.max(4, Math.round(distanceRemainingKm * 3.5 + 4));
  }, [distanceRemainingKm, currentOrder]);

  // محاكاة تحرك المندوب في المسار خطوة بخطوة
  useEffect(() => {
    if (!isSimulatingLiveMove) return;

    const interval = setInterval(() => {
      setCourierProgressRatio(prev => {
        if (prev >= 0.95) {
          setIsSimulatingLiveMove(false);
          return 0.98;
        }
        return Math.min(1, prev + 0.05);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulatingLiveMove]);

  // مراحل تتبع الطلب الأربعة
  const trackingSteps = [
    {
      step: 1,
      title: 'تأكيد الدفع بالدولار',
      desc: 'تم استلام المبلغ بنجاح عبر Lemon Squeezy وتوليد إشعار الويب هوك المشفر',
      time: currentOrder?.paidAt || '08:15 ص',
      isCompleted: true,
      isActive: currentOrder?.orderStatus === 'paid'
    },
    {
      step: 2,
      title: 'التجهيز والفرز في مستودع سَنَد 2',
      desc: 'فحص جودة المواد والمطابقة مع طلب المغترب وتغليف السلال بإحكام',
      time: '09:30 ص',
      isCompleted: currentOrder?.orderStatus === 'preparing' || currentOrder?.orderStatus === 'out_for_delivery' || currentOrder?.orderStatus === 'delivered',
      isActive: currentOrder?.orderStatus === 'preparing'
    },
    {
      step: 3,
      title: 'خرج مع المندوب وفي الطريق للمنزل',
      desc: 'انطلق كابتن التوصيل مع الشحنة، ويتحرك الآن في شوارع دمشق نحو منزل العائلة',
      time: '10:45 ص (جاري الآن)',
      isCompleted: currentOrder?.orderStatus === 'out_for_delivery' || currentOrder?.orderStatus === 'delivered',
      isActive: currentOrder?.orderStatus === 'out_for_delivery'
    },
    {
      step: 4,
      title: 'تم التسليم باليد وتوثيق الإيصال',
      desc: 'تسليم المواد للأهل باليد مع تصوير الإيصال الموقع والتأكد من رضا العائلة',
      time: currentOrder?.deliveredAt || 'متوقع خلال ~' + etaMinutes + ' دقيقة',
      isCompleted: currentOrder?.orderStatus === 'delivered',
      isActive: currentOrder?.orderStatus === 'delivered'
    }
  ];

  return (
    <div className="space-y-6 pb-16 font-['Cairo'] animate-fade-in">
      
      {/* رأس الصفحة مع شارات التتبع المباشر والثيم الملكي */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#280754] via-[#3b0b78] to-[#180238] border border-amber-400/40 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm">
              <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>نظام التتبع اللحظي بالأقمار الصناعية • Google Maps Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight mb-2">
              تتبع مسار طلبك وموقع المندوب في سوريا لحظة بلحظة
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              شاهد كابتن التوصيل يتحرك في أحياء دمشق والمحافظات في الوقت الفعلي مع تفاصيل زمن الوصول المقدر (Live ETA) وإمكانية الاتصال المباشر بالمندوب حتى استلام أهلك باليد.
            </p>
          </div>

          {/* بطاقة ملخص الحالة والوصول المباشر */}
          <div className="bg-[#120326]/90 border border-amber-400/50 p-4 rounded-2xl shrink-0 min-w-[280px] shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-2 font-bold pb-2 border-b border-purple-800/70">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>حالة الشحنة اللحظية:</span>
              </span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[10px] font-bold">
                {currentOrder?.orderStatus === 'delivered' ? 'تم التسليم بنجاح ✔' : 'في الطريق للأهل ⚡'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-purple-300/80 block">الوقت المتبقي:</span>
                <span className="text-base font-black text-yellow-300 font-mono">
                  {currentOrder?.orderStatus === 'delivered' ? 'مكتمل' : `~${etaMinutes} دقيقة`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-purple-300/80 block">المسافة للأهل:</span>
                <span className="text-base font-black text-amber-300 font-mono">
                  {currentOrder?.orderStatus === 'delivered' ? '0 كم' : `${distanceRemainingKm} كم`}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-purple-800/70 flex items-center justify-between">
              <button
                onClick={() => setIsSimulatingLiveMove(!isSimulatingLiveMove)}
                className="w-full py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-black rounded-xl text-[11px] transition cursor-pointer shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5"
              >
                {isSimulatingLiveMove ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin" />
                    <span>إيقاف محاكاة الحركة</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>محاكاة تحرك المندوب حياً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* شريط اختيار الطلبات النشطة والبحث السريع */}
      <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* قائمة كروت التبديل السريع بين طلبات المغترب */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-purple-300/80 shrink-0 font-bold ml-1">طلباتك النشطة:</span>
            {availableOrders.map(order => (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setCourierProgressRatio(order.orderStatus === 'delivered' ? 1 : 0.65);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                  selectedOrderId === order.id
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 border-amber-300 shadow-lg shadow-amber-400/20 font-black'
                    : 'bg-[#0e021f] text-purple-200 border-purple-800/80 hover:border-amber-400/50'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span className="font-mono">{order.orderNumber}</span>
                <span className="text-[10px] opacity-80">({order.recipientName.split(' ')[0]})</span>
              </button>
            ))}
          </div>

          {/* البحث برقم التتبع */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الطلب (مثال: SND-2026)..."
              className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي: الخريطة التفاعلية وبطاقة المندوب ومراحل التتبع */}
      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* قسم الخريطة التفاعلية مع Google Maps */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="font-bold text-white text-base">
                    موقع المندوب المباشر في دمشق (خريطة Google Maps التفاعلية)
                  </h3>
                </div>
                
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-purple-200">مركز الفرز</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping shadow-sm" />
                    <span className="text-yellow-300 font-bold">المندوب الميداني</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                    <span className="text-purple-200">منزل الأهل</span>
                  </div>
                </div>
              </div>

              {/* حاوية الخريطة التفاعلية */}
              <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-purple-800/80 relative bg-[#0e021f] shadow-inner">
                {mapsApiKey ? (
                  <APIProvider apiKey={mapsApiKey} language="ar" region="SY">
                    <Map
                      defaultCenter={{ lat: courierCoords.lat, lng: courierCoords.lng }}
                      center={{ lat: courierCoords.lat, lng: courierCoords.lng }}
                      defaultZoom={13}
                      mapId="DEMO_MAP_ID"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* 1. دبوس مركز الفرز والتوزيع (Warehouse) */}
                      <AdvancedMarker
                        position={{ lat: WAREHOUSE_HUB.lat, lng: WAREHOUSE_HUB.lng }}
                        title={WAREHOUSE_HUB.name}
                      >
                        <Pin
                          background="#ef4444"
                          borderColor="#ffffff"
                          glyphColor="#ffffff"
                        />
                      </AdvancedMarker>

                      {/* 2. دبوس موقع المندوب المتحرك حياً (Live Courier Pin) */}
                      <AdvancedMarker
                        position={{ lat: courierCoords.lat, lng: courierCoords.lng }}
                        title="موقع مندوب سَنَد 2 اللحظي (أبو شادي)"
                      >
                        <div className="relative group cursor-pointer">
                          {/* هالة نبضية مشعة حول المندوب */}
                          <div className="absolute -inset-2 bg-amber-400/40 rounded-full animate-ping pointer-events-none" />
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-400 text-purple-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-2xl shadow-amber-400/50 transform transition hover:scale-110">
                            <Truck className="w-6 h-6 text-purple-950" />
                          </div>
                          
                          {/* بطاقة عائمة فوق المندوب */}
                          <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 bg-[#180530] border border-amber-400/80 text-white text-[11px] px-3 py-1 rounded-xl shadow-2xl whitespace-nowrap opacity-100 transition z-30 font-bold">
                            🚚 مندوب الشام: على بعد {distanceRemainingKm} كم
                          </div>
                        </div>
                      </AdvancedMarker>

                      {/* 3. دبوس منزل الأهل / المستلم (Recipient Destination) */}
                      <AdvancedMarker
                        position={{ lat: destinationCoords.lat, lng: destinationCoords.lng }}
                        title={`منزل ${currentOrder.recipientName}`}
                      >
                        <div className="relative group cursor-pointer">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-2xl shadow-emerald-500/40 transform transition hover:scale-110">
                            <MapPin className="w-5 h-5 text-slate-950" />
                          </div>
                          <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 bg-[#0e021f] border border-emerald-400/60 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-lg shadow-lg whitespace-nowrap font-bold">
                            منزل: {currentOrder.recipientName}
                          </div>
                        </div>
                      </AdvancedMarker>

                      {/* رسم خط المسار المذهب المتصل بين المستودع ➔ المندوب ➔ المستلم */}
                      <TrackingPolyline
                        warehouse={{ lat: WAREHOUSE_HUB.lat, lng: WAREHOUSE_HUB.lng }}
                        courier={{ lat: courierCoords.lat, lng: courierCoords.lng }}
                        destination={{ lat: destinationCoords.lat, lng: destinationCoords.lng }}
                      />
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="w-full h-full p-6 flex flex-col justify-center items-center bg-[#0e021f] text-purple-200 text-center">
                    <Compass className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                    <h4 className="font-bold text-white text-sm mb-1">تمت محاكاة مسار المندوب بنجاح</h4>
                    <p className="text-xs text-purple-300/80 max-w-sm">
                      المندوب يتحرك الآن في شوارع دمشق باتجاه ({currentOrder.recipientAddress})
                    </p>
                  </div>
                )}

                {/* لوحة معلومات الشارع اللحظية فوق الخريطة */}
                <div className="absolute top-4 right-4 bg-[#180530]/90 border border-amber-400/50 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs max-w-xs z-10">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <Compass className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>الموقع الحالي للمندوب:</span>
                  </div>
                  <p className="text-purple-200 text-[11px] leading-relaxed">
                    قرب جسر الثورة باتجاه {currentOrder.recipientCity} • السرعة: <b className="text-yellow-300 font-mono">35 كم/ساعة</b>
                  </p>
                </div>
              </div>
            </div>

            {/* مراحل تسلسل شحنة المغترب (Tracking Milestones) */}
            <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <h3 className="font-bold text-white text-base mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>مراحل تسليم الشحنة الموثقة خطوة بخطوة:</span>
              </h3>

              <div className="space-y-6 relative before:absolute before:right-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-800/80">
                {trackingSteps.map(step => (
                  <div key={step.step} className="relative flex items-start gap-4 pr-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 z-10 shadow-lg ${
                      step.isCompleted
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 ring-4 ring-amber-400/20'
                        : 'bg-[#0e021f] border border-purple-800 text-purple-400'
                    }`}>
                      {step.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.step}
                    </div>

                    <div className={`flex-1 p-4 rounded-2xl border transition ${
                      step.isActive
                        ? 'bg-[#240645] border-amber-400/60 shadow-lg shadow-purple-900/30'
                        : 'bg-[#0e021f]/80 border-purple-800/60'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-sm">{step.title}</h4>
                        <span className="text-[10px] font-mono text-amber-300 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-purple-200/80 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* العمود الجانبي: بطاقة المندوب، بيانات المستلم، وملخص السلة */}
          <div className="space-y-6">
            
            {/* بطاقة كابتن التوصيل والمندوب الميداني */}
            <div className="bg-[#180530]/90 border border-amber-400/50 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/70 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">كابتن التوصيل المعتمد</h3>
                </div>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  موثق لدى سَنَد 2
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-800 to-amber-500 p-0.5 shrink-0 shadow-lg">
                  <div className="w-full h-full bg-[#120326] rounded-2xl flex items-center justify-center text-amber-300 font-bold text-xl">
                    👨‍✈️
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">الكابتن أبو شادي</h4>
                  <p className="text-xs text-purple-300/80">مندوب التوصيل الميداني - دمشق وريفها</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-1">
                    <span>⭐ 4.98 (240+ تسليم ناجح)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e021f] p-3 rounded-2xl border border-purple-800/80 space-y-2 text-xs mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300/80">وسيلة النقل:</span>
                  <span className="font-bold text-white">دراجة نارية لوجستية سريعة 🛵</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300/80">مؤسسة التوزيع:</span>
                  <span className="font-bold text-amber-300 text-[11px]">{currentOrder.providerName || 'ياسمين الشام'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300/80">رقم الهاتف السوري:</span>
                  <span className="font-mono font-bold text-amber-400" dir="ltr">+963 944 887 766</span>
                </div>
              </div>

              {/* أزرار الاتصال المباشر بالمندوب */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+963944887766"
                  className="py-2.5 px-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-400/20"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>اتصال بالمندوب</span>
                </a>

                <a
                  href={`https://wa.me/905362515878?text=مرحباً%2C%20أنا%20المغترب%20أستفسر%20عن%20طلبي%20${currentOrder.orderNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-[#0e021f] hover:bg-purple-950 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>واتساب سَنَد 2</span>
                </a>
              </div>
            </div>

            {/* بيانات العائلة والمستلم في الداخل */}
            <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 shadow-xl backdrop-blur-md">
              <h3 className="font-bold text-white text-sm mb-3 pb-2 border-b border-purple-800/70 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>بيانات المستلم في سوريا:</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-purple-300/80 block">اسم المستلم:</span>
                  <span className="font-bold text-white text-sm">{currentOrder.recipientName}</span>
                </div>

                <div>
                  <span className="text-[10px] text-purple-300/80 block">العنوان الدقيق:</span>
                  <div className="flex items-start gap-1.5 text-purple-200 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{currentOrder.recipientCity} - {currentOrder.recipientAddress}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-purple-300/80 block">هاتف المستلم (سيريتل/MTN):</span>
                  <a href={`tel:${currentOrder.recipientPhone}`} className="text-amber-400 font-mono font-bold hover:underline inline-block mt-0.5" dir="ltr">
                    {currentOrder.recipientPhone}
                  </a>
                </div>

                {currentOrder.recipientNotes && (
                  <div className="bg-[#0e021f] p-2.5 rounded-xl border border-purple-800/80 text-[11px] text-purple-200/90 leading-relaxed">
                    <b>ملاحظاتك للمندوب:</b> {currentOrder.recipientNotes}
                  </div>
                )}
              </div>
            </div>

            {/* تفاصيل السلة والدفع بالدولار */}
            <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 shadow-xl backdrop-blur-md">
              <h3 className="font-bold text-white text-sm mb-3 pb-2 border-b border-purple-800/70 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>محتويات الطلب وقيمة الدفع:</span>
              </h3>

              <div className="space-y-2 mb-4">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-purple-800/40">
                    <span className="text-purple-200">{item.serviceTitle} × {item.quantity}</span>
                    <span className="font-mono font-bold text-amber-300">${item.totalUSD}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#240645] p-3 rounded-2xl border border-amber-400/40 text-xs flex justify-between items-center mb-3">
                <span className="text-purple-200 font-bold">الإجمالي المدفوع (Lemon Squeezy):</span>
                <span className="font-mono font-black text-amber-300 text-sm">${currentOrder.totalUSD} USD</span>
              </div>

              <div className="text-[10px] text-purple-300/70 flex justify-between items-center font-mono">
                <span>مرجع الدفع: {currentOrder.paymentReference || 'LS_PAY_VERIFIED'}</span>
                <span className="text-emerald-400 font-bold">✔ مدفوع ومؤكد</span>
              </div>
            </div>

            {/* زر طلب سلة جديدة */}
            <button
              onClick={onGoToExpatStore}
              className="w-full py-3 bg-[#0e021f] hover:bg-purple-950 border border-purple-800 hover:border-amber-400/60 text-purple-100 hover:text-amber-300 font-bold rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>طلب سلة أو خدمة إضافية لأهلك</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

          </div>

        </div>
      ) : (
        <div className="bg-[#180530] border border-purple-800 rounded-3xl p-12 text-center text-purple-200">
          <Package className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">لا توجد طلبات نشطة حالياً</h3>
          <p className="text-xs text-purple-300/80 mb-6 max-w-md mx-auto">
            يمكنك إرسال سلة غذائية أو منظومة طاقة أو وقود تدفئة لأهلك في سوريا الآن وستظهر هنا في نظام التتبع المباشر.
          </p>
          <button
            onClick={onGoToExpatStore}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-amber-400/20"
          >
            تصفح باقات سَنَد 2 واطلب الآن
          </button>
        </div>
      )}

    </div>
  );
};
