import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExpatDashboard } from './components/ExpatDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { SimulationPipeline } from './components/SimulationPipeline';
import { AiPricingModal } from './components/AiPricingModal';
import { ContactUs } from './components/ContactUs';
import { AuthModal } from './components/AuthModal';
import { CustomerChatbot } from './components/CustomerChatbot';
import { OrderTracking } from './components/OrderTracking';
import { 
  INITIAL_SERVICES, 
  INITIAL_ORDERS, 
  CURRENT_EXCHANGE_RATE, 
  INITIAL_LOGS, 
  CURRENT_EXPAT_USER, 
  CURRENT_PROVIDER_USER 
} from './data/mockData';
import { 
  Order, 
  ServicePackage, 
  OrderStatus, 
  ExchangeRateInfo, 
  AgentLog,
  UserProfile 
} from './types/sanad';

export default function App() {
  const [activeTab, setActiveTab] = useState<'expat' | 'tracking' | 'provider' | 'architecture' | 'pipeline' | 'contact'>('expat');
  const [services, setServices] = useState<ServicePackage[]>(INITIAL_SERVICES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateInfo>(CURRENT_EXCHANGE_RATE);
  const [logs, setLogs] = useState<AgentLog[]>(INITIAL_LOGS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(CURRENT_EXPAT_USER);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | undefined>(undefined);
  
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // إجمالي الطلبات المدفوعة المعروضة لمزود الخدمة في سوريا
  const paidOrdersCount = orders.filter(o => o.paymentStatus === 'paid').length;

  // إضافة طلب جديد بعد الدفع عبر Lemon Squeezy
  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);

    // تسجيل الأحداث في سجلات العمليات الآلية
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLogs: AgentLog[] = [
      {
        id: `log-${Date.now()}-1`,
        timestamp: now,
        source: 'Lemon Squeezy',
        action: 'order_created event',
        details: `تم استلام دفعة بقيمة $${newOrder.totalUSD} للطلب ${newOrder.orderNumber} مع التوقيع الرقمي.`,
        status: 'success'
      },
      {
        id: `log-${Date.now()}-2`,
        timestamp: now,
        source: 'n8n Automation',
        action: 'HMAC Validated & Supabase Updated',
        details: `تحقق n8n من صحة التوقيع المشفر وتحديث حالة الطلب إلى 'paid' في قاعدة بيانات Supabase.`,
        status: 'success'
      },
      {
        id: `log-${Date.now()}-3`,
        timestamp: now,
        source: 'Telegram Bot API',
        action: 'Dispatched to Syrian Provider',
        details: `تم إرسال برقية عاجلة لمزود دمشق (${newOrder.recipientName} - ${newOrder.recipientCity}) لبدء التجهيز.`,
        status: 'success'
      }
    ];

    setLogs(prev => [...newLogs, ...prev]);
  };

  // تحديث حالة الطلب من قبل المزود
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: nextStatus,
          ...(nextStatus === 'delivered' ? { deliveredAt: new Date().toISOString() } : {})
        };
      }
      return o;
    }));

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const statusLabels: Record<string, string> = {
        preparing: 'بدء التجهيز والفرز في المستودع',
        out_for_delivery: 'خرجت الشحنة مع مندوب التوصيل',
        delivered: 'تم تسليم السلة بنجاح للأهل وتوثيق الإيصال'
      };

      setLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          source: 'Syrian Provider Portal',
          action: `Status: ${nextStatus}`,
          details: `المزود ${targetOrder.providerName} قام بتحديث حالة الطلب ${targetOrder.orderNumber} إلى (${statusLabels[nextStatus] || nextStatus}).`,
          status: 'info'
        },
        ...prev
      ]);
    }
  };

  // تطبيق سعر صرف جديد من وكيل الذكاء الاصطناعي (Gemini)
  const handleApplyNewRate = (newMarketRate: number, hedgePercent: number, summary: string) => {
    const hedged = Math.round(newMarketRate * (1 + hedgePercent / 100));
    
    setExchangeRate({
      usdToSypOfficial: 13500,
      usdToSypMarket: newMarketRate,
      hedgedRate: hedged,
      volatilityIndex: hedgePercent > 5 ? 'high' : 'moderate',
      lastRefreshed: 'الآن (مباشرة عبر وكيل Gemini الذكي)'
    });

    // تحديث أسعار كافة الخدمات بالليرة السورية تلقائياً
    setServices(prev => prev.map(s => ({
      ...s,
      priceSYP: Math.round((s.priceUSD * hedged) / 100) * 100,
      lastUpdated: 'تم التحديث للتو عبر Gemini'
    })));

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: now,
        source: 'Python VPS Agent',
        action: 'Dynamic Repricing',
        details: summary,
        status: 'success'
      },
      ...prev
    ]);
  };

  // تشغيل الدورة الآلية الكاملة بالترتيب
  const handleTriggerFullPipeline = () => {
    setIsSimulating(true);

    const orderNumber = `SND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomCity = ['دمشق', 'حلب', 'حمص', 'اللاذقية'][Math.floor(Math.random() * 4)];
    const selectedSrv = services[0];

    const simOrder: Order = {
      id: `ord-sim-${Date.now()}`,
      orderNumber,
      expatId: currentUser?.id || 'usr-exp-01',
      expatName: currentUser?.fullName || 'سيف الدين الحلبي',
      expatPhone: currentUser?.phone || '+90 536 251 58 78',
      expatCountry: currentUser?.country || 'تركيا (بورصة)',
      recipientName: 'عائلة المرحوم عبد القادر النابلسي',
      recipientPhone: '+963 944 887 766',
      recipientCity: randomCity,
      recipientAddress: 'حي الميدان، دخلة جامع الحسن، بناء الياسمين',
      recipientNotes: 'يرجى التأكد من تسليم السلة للوالدة شخصياً',
      items: [
        {
          serviceId: selectedSrv.id,
          serviceTitle: selectedSrv.titleAr,
          quantity: 1,
          unitPriceUSD: selectedSrv.priceUSD,
          totalUSD: selectedSrv.priceUSD
        }
      ],
      totalUSD: selectedSrv.priceUSD,
      totalSYP: selectedSrv.priceUSD * exchangeRate.hedgedRate,
      exchangeRateUsed: exchangeRate.hedgedRate,
      paymentStatus: 'paid',
      paymentReference: `LS_PAY_${Math.floor(100000000 + Math.random() * 900000000)}`,
      orderStatus: 'preparing',
      providerId: 'usr-prv-01',
      providerName: 'مؤسسة ياسمين الشام للخدمات اللوجستية',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      telegramNotificationSent: true
    };

    setTimeout(() => {
      handlePlaceOrder(simOrder);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0d011c] text-purple-100 font-['Cairo',sans-serif] selection:bg-amber-400 selection:text-purple-950 relative overflow-x-hidden">
      {/* خلفيات هالات كونية بنفسجية وذهبية مستوحاة من التصميم */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-10 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* شريط التنقل العلوي لسَنَد 2 */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        exchangeRate={exchangeRate}
        onRefreshPricing={() => setIsPricingModalOpen(true)}
        isRefreshingRate={isRefreshingRate}
        cartCount={0}
        paidOrdersCount={paidOrdersCount}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'expat' && (
          <ExpatDashboard
            services={services}
            exchangeRate={exchangeRate}
            currentUser={currentUser || CURRENT_EXPAT_USER}
            onPlaceOrder={handlePlaceOrder}
            onGoToProvider={() => setActiveTab('provider')}
            onGoToTracking={(orderId) => {
              if (orderId) setActiveTrackingOrderId(orderId);
              setActiveTab('tracking');
            }}
          />
        )}

        {activeTab === 'tracking' && (
          <OrderTracking
            orders={orders}
            activeOrderId={activeTrackingOrderId}
            onGoToExpatStore={() => setActiveTab('expat')}
          />
        )}

        {activeTab === 'provider' && (
          <ProviderDashboard
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenPipelineTab={() => setActiveTab('pipeline')}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDocs />
        )}

        {activeTab === 'pipeline' && (
          <SimulationPipeline
            orders={orders}
            logs={logs}
            onTriggerFullPipeline={handleTriggerFullPipeline}
            onRunGeminiAgent={() => setIsPricingModalOpen(true)}
            isSimulating={isSimulating}
            services={services}
          />
        )}

        {activeTab === 'contact' && (
          <ContactUs />
        )}
      </main>

      {/* نافذة اختبار وكيل Gemini للتسعير الذكي */}
      <AiPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentRate={exchangeRate}
        onApplyNewRate={handleApplyNewRate}
      />

      {/* نافذة تسجيل الدخول وإنشاء الحساب مع أيقونة Google */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        currentUser={currentUser}
      />

      {/* الشات بوت الذكي للرد على العملاء (Customer Support Chatbot) */}
      <CustomerChatbot />

      {/* شريط سفلي موثق باللون البنفسجي الملكي والذهبي */}
      <footer className="border-t border-purple-900/40 bg-[#120227]/90 backdrop-blur-md py-6 text-center text-xs text-purple-300/70 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
            <span className="font-bold text-amber-300">سَنَد 2 (Sanad 2)</span>
            <span>- تركيا، بورصة • هاتف: +90 536 251 58 78 • saif.masx@gmail.com</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-amber-400/80 font-mono">
            <span>Next.js 15</span>
            <span>•</span>
            <span>Supabase Auth</span>
            <span>•</span>
            <span>Google OAuth</span>
            <span>•</span>
            <span>Lemon Squeezy</span>
            <span>•</span>
            <span>Gemini AI Chatbot</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
