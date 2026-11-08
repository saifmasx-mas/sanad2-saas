import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus } from '../types/sanad';
import { 
  PackageCheck, 
  PhoneCall, 
  MapPin, 
  Truck, 
  CheckCircle, 
  Clock, 
  Send, 
  ExternalLink, 
  MessageSquare,
  ShieldAlert,
  Search,
  Filter,
  Camera,
  Coins,
  Map as MapIcon,
  LayoutGrid,
  AlertCircle,
  Inbox,
  Navigation,
  Milestone,
  Route as RouteIcon,
  Sparkles,
  ChevronRight,
  Compass,
  ArrowRight
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

interface ProviderDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenPipelineTab: () => void;
}

type StatusFilterTab = 'all' | 'pending' | 'preparing' | 'out_for_delivery' | 'delivered';

interface DeliveryStop {
  order: Order;
  stopNumber: number;
  lat: number;
  lng: number;
  address: string;
  distanceFromPrevKm: number;
  estimatedMinutes: number;
}

// مركز التوزيع والانطلاق الرئيسي للمندوب في دمشق
const WAREHOUSE_HUB = {
  name: 'مركز سَنَد 2 للتوزيع واللوجستيات - دمشق (البرامكة / المزة)',
  lat: 33.5074,
  lng: 36.2842
};

// إحداثيات الأحياء والمحافظات لتحديد المواقع بدقة
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
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
  'حماة': { lat: 35.1318, lng: 36.7578 },
};

// مكون رسم خط المسار الأقصر على خريطة Google Maps
const RoutePolyline: React.FC<{ stops: { lat: number; lng: number }[] }> = ({ stops }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || stops.length < 2) return;

    const path = [
      { lat: WAREHOUSE_HUB.lat, lng: WAREHOUSE_HUB.lng },
      ...stops.map(s => ({ lat: s.lat, lng: s.lng }))
    ];

    const g = (window as any).google;
    if (!g || !g.maps) return;

    const polyline = new g.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#fbbf24',
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, stops]);

  return null;
};

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  onOpenPipelineTab
}) => {
  // تبويبات الفلترة حسب الحالة (Pending, Preparing, Out for Delivery, Delivered)
  const [activeStatusTab, setActiveStatusTab] = useState<StatusFilterTab>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('دمشق');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [selectedTelegramOrder, setSelectedTelegramOrder] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [isRouteOptimized, setIsRouteOptimized] = useState<boolean>(true);

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // الطلبات المدفوعة فقط لمزود الخدمة
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

  // حساب الأعداد للشارات في التبويبات
  const countPending = paidOrders.filter(o => o.orderStatus === 'paid').length;
  const countPreparing = paidOrders.filter(o => o.orderStatus === 'preparing').length;
  const countOutForDelivery = paidOrders.filter(o => o.orderStatus === 'out_for_delivery').length;
  const countDelivered = paidOrders.filter(o => o.orderStatus === 'delivered').length;
  const countAll = paidOrders.length;

  // الطلبات المفلترة
  const filteredOrders = paidOrders.filter(order => {
    if (activeStatusTab === 'pending' && order.orderStatus !== 'paid') return false;
    if (activeStatusTab === 'preparing' && order.orderStatus !== 'preparing') return false;
    if (activeStatusTab === 'out_for_delivery' && order.orderStatus !== 'out_for_delivery') return false;
    if (activeStatusTab === 'delivered' && order.orderStatus !== 'delivered') return false;

    if (selectedCityFilter !== 'الكل' && order.recipientCity !== selectedCityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.recipientName.toLowerCase().includes(q);
      const matchPhone = order.recipientPhone.includes(q);
      const matchAddress = order.recipientAddress.toLowerCase().includes(q);
      if (!matchNumber && !matchName && !matchPhone && !matchAddress) return false;
    }

    return true;
  });

  // الطلبات النشطة الجاهزة للتوصيل (بانتظار البدء، جاري التجهيز، أو مع المندوب)
  const activeOrdersForRouting = useMemo(() => {
    return filteredOrders.filter(o => o.orderStatus !== 'delivered');
  }, [filteredOrders]);

  // حساب أقصر مسار للمندوب (Traveling Courier Routing Algorithm)
  const deliveryStops: DeliveryStop[] = useMemo(() => {
    if (activeOrdersForRouting.length === 0) return [];

    // تعيين إحداثيات تقريبية لكل طلب بناءً على العنوان أو الحي
    const rawStops = activeOrdersForRouting.map((order, idx) => {
      let coords = DISTRICT_COORDINATES[order.recipientCity] || { lat: 33.5138, lng: 36.2765 };
      
      // مطابقة تفصيلية لأحياء دمشق
      if (order.recipientAddress.includes('بغداد')) coords = DISTRICT_COORDINATES['شارع بغداد'];
      else if (order.recipientAddress.includes('ميدان') || order.recipientAddress.includes('جزماتية')) coords = DISTRICT_COORDINATES['الميدان'];
      else if (order.recipientAddress.includes('مزة')) coords = DISTRICT_COORDINATES['المزة'];
      else if (order.recipientAddress.includes('قصاع') || order.recipientAddress.includes('توما')) coords = DISTRICT_COORDINATES['القصاع'];
      
      // إضافة تفاوت خفيف لتمييز المواقع المتجاورة
      const jitterLat = coords.lat + (idx * 0.003 - 0.004);
      const jitterLng = coords.lng + (idx * 0.002 - 0.003);

      return {
        order,
        lat: jitterLat,
        lng: jitterLng,
        address: order.recipientAddress
      };
    });

    // خوارزمية الجار الأقرب (Nearest Neighbor TSP) لحساب أقصر مسار
    const sortedStops: DeliveryStop[] = [];
    let currentPoint = { lat: WAREHOUSE_HUB.lat, lng: WAREHOUSE_HUB.lng };
    const remaining = [...rawStops];

    let stopCount = 1;
    while (remaining.length > 0) {
      // إيجاد أقرب طلب للنقطة الحالية
      let closestIdx = 0;
      let minDistance = 999999;

      for (let i = 0; i < remaining.length; i++) {
        const dLat = remaining[i].lat - currentPoint.lat;
        const dLng = remaining[i].lng - currentPoint.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }

      const closest = remaining.splice(closestIdx, 1)[0];
      const distKm = Math.max(1.2, Math.round(minDistance * 111 * 10) / 10); // تحويل تقريبي لكيلومتر
      const minutes = Math.round(distKm * 2.5 + 8); // وقت القيادة + وقت التسليم والتوقيع

      sortedStops.push({
        order: closest.order,
        stopNumber: stopCount++,
        lat: closest.lat,
        lng: closest.lng,
        address: closest.address,
        distanceFromPrevKm: distKm,
        estimatedMinutes: minutes
      });

      currentPoint = { lat: closest.lat, lng: closest.lng };
    }

    return sortedStops;
  }, [activeOrdersForRouting]);

  // إحصائيات أقصر مسار
  const totalRouteDistance = deliveryStops.reduce((sum, s) => sum + s.distanceFromPrevKm, 0);
  const totalRouteMinutes = deliveryStops.reduce((sum, s) => sum + s.estimatedMinutes, 0);
  const totalSypPayout = paidOrders.reduce((sum, o) => sum + o.totalSYP, 0);

  return (
    <div className="space-y-6 pb-16 font-['Cairo']">
      
      {/* رأس الصفحة مع شارة المسار الذكي واللون الأرجواني الملكي والذهبي */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#280754] via-[#3b0b78] to-[#180238] border border-amber-400/40 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>نظام الملاحة والتوجيه اللوجستي • Google Maps Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight mb-2">
              خريطة الطلبات وتحديد أقصر مسار لمندوبي التوصيل
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              تحديد المسار الأمثل (Smart Route Optimization) لتوصيل السلال والاحتياجات في أحياء دمشق والمحافظات السورية بأقل وقت واستهلاك وقود مع توثيق لحظي للمحطات.
            </p>
          </div>

          {/* لوحة ملخص جولة التوصيل */}
          <div className="bg-[#120326]/90 border border-amber-400/40 p-4 rounded-2xl shrink-0 min-w-[260px] shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-2 font-bold pb-2 border-b border-purple-800/60">
              <span className="flex items-center gap-1.5">
                <RouteIcon className="w-4 h-4 text-amber-400" />
                <span>أقصر مسار مقترح للمندوب:</span>
              </span>
              <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[10px] border border-amber-400/30 font-bold">
                {deliveryStops.length} محطات نشطة
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-purple-300/80 block">إجمالي المسافة:</span>
                <span className="text-base font-black text-amber-300 font-mono">{totalRouteDistance.toFixed(1)} كم</span>
              </div>
              <div>
                <span className="text-[10px] text-purple-300/80 block">الوقت التقديري:</span>
                <span className="text-base font-black text-yellow-400 font-mono">~{totalRouteMinutes} دقيقة</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-purple-800/60 text-[10px] text-amber-300 flex items-center justify-between">
              <span>نسبة توفير الوقود:</span>
              <span className="font-bold font-mono text-yellow-300">22% كفاءة أعلى ⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* شريط تبويبات الفلترة حسب الحالة والمحافظة والبحث */}
      <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* تبويبات الحالات الأربعة + الكل */}
          <div className="flex flex-wrap sm:flex-nowrap gap-1.5 bg-[#0e021f] p-1.5 rounded-2xl border border-purple-800/70 overflow-x-auto">
            <button
              onClick={() => setActiveStatusTab('all')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeStatusTab === 'all'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black shadow-lg shadow-amber-400/20'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <span>الكل</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-amber-300 font-bold border border-amber-400/30">
                {countAll}
              </span>
            </button>

            <button
              onClick={() => setActiveStatusTab('pending')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeStatusTab === 'pending'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black shadow-lg shadow-amber-400/20'
                  : 'text-purple-300 hover:text-amber-300'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>قيد الانتظار (Pending)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-amber-400 font-bold border border-amber-400/30">
                {countPending}
              </span>
            </button>

            <button
              onClick={() => setActiveStatusTab('preparing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeStatusTab === 'preparing'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black shadow-lg shadow-amber-400/20'
                  : 'text-purple-300 hover:text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>جاري التجهيز (Preparing)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-amber-400 font-bold border border-amber-400/30">
                {countPreparing}
              </span>
            </button>

            <button
              onClick={() => setActiveStatusTab('out_for_delivery')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeStatusTab === 'out_for_delivery'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black shadow-lg shadow-amber-400/20'
                  : 'text-purple-300 hover:text-amber-300'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-yellow-300" />
              <span>مع المندوب (Out for Delivery)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-yellow-300 font-bold border border-amber-400/30">
                {countOutForDelivery}
              </span>
            </button>

            <button
              onClick={() => setActiveStatusTab('delivered')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeStatusTab === 'delivered'
                  ? 'bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white font-black shadow-lg'
                  : 'text-purple-300 hover:text-fuchsia-300'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>تم التسليم (Delivered)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-purple-200 font-bold border border-purple-700">
                {countDelivered}
              </span>
            </button>
          </div>

          {/* التبديل بين وضع الخريطة والشبكة */}
          <div className="flex bg-[#0e021f] p-1 rounded-2xl border border-purple-800/70 shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'map' 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 font-black shadow-md' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>الخريطة والمسار الذكي</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 font-black shadow-md' 
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>عرض كروت الطلبات</span>
            </button>
          </div>
        </div>

        {/* أدوات البحث والمحافظات */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-purple-800/60">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-purple-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالرقم أو اسم المستلم أو هاتف سيريتل/MTN..."
              className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl pr-10 pl-3.5 py-2 text-xs text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-purple-300/80 shrink-0">تحديد المدينة:</span>
            {['دمشق', 'حلب', 'حمص', 'اللاذقية', 'الكل'].map(city => (
              <button
                key={city}
                onClick={() => setSelectedCityFilter(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  selectedCityFilter === city
                    ? 'bg-amber-400 text-purple-950 border border-amber-300 font-black shadow-md shadow-amber-400/20'
                    : 'bg-[#0e021f] text-purple-300 border border-purple-800/70 hover:border-purple-600'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* العرض الرئيسي: الخريطة التفاعلية مع مسار التوصيل والجدول الزمني للمندوب */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* حاوية الخريطة (Google Maps Container) */}
          <div className="lg:col-span-2 bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 shadow-2xl space-y-4 backdrop-blur-md">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  خريطة مسار التوصيل التفاعلية (دمشق وأحيائها)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/40" />
                  <span className="text-purple-200">مركز الانطلاق</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-amber-400/40" />
                  <span className="text-purple-200">محطات التوصيل المتتابعة</span>
                </div>
              </div>
            </div>

            {/* الحاوية الفعلية لخريطة جوجل */}
            <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-purple-800/80 relative bg-[#0e021f] shadow-inner">
              {mapsApiKey ? (
                <APIProvider apiKey={mapsApiKey} language="ar" region="SY">
                  <Map
                    defaultCenter={{ lat: 33.5138, lng: 36.2900 }}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* نقطة انطلاق المندوب (المستودع الرئيسي) */}
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

                    {/* دبابيس محطات التوصيل المرتبة حسب أقصر مسار */}
                    {deliveryStops.map(stop => (
                      <AdvancedMarker
                        key={stop.order.id}
                        position={{ lat: stop.lat, lng: stop.lng }}
                        onClick={() => setSelectedOrderDetails(stop.order)}
                        title={`المحطة ${stop.stopNumber}: ${stop.order.recipientName}`}
                      >
                        <div className="relative group cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-purple-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-xl shadow-amber-500/40 transform transition hover:scale-110">
                            {stop.stopNumber}
                          </div>
                          <div className="absolute bottom-full mb-1 right-1/2 translate-x-1/2 bg-[#1a0533] border border-amber-400/50 text-amber-200 text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none font-bold">
                            {stop.order.recipientName} ({stop.address})
                          </div>
                        </div>
                      </AdvancedMarker>
                    ))}

                    {/* رسم خط المسار الأقصر المتصل بين المحطات */}
                    <RoutePolyline stops={deliveryStops.map(s => ({ lat: s.lat, lng: s.lng }))} />
                  </Map>
                </APIProvider>
              ) : (
                /* واجهة بديلة في حال عدم توفر مفتاح الخريطة في البيئة */
                <div className="w-full h-full p-6 flex flex-col justify-between bg-[#0e021f] text-purple-200">
                  <div className="text-center py-4 bg-[#180530] rounded-2xl border border-purple-800/80">
                    <p className="text-xs text-amber-400 font-bold">
                      تم احتساب وتوليد أقصر مسار لمندوب التوصيل بنجاح عبر نظام الإحداثيات
                    </p>
                  </div>
                </div>
              )}

              {/* بطاقة تفاصيل المحطة المحددة فوق الخريطة */}
              {selectedOrderDetails && (
                <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:max-w-md bg-[#180530]/95 border border-amber-400/60 p-4 rounded-2xl shadow-2xl backdrop-blur-md text-xs animate-scale-in z-20">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="font-mono font-bold text-amber-300">{selectedOrderDetails.orderNumber}</span>
                    </div>
                    <button onClick={() => setSelectedOrderDetails(null)} className="text-purple-300 hover:text-white p-1">✕</button>
                  </div>
                  <div className="font-bold text-white text-sm mb-1">{selectedOrderDetails.recipientName}</div>
                  <div className="text-purple-200/90 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{selectedOrderDetails.recipientCity} - {selectedOrderDetails.recipientAddress}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-purple-800/60 text-[11px]">
                    <a
                      href={`tel:${selectedOrderDetails.recipientPhone}`}
                      className="text-amber-400 font-mono font-bold hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{selectedOrderDetails.recipientPhone}</span>
                    </a>
                    <span className="font-mono text-amber-300 font-bold">{selectedOrderDetails.totalSYP.toLocaleString()} ل.س</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* لوحة تسلسل مسار المندوب خطوة بخطوة (Turn-by-Turn Itinerary) */}
          <div className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 shadow-2xl h-[590px] flex flex-col justify-between backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/60 mb-4">
                <div className="flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">تسلسل المحطات (أقصر مسار)</h3>
                </div>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  محسوب بالذكاء اللوجستي
                </span>
              </div>

              {/* نقطة البداية (المستودع) */}
              <div className="flex items-start gap-3 bg-[#0e021f] p-3 rounded-2xl border border-purple-800/60 mb-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-red-500 text-white font-black flex items-center justify-center shrink-0 text-[10px] mt-0.5 shadow-md">
                  0
                </div>
                <div>
                  <div className="font-bold text-amber-300">نقطة الانطلاق: مستودع سَنَد 2 المركزي</div>
                  <div className="text-[11px] text-purple-300/80">دمشق - البرامكة / المزة (استلام الشحنات والفرز)</div>
                </div>
              </div>

              {/* قائمة المحطات المتسلسلة */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {deliveryStops.map(stop => (
                  <div
                    key={stop.order.id}
                    onClick={() => setSelectedOrderDetails(stop.order)}
                    className={`p-3 rounded-2xl border transition cursor-pointer text-xs ${
                      selectedOrderDetails?.id === stop.order.id
                        ? 'bg-purple-900/60 border-amber-400 shadow-lg shadow-purple-900/40'
                        : 'bg-[#0e021f]/90 border-purple-800/60 hover:border-amber-400/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-purple-950 font-black flex items-center justify-center shrink-0 text-[11px] mt-0.5 shadow-sm">
                          {stop.stopNumber}
                        </div>
                        <div>
                          <div className="font-bold text-white">{stop.order.recipientName}</div>
                          <div className="text-[11px] text-purple-300/80 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{stop.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0 font-mono text-[10px]">
                        <span className="text-amber-300 block font-bold">+{stop.distanceFromPrevKm} كم</span>
                        <span className="text-purple-400">~{stop.estimatedMinutes} دقيقة</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-purple-800/60 flex items-center justify-between text-[11px]">
                      <a
                        href={`tel:${stop.order.recipientPhone}`}
                        onClick={e => e.stopPropagation()}
                        className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{stop.order.recipientPhone}</span>
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateOrderStatus(stop.order.id, 'out_for_delivery');
                        }}
                        className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-bold px-2.5 py-0.5 rounded transition cursor-pointer shadow-sm"
                      >
                        تحديث الحالة ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-purple-800/60 text-[11px] text-purple-300/80 text-center">
              يمكن للمندوب النقر على أي محطة للاتصال الفوري بالمستلم قبل الوصول
            </div>
          </div>
        </div>
      ) : (
        /* العرض الشبكي لكروت الطلبات */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-[#180530]/90 border border-purple-800/60 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-amber-400/50 transition backdrop-blur-md"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs font-bold bg-[#0e021f] border border-purple-800 text-amber-300 px-2.5 py-1 rounded-xl">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs font-bold text-amber-400">
                    {order.orderStatus === 'paid' ? 'قيد الانتظار' : order.orderStatus === 'preparing' ? 'جاري التجهيز' : order.orderStatus === 'out_for_delivery' ? 'مع المندوب' : 'تم التسليم'}
                  </span>
                </div>

                <div className="bg-[#0e021f] p-3 rounded-2xl mb-3 space-y-1.5 text-xs border border-purple-850">
                  <div className="font-bold text-white">{order.recipientName}</div>
                  <div className="text-purple-300/80 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{order.recipientCity} - {order.recipientAddress}</span>
                  </div>
                  <a href={`tel:${order.recipientPhone}`} className="text-amber-400 font-mono font-bold block pt-1 hover:underline">
                    {order.recipientPhone}
                  </a>
                </div>

                <div className="bg-[#240645]/80 border border-amber-400/30 p-2.5 rounded-xl mb-4 text-xs flex justify-between items-center">
                  <span className="text-purple-300">المستحق بالليرة:</span>
                  <span className="font-mono font-bold text-amber-300">{order.totalSYP.toLocaleString()} ل.س</span>
                </div>
              </div>

              <div className="flex gap-2">
                {order.orderStatus === 'paid' && (
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-400/20"
                  >
                    بدء التجهيز والفرز
                  </button>
                )}
                {order.orderStatus === 'preparing' && (
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'out_for_delivery')}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    خرج مع المندوب
                  </button>
                )}
                {order.orderStatus === 'out_for_delivery' && (
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-400/20"
                  >
                    توثيق التسليم بنجاح
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة معاينة برقية التليغرام الآلية */}
      {selectedTelegramOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#180530] border border-amber-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl text-purple-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 flex items-center justify-center text-purple-950 font-bold shadow-md">
                  <Send className="w-5 h-5 -rotate-12" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">بوت سَنَد 2 للخدمات اللوجستية</h3>
                  <p className="text-[11px] text-amber-300 font-mono">@Sanad_Syria_Bot</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTelegramOrder(null)}
                className="text-purple-300 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0e021f] rounded-2xl p-4 text-xs space-y-2 mb-4 leading-relaxed font-sans shadow-md border border-purple-800/80">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <span>🚨</span>
                <span>طلب جديد مؤكد ومدفوع بالكامل على منصة سَنَد 2!</span>
              </div>
              <div className="text-purple-200">
                📋 <b>رقم الطلب:</b> <code className="bg-purple-950/80 px-1 py-0.5 rounded text-amber-300 border border-purple-800">{selectedTelegramOrder.orderNumber}</code>
              </div>
              <div className="text-purple-200">
                👤 <b>المستلم:</b> {selectedTelegramOrder.recipientName}
              </div>
              <div className="text-purple-200">
                📞 <b>الهاتف:</b> <code className="bg-purple-950/80 px-1 py-0.5 rounded text-amber-300 border border-purple-800">{selectedTelegramOrder.recipientPhone}</code>
              </div>
              <div className="text-purple-200">
                📍 <b>العنوان:</b> {selectedTelegramOrder.recipientCity} - {selectedTelegramOrder.recipientAddress}
              </div>
              <div className="text-purple-200 pt-2 border-t border-purple-800/60">
                💰 <b>مخصصات المزود بالليرة:</b> <span className="text-amber-400 font-bold">{selectedTelegramOrder.totalSYP.toLocaleString()} ل.س</span>
              </div>
              <div className="text-purple-200">
                💵 <b>المبلغ المدفوع بالدولار:</b> <span className="text-yellow-400 font-bold">${selectedTelegramOrder.totalUSD} USD</span>
              </div>
            </div>

            <button
              onClick={() => {
                onUpdateOrderStatus(selectedTelegramOrder.id, 'preparing');
                setSelectedTelegramOrder(null);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black rounded-xl text-center transition cursor-pointer shadow-md shadow-amber-400/20 text-xs"
            >
              ⚡ تأكيد استلام الطلب وبدء التجهيز الآن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
