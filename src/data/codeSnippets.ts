export const SQL_SCHEMA_CODE = `-- ====================================================================
-- منصة "سَنَد" (Sanad) - مخطط قاعدة بيانات Supabase (PostgreSQL 15+)
-- مصمم خصيصاً للمتانة، الأمان العالي (RLS)، والتوسع بدون أخطاء
-- ====================================================================

-- 1. تفعيل الامتدادات الضرورية لإنشاء المعرّفات الفريدة والتشفير
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. إنشاء الأنواع المخصصة (Enums) لضبط القيم المقبولة ومنع الأخطاء الإملائية
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('expat', 'local_provider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'pending_payment',
        'paid',
        'assigned_to_provider',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_category AS ENUM ('food', 'energy', 'health', 'fuel', 'home', 'cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. جدول المستخدمين الممتد (مرتبط بـ auth.users في Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'expat',
    country TEXT NOT NULL,              -- مثال: "Germany", "Sweden", "Syria"
    city TEXT,                          -- للمزود المحلي: "دمشق", "حلب", "حمص"
    telegram_chat_id TEXT,              -- مهم جداً لإشعارات المزودين في سوريا
    is_verified BOOLEAN DEFAULT false,  -- توثيق المزودين لمنع الاحتيال
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الخدمات والباقات المتوفرة (Services)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    category service_category NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL CHECK (price_usd > 0),
    price_syp NUMERIC(15, 2) NOT NULL CHECK (price_syp > 0), -- يتم تحديثه آلياً بواسطة سكريبت البايثون
    unit TEXT NOT NULL DEFAULT 'طرد',
    available_cities TEXT[] NOT NULL DEFAULT ARRAY['دمشق'],
    is_active BOOLEAN DEFAULT true,
    estimated_delivery_hours INTEGER DEFAULT 24,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول الطلبات (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,                       -- مثال: SND-2026-8491
    expat_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- بيانات المستلم في الداخل السوري (ضرورية جداً للمزود)
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,                          -- رقم سيريتل / MTN / واتساب
    recipient_city TEXT NOT NULL,                           -- المحافظة
    recipient_address TEXT NOT NULL,                        -- العنوان الدقيق والحي
    delivery_notes TEXT,                                    -- ملاحظات مثل: طابق 3، مصعد معطل
    
    -- البيانات المالية والتسعير عند لحظة الدفع
    total_usd NUMERIC(10, 2) NOT NULL,
    total_syp NUMERIC(15, 2) NOT NULL,
    exchange_rate_locked NUMERIC(15, 2) NOT NULL,           -- تثبيت سعر الصرف لمنع الخلافات
    
    -- حالات الطلب والدفع
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    lemon_squeezy_order_id TEXT UNIQUE,                     -- رقم المعاملة من Lemon Squeezy
    order_status order_status NOT NULL DEFAULT 'pending_payment',
    
    -- التوثيق والإثباتات
    proof_image_url TEXT,                                   -- صورة إثبات التسليم الموقعة
    paid_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول عناصر الطلب (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_usd NUMERIC(10, 2) NOT NULL,
    unit_price_syp NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول تتبع سجلات وتغيرات الأسعار (Price History للوكيل الذكي)
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    old_price_syp NUMERIC(15, 2) NOT NULL,
    new_price_syp NUMERIC(15, 2) NOT NULL,
    usd_to_syp_rate NUMERIC(15, 2) NOT NULL,
    source TEXT DEFAULT 'python_gemini_agent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- الفهارس (Indexes) لتسريع الاستعلامات وتجنب بطء السيرفر
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_orders_expat_id ON public.orders(expat_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON public.orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_recipient_city ON public.orders(recipient_city);
CREATE INDEX IF NOT EXISTS idx_orders_ls_id ON public.orders(lemon_squeezy_order_id);

-- ====================================================================
-- قواعد الأمان الصارمة على مستوى الصفوف (Row Level Security - RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- 1. سياسات جدول الخدمات: متاحة للقراءة للجميع
CREATE POLICY "Services are viewable by everyone" 
    ON public.services FOR SELECT 
    USING (is_active = true);

-- 2. سياسات الطلبات للمغترب: يرى طلباته فقط ويستطيع إنشاء طلب جديد
CREATE POLICY "Expats can view their own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = expat_id);

CREATE POLICY "Expats can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = expat_id);

-- 3. سياسة حاسمة لمزود الخدمة في سوريا:
-- يرى فقط الطلبات المدفوعة ('paid') والواقعة في مدينته، أو المسندة إليه شخصياً!
CREATE POLICY "Providers view paid orders in their city" 
    ON public.orders FOR SELECT 
    USING (
        payment_status = 'paid' 
        AND (
            provider_id = auth.uid() 
            OR recipient_city IN (
                SELECT city FROM public.profiles WHERE id = auth.uid() AND role = 'local_provider'
            )
        )
    );

CREATE POLICY "Providers can update assigned order status" 
    ON public.orders FOR UPDATE 
    USING (provider_id = auth.uid())
    WITH CHECK (provider_id = auth.uid());

-- خدمة n8n وسكريبت بايثون يستعملان مفتاح SERVICE_ROLE_KEY الذي يتجاوز RLS بأمان.
`;

export const NEXTJS_EXPAT_CODE = `// ====================================================================
// app/expat/dashboard/page.tsx - واجهة المغترب لطلب السلال والخدمات
// Next.js 14/15 App Router مع Server Actions و Supabase Client
// ====================================================================
'use client';

import { useState, useTransition } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ShoppingBag, Zap, HeartPulse, Flame, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Service {
  id: string;
  title_ar: string;
  description_ar: string;
  price_usd: number;
  price_syp: number;
  available_cities: string[];
}

export default function ExpatOrderDashboard({ initialServices }: { initialServices: Service[] }) {
  const supabase = createClientComponentClient();
  const [selectedCity, setSelectedCity] = useState('دمشق');
  const [cart, setCart] = useState<{ [serviceId: string]: number }>({});
  const [recipient, setRecipient] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const filteredServices = initialServices.filter(s => s.available_cities.includes(selectedCity));

  const totalUSD = Object.entries(cart).reduce((sum, [id, qty]) => {
    const srv = initialServices.find(s => s.id === id);
    return sum + (srv ? srv.price_usd * qty : 0);
  }, 0);

  // إرسال الطلب والتحويل لبوابة الدفع Lemon Squeezy
  async function handleCheckout() {
    if (!recipient.name || !recipient.phone || !recipient.address) {
      setErrorMsg('يرجى تعبئة كافة بيانات المستلم في سوريا للتسليم بدقة');
      return;
    }
    if (totalUSD <= 0) {
      setErrorMsg('يرجى اختيار باقة واحدة على الأقل');
      return;
    }

    startTransition(async () => {
      try {
        setErrorMsg('');
        // 1. إنشاء مسودة طلب في Supabase عبر API Route
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient,
            recipientCity: selectedCity,
            cartItems: cart,
            totalUSD,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'حدث خطأ في إنشاء الطلب');

        // 2. التحويل المباشر إلى صفحة دفع Lemon Squeezy
        window.location.href = data.checkoutUrl;
      } catch (err: any) {
        setErrorMsg(err.message || 'تعذر الاتصال ببوابة الدفع');
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-['Cairo']" dir="rtl">
      {/* رأس الصفحة مع شارة الأمان */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400">سَنَد | لوحة طلبات المغتربين</h1>
          <p className="text-sm text-slate-400">اختر احتياجات عائلتك بالدولار، ونتكفل بالتسليم الموثق في سوريا</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/50 px-3 py-1.5 rounded-full text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          <span>دفع دولي آمن 100% عبر Lemon Squeezy</span>
        </div>
      </header>

      {/* خطوة 1: اختيار المحافظة المستهدفة */}
      <section className="mb-8">
        <label className="block text-sm font-semibold mb-2 text-slate-300">حدد محافظة الأهل في الداخل السوري:</label>
        <div className="flex flex-wrap gap-2">
          {['دمشق', 'ريف دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس', 'حماة'].map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={\`px-4 py-2 rounded-xl text-sm font-medium transition \${
                selectedCity === city
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }\`}
            >
              📍 {city}
            </button>
          ))}
        </div>
      </section>

      {/* عرض الباقات المتاحة وبيانات المستلم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200">الباقات المتوفرة للتوصيل في {selectedCity}:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(srv => {
              const qty = cart[srv.id] || 0;
              return (
                <div key={srv.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition">
                  <h3 className="font-bold text-slate-100 text-base mb-1">{srv.title_ar}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{srv.description_ar}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-800/80">
                    <div>
                      <span className="text-xl font-black text-emerald-400">\${srv.price_usd}</span>
                      <span className="text-xs text-slate-400 block">≈ {srv.price_syp.toLocaleString()} ل.س</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <button
                          onClick={() => setCart(c => ({ ...c, [srv.id]: Math.max(0, qty - 1) }))}
                          className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                        >
                          -
                        </button>
                      )}
                      {qty > 0 && <span className="font-bold text-sm px-1">{qty}</span>}
                      <button
                        onClick={() => setCart(c => ({ ...c, [srv.id]: qty + 1 }))}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition"
                      >
                        {qty > 0 ? '+ إضافة' : 'اختيار الباقة'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* سلة الشراء وبيانات المستلم */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4 pb-2 border-b border-slate-800">بيانات التوصيل في سوريا</h2>
          
          <div className="space-y-3 mb-6 text-sm">
            <div>
              <label className="block text-xs text-slate-400 mb-1">اسم المستلم الثلاثي:</label>
              <input
                type="text"
                value={recipient.name}
                onChange={e => setRecipient({ ...recipient, name: e.target.value })}
                placeholder="مثال: أم محمد الحلبي"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">رقم الهاتف (سيريتل / MTN):</label>
              <input
                type="tel"
                value={recipient.phone}
                onChange={e => setRecipient({ ...recipient, phone: e.target.value })}
                placeholder="+963 944 000 000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">العنوان بالتفصيل:</label>
              <input
                type="text"
                value={recipient.address}
                onChange={e => setRecipient({ ...recipient, address: e.target.value })}
                placeholder="المنطقة، الشارع، البناء، رقم الطابق"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mb-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-400">إجمالي الطلب:</span>
              <span className="text-2xl font-black text-emerald-400">\${totalUSD}</span>
            </div>
            <p className="text-xs text-slate-500">شامل التوصيل ورسوم التحويل والضمان</p>
          </div>

          {errorMsg && <p className="text-xs text-rose-400 mb-3 bg-rose-950/40 p-2 rounded-lg">{errorMsg}</p>}

          <button
            onClick={handleCheckout}
            disabled={isPending || totalUSD === 0}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition disabled:opacity-50"
          >
            {isPending ? 'جاري التحويل لـ Lemon Squeezy...' : 'تأكيد ودفع بالدولار (Lemon Squeezy)'}
          </button>
        </div>
      </div>
    </div>
  );
}`;

export const NEXTJS_PROVIDER_CODE = `// ====================================================================
// app/provider/dashboard/page.tsx - واجهة مزود الخدمة المحلي في سوريا
// يستعرض فقط الطلبات التي تم دفع ثمنها بالكامل (payment_status = 'paid')
// مع ميزة الاشتراك الفوري Realtime عبر Supabase
// ====================================================================
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PackageCheck, PhoneCall, MapPin, Truck, CheckCircle, Clock } from 'lucide-react';

interface PaidOrder {
  id: string;
  order_number: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_city: string;
  recipient_address: string;
  delivery_notes?: string;
  total_syp: number;
  total_usd: number;
  order_status: 'paid' | 'preparing' | 'out_for_delivery' | 'delivered';
  paid_at: string;
  items_summary: string;
}

export default function ProviderLiveDashboard() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<PaidOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب الطلبات المدفوعة فقط لمزود الخدمة
  async function fetchPaidOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid') // شرط حاسم: الطلبات المدفوعة فقط!
      .order('paid_at', { ascending: false });

    if (!error && data) {
      setOrders(data as any);
    }
    setLoading(false);
  }

  // 2. تفعيل الاستماع اللحظي (Supabase Realtime) فور وصول إشعار دفع جديد
  useEffect(() => {
    fetchPaidOrders();

    const channel = supabase
      .channel('realtime_paid_orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: 'payment_status=eq.paid' },
        (payload) => {
          // صوت إشعار أو تحديث تلقائي للجدول عند وصول دفع جديد
          fetchPaidOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. تحديث حالة الطلب من قبل المزود في سوريا
  async function updateOrderStatus(orderId: string, nextStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: nextStatus,
        updated_at: new Date().toISOString(),
        ...(nextStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {})
      })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: nextStatus as any } : o));
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-['Cairo']" dir="rtl">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl font-black text-slate-100">بوابة المزود المعتمد - دمشق وريفها</h1>
          </div>
          <p className="text-sm text-slate-400">الطلبات المؤكدة والمدفوعة بالكامل بالدولار والجاهزة للتسليم الفوري</p>
        </div>
      </header>

      {/* قائمة الطلبات المؤكد دفعها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            {/* شريط حالة الدفع */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                {order.order_number}
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> تم الدفع بالدولار
              </span>
            </div>

            {/* بيانات المستلم للتواصل الفوري في سوريا */}
            <div className="space-y-2 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-sm">
              <div className="font-bold text-slate-200">{order.recipient_name}</div>
              <a href={\`tel:\${order.recipient_phone}\`} className="flex items-center gap-2 text-emerald-400 font-mono hover:underline">
                <PhoneCall className="w-4 h-4" /> {order.recipient_phone}
              </a>
              <div className="flex items-start gap-2 text-slate-400 text-xs">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{order.recipient_city} - {order.recipient_address}</span>
              </div>
            </div>

            {/* المبلغ المستحق للمزود بالليرة السورية */}
            <div className="flex justify-between items-center bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl mb-4 text-xs">
              <span className="text-emerald-300 font-semibold">مخصصات المزود المحلية:</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">
                {order.total_syp?.toLocaleString()} ل.س
              </span>
            </div>

            {/* أزرار تسلسل التنفيذ للمزود */}
            <div className="flex gap-2">
              {order.order_status === 'paid' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs"
                >
                  ⚡ بدء التجهيز والفرز
                </button>
              )}
              {order.order_status === 'preparing' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs"
                >
                  🚚 خرج مع المندوب للتسليم
                </button>
              )}
              {order.order_status === 'out_for_delivery' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs"
                >
                  ✅ تم التسليم بنجاح وتوثيق الاستلام
                </button>
              )}
              {order.order_status === 'delivered' && (
                <div className="w-full text-center py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold">
                  مكتمل وموثق في السجلات
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

export const N8N_WORKFLOW_JSON = `{
  "name": "Sanad_LemonSqueezy_To_Supabase_And_Telegram",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "lemon-squeezy-webhook",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "node-webhook-in",
      "name": "Lemon Squeezy Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "// 1. التحقق من توقيع HMAC-SHA256 الصادر من Lemon Squeezy\\nconst crypto = require('crypto');\\nconst secret = $env.LEMON_SQUEEZY_WEBHOOK_SECRET;\\nconst hmac = crypto.createHmac('sha256', secret);\\nconst rawBody = $input.first().json.bodyRaw;\\nconst expectedSignature = $input.first().json.headers['x-signature'];\\n\\nconst computedSignature = hmac.update(rawBody).digest('hex');\\n\\nif (computedSignature !== expectedSignature) {\\n  throw new Error('Invalid Lemon Squeezy Signature!');\\n}\\n\\nconst payload = $input.first().json.body;\\nconst eventName = payload.meta.event_name;\\n\\n// التحقق من أن الحدث هو تأكيد الدفع بنجاح\\nif (eventName !== 'order_created' || payload.data.attributes.status !== 'paid') {\\n  return []; // تجاهل الأحداث غير المكتملة\\n}\\n\\nreturn [{\\n  json: {\\n    orderId: payload.meta.custom_data.sanad_order_id,\\n    lsOrderId: payload.data.id,\\n    amountUsd: payload.data.attributes.total_usd / 100,\\n    customerEmail: payload.data.attributes.user_email,\\n    paidAt: payload.data.attributes.created_at\\n  }\\n}];"
      },
      "id": "node-verify-hmac",
      "name": "Verify HMAC & Parse",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "operation": "update",
        "table": "orders",
        "updateKey": "id",
        "columns": "payment_status,order_status,lemon_squeezy_order_id,paid_at",
        "fieldsUi": {
          "fieldValues": [
            { "fieldId": "id", "fieldValue": "={{ $json.orderId }}" },
            { "fieldId": "payment_status", "fieldValue": "paid" },
            { "fieldId": "order_status", "fieldValue": "paid" },
            { "fieldId": "lemon_squeezy_order_id", "fieldValue": "={{ $json.lsOrderId }}" },
            { "fieldId": "paid_at", "fieldValue": "={{ $json.paidAt }}" }
          ]
        }
      },
      "id": "node-supabase-update",
      "name": "Update Order in Supabase",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "operation": "get",
        "table": "orders",
        "returnAll": false,
        "filters": {
          "filter": [
            { "column": "id", "operator": "equals", "value": "={{ $json.orderId }}" }
          ]
        }
      },
      "id": "node-supabase-get-details",
      "name": "Fetch Recipient & City Details",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [880, 300]
    },
    {
      "parameters": {
        "chatId": "={{ $json.provider_telegram_chat_id || '-1002345678901' }}",
        "text": "=🚨 *طلب جديد مدفوع بالكامل على منصة سَنَد*\\n\\n📋 *رقم الطلب:* \`{{ $json.order_number }}\`\\n👤 *المستلم:* {{ $json.recipient_name }}\\n📞 *الهاتف:* \`{{ $json.recipient_phone }}\`\\n📍 *العنوان:* {{ $json.recipient_city }} - {{ $json.recipient_address }}\\n📝 *ملاحظات:* {{ $json.delivery_notes || 'لا يوجد' }}\\n💰 *المبلغ بالليرة للمزود:* {{ $json.total_syp }} ل.س\\n💵 *المدفوع دولياً:* \${{ $json.total_usd }}\\n\\nيرجى البدء بتجهيز السلة وإعلامنا عند خروج المندوب! 🛵",
        "additionalFields": {
          "parse_mode": "Markdown",
          "reply_markup": {
            "inline_keyboard": [
              [
                {
                  "text": "⚡ تأكيد استلام الطلب وبدء التجهيز",
                  "callback_data": "=accept_{{ $json.id }}"
                }
              ]
            ]
          }
        }
      },
      "id": "node-telegram-bot",
      "name": "Send Telegram to Syrian Provider",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [1100, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "{\\"status\\": \\"success\\", \\"message\\": \\"Order paid and notification dispatched\\"}"
      },
      "id": "node-http-response",
      "name": "HTTP 200 OK Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1300, 300]
    }
  ],
  "connections": {
    "Lemon Squeezy Webhook": { "main": [[{ "node": "Verify HMAC & Parse", "type": "main", "index": 0 }]] },
    "Verify HMAC & Parse": { "main": [[{ "node": "Update Order in Supabase", "type": "main", "index": 0 }]] },
    "Update Order in Supabase": { "main": [[{ "node": "Fetch Recipient & City Details", "type": "main", "index": 0 }]] },
    "Fetch Recipient & City Details": { "main": [[{ "node": "Send Telegram to Syrian Provider", "type": "main", "index": 0 }]] },
    "Send Telegram to Syrian Provider": { "main": [[{ "node": "HTTP 200 OK Response", "type": "main", "index": 0 }]] }
  }
}`;

export const PYTHON_AGENT_CODE = `#!/usr/bin/env python3
# ====================================================================
# sanad_price_agent.py - وكيل التسعير الذكي المستقل (24/7 على VPS)
# يستخدم Google GenAI (Gemini API) لتحليل بيانات السوق، ويتصل بـ Supabase
# لتحديث حقل price_syp مع هامش تحوط تلقائي كل 12 ساعة
# ====================================================================

import os
import sys
import time
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

# تحميل متغيرات البيئة من ملف .env
load_dotenv('/opt/sanad-agent/.env')

# إعداد السجلات (Rotating Logs على السيرفر)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('/var/log/sanad-agent.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('SanadAgent')

# استيراد مكتبات Supabase و Gemini
try:
    from supabase import create_client, Client
    from google import genai
    from google.genai import types
except ImportError as e:
    logger.critical(f"Missing libraries: {e}. Run: pip install supabase google-genai python-dotenv")
    sys.exit(1)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # مفتاح الخدمة لتخطي RLS
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HEDGE_MARGIN_PERCENT = float(os.getenv("HEDGE_MARGIN_PERCENT", "4.5")) # هامش أمان تقلب الصرف 4.5%

if not all([SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY]):
    logger.error("Missing critical environment variables! Check .env file.")
    sys.exit(1)

# تهيئة عميل Supabase وعميل Gemini
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
ai_client = genai.Client(api_key=GEMINI_API_KEY)


def fetch_raw_market_bulletin() -> str:
    """
    محاكاة جلب أحدث نشرات أسعار الصرف والسلع المحلية في سوريا
    (يمكن ربطها بقنوات تليغرام مثل الليرة اليوم أو موقع محلي عبر Scraper)
    """
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    bulletin = f"""
    نشرة السوق الموازي والسلع الأساسية - دمشق وحلب ({current_time}):
    - سعر صرف الدولار الأمريكي في دمشق: شراء 14,800 - مبيع 14,950 ليرة سورية.
    - متوسط أسعار السكر والأرز في سوق الهال بالزبلطاني: ارتفاع طفيف بنسبة 2%.
    - سعر لتر المازوت الحر في السوق: يتراوح بين 12,800 و 13,200 ل.س.
    - منظومات الطاقة الشمسية وبطاريات الليثيوم: مستقرة نسبياً ومسعرة بالدولار النقدي.
    """
    return bulletin


def analyze_market_with_gemini(bulletin_text: str) -> dict:
    """
    إرسال النشرة إلى Gemini API لاستخراج سعر الصرف المعتمد ونسبة التضخم بصيغة JSON صارمة
    """
    logger.info("Calling Gemini API to analyze Syrian market bulletin...")

    prompt = f"""
    أنت محلل مالي خبير بالسوق السوري لخدمة منصة سَنَد للمغتربين.
    حلل النشرة السوقية التالية واستخرج:
    1. usd_market_rate: سعر صرف الدولار المعتمد مقابل الليرة السورية كقيمة عددية صحيحة (متوسط البيع والشراء).
    2. inflation_factor: نسبة تعديل مقترحة للتضخم (بين 1.0 و 1.15).
    3. market_condition: وصف حالة السوق بكلمتين (مثال: 'مستقر', 'تقلب متوسط', 'حذر').

    النشرة:
    {bulletin_text}

    يجب أن تكون إجابتك حصراً بصيغة JSON صالحة بالشكل التالي:
    {{
        "usd_market_rate": 14875,
        "inflation_factor": 1.02,
        "market_condition": "مستقر"
    }}
    """

    try:
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1 # دقة عالية بدون خيال
            )
        )
        data = json.loads(response.text)
        logger.info(f"Gemini Analysis complete: {data}")
        return data
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}. Falling back to default baseline (14,850).")
        return {"usd_market_rate": 14850, "inflation_factor": 1.0, "market_condition": "حرج/احتياطي"}


def update_supabase_services_pricing(market_data: dict):
    """
    تحديث حقل price_syp في جدول services في Supabase مع تطبيق هامش التحوط
    """
    base_rate = float(market_data.get("usd_market_rate", 14850))
    # حساب السعر المحمي (Hedged Rate) لضمان عدم خسارة المزود المحلي عند تنفيذ الطلب
    hedged_rate = base_rate * (1 + (HEDGE_MARGIN_PERCENT / 100.0))
    
    logger.info(f"Target Hedged Exchange Rate: {hedged_rate:,.2f} SYP/$ (Base: {base_rate:,.2f} + {HEDGE_MARGIN_PERCENT}%)")

    # جلب جميع الخدمات النشطة
    res = supabase.table("services").select("id, title_ar, price_usd, price_syp").eq("is_active", True).execute()
    services = res.data

    updated_count = 0
    for srv in services:
        srv_id = srv["id"]
        price_usd = float(srv["price_usd"])
        old_price_syp = float(srv.get("price_syp", 0))
        
        # حساب السعر الجديد بالليرة السورية مقرباً لأقرب 100 ليرة لتسهيل التداول
        new_price_syp = round((price_usd * hedged_rate) / 100) * 100

        # تحديث السعر في قاعدة البيانات فقط إذا اختلف بنسبة ملحوظة (> 1%)
        if abs(new_price_syp - old_price_syp) > (old_price_syp * 0.01):
            supabase.table("services").update({
                "price_syp": new_price_syp,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", srv_id).execute()

            # تسجيل التغيير في جدول سجلات الأسعار
            supabase.table("price_history").insert({
                "service_id": srv_id,
                "old_price_syp": old_price_syp,
                "new_price_syp": new_price_syp,
                "usd_to_syp_rate": hedged_rate,
                "source": "sanad_python_gemini_agent"
            }).execute()

            logger.info(f"Updated '{srv['title_ar']}': {old_price_syp:,.0f} SYP -> {new_price_syp:,.0f} SYP")
            updated_count += 1

    logger.info(f"Price sync completed. {updated_count}/{len(services)} services repriced successfully.")


def run_cycle():
    """تنفيذ دورة تحديث واحدة متكاملة"""
    try:
        logger.info("=== Starting Sanad Pricing Agent Cycle ===")
        bulletin = fetch_raw_market_bulletin()
        market_data = analyze_market_with_gemini(bulletin)
        update_supabase_services_pricing(market_data)
        logger.info("=== Cycle Finished Successfully ===")
    except Exception as e:
        logger.exception(f"Unexpected error in run_cycle: {e}")


if __name__ == "__main__":
    logger.info("Sanad Autonomous Agent started 24/7 on VPS.")
    
    # التشغيل الدوري كل 12 ساعة (12 * 3600 ثانية = 43200 ثانية)
    INTERVAL_SECONDS = 12 * 3600

    while True:
        run_cycle()
        logger.info(f"Sleeping for 12 hours until next cycle... ({INTERVAL_SECONDS} seconds)")
        time.sleep(INTERVAL_SECONDS)
`;

export const SYSTEMD_SERVICE_FILE = `# ====================================================================
# /etc/systemd/system/sanad-agent.service
# ملف ضبط خدمة Systemd لضمان عمل السكريبت 24/7 وإعادة تشغيله تلقائياً
# ====================================================================

[Unit]
Description=Sanad Autonomous Dynamic Pricing Agent (Python + Gemini + Supabase)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sanad-agent
ExecStart=/opt/sanad-agent/venv/bin/python /opt/sanad-agent/sanad_price_agent.py
Restart=always
RestartSec=15
StandardOutput=append:/var/log/sanad-agent.log
StandardError=append:/var/log/sanad-agent-error.log

[Install]
WantedBy=multi-user.target

# خطوات التفعيل على سيرفر الـ VPS:
# 1. sudo cp sanad-agent.service /etc/systemd/system/
# 2. sudo systemctl daemon-reload
# 3. sudo systemctl enable sanad-agent
# 4. sudo systemctl start sanad-agent
# 5. sudo systemctl status sanad-agent
`;

export const QA_ARCHITECTURAL_SOLUTIONS = [
  {
    id: 'issue-1',
    title: 'المشكلة 1: إخفاقات الـ Webhook وتكرار الطلبات (Idempotency & HMAC Security)',
    cause: 'عند الدفع عبر Lemon Squeezy، قد يحدث تأخير في استجابة n8n أو انقطاع شبكة مؤقت، فتقوم بوابة الدفع بإعادة إرسال الويب هوك (Retry) لعدة مرات، مما قد يؤدي لإنشاء إشعارات مكررة أو تكرار تسليم الطلب مرتين!',
    solution: [
      'التحقق الإلزامي من توقيع HMAC-SHA256 عبر الترويسة x-signature لمنع أي اختراق أو إرسال طلبات وهمية.',
      'تطبيق مبدأ Idempotency عبر قفل فريد: جعل حقل lemon_squeezy_order_id في جدول orders فريداً (UNIQUE)، واستخدام استعلام Upsert.',
      'الرد الفوري بكود 200 OK إلى Lemon Squeezy خلال أقل من 3 ثوانٍ، ونقل بقية المهام (الإشعار) لمسار فرعي (Background Worker).'
    ],
    codeExample: `// منع تكرار الطلب في n8n أو Next.js
const { data: existing } = await supabase
  .from('orders')
  .select('id, payment_status')
  .eq('lemon_squeezy_order_id', lsOrderId)
  .single();

if (existing && existing.payment_status === 'paid') {
  return res.status(200).json({ status: 'already_processed' }); // تجاهل التكرار بسلام
}`
  },
  {
    id: 'issue-2',
    title: 'المشكلة 2: واقع الاتصالات في سوريا (انقطاع الكهرباء وضعف التغطية للمزودين)',
    cause: 'مزود الخدمة المحلي في دمشق أو حلب قد لا يمتلك إنترنت مستمر 24 ساعة بسبب تقنين الكهرباء وتذبذب شبكة 4G، مما يجعله يفوت إشعارات الداشبورد المعتمدة على الويب المباشر.',
    solution: [
      'اعتماد Telegram Bot كقناة رئيسية أولى، لأن تليغرام يمتلك ميزة حفظ الرسائل في قائمة الانتظار (Message Queueing) ويصل الإشعار فور عودة التغطية تلقائياً حتى مع سرعات إنترنت متدنية 2G/3G.',
      'إضافة قناة بديلة عبر WhatsApp Business Cloud API أو رسالة SMS محلية في حال لم يقم المزود بالنقر على زر "تأكيد الاستلام" خلال ساعتين.',
      'توفير وضع غير متصل (Offline Mode PWA) في داشبورد المزود لحفظ أسماء وعناوين المستلمين محلياً على هاتفه.'
    ],
    codeExample: `// آلية الـ Timeout Escalation إذا تأخر المزود
if (order.status === 'paid' && now - order.paid_at > 2 * 3600 * 1000) {
  await sendLocalSmsEmergency(provider.phone, "تنبيه سَنَد: لديك طلب عاجل مدفوع برقم " + order.number);
}`
  },
  {
    id: 'issue-3',
    title: 'المشكلة 3: تقلب سعر صرف الليرة السورية بين لحظة الدفع ولحظة الشراء (Currency Volatility)',
    cause: 'المغترب يدفع 50 دولار اليوم، والمزود يشتري السلة بعد 24 ساعة بالليرة السورية. إذا تغير سعر الصرف في السوق الموازي بمقدار 500 ليرة فجأة، قد يتضرر المزود أو تنقص محتويات السلة.',
    solution: [
      'تثبيت سعر الصرف فورياً في حقل exchange_rate_locked في جدول orders عند لحظة الدفع الناجحة.',
      'تطبيق "هامش تحوط أمان" (Hedging Buffer) بنسبة 4% إلى 6% في سكريبت البايثون عند احتساب أسعار السلال بالليرة السورية.',
      'تسليم المزود مخصصاته المحلية فورياً وفق السعر المثبت عند الدفع، مع صندوق موازنة أرباح صغير يغطي أي فارق مفاجئ.'
    ],
    codeExample: `// معادلة التسعير المحمي في Python
def calculate_safe_syp_price(usd_price, market_rate, buffer_pct=0.05):
    hedged_rate = market_rate * (1 + buffer_pct)
    return round((usd_price * hedged_rate) / 100) * 100`
  }
];

export const SPRINT_TIMELINE = [
  { day: 'اليوم 1', title: 'البنية التحتية والبيانات', tasks: 'إنشاء مشروع Supabase، تنفيذ كود SQL، تفعيل RLS، وبناء هيكل Next.js 14.' },
  { day: 'اليوم 2', title: 'واجهات المغترب والمزود', tasks: 'تصميم واجهة المغترب لاختيار السلال وتعبئة المستلم، وبناء لوحة تحكم المزود المحلي.' },
  { day: 'اليوم 3', title: 'بوابة الدفع وأتمتة n8n', tasks: 'ربط حساب Lemon Squeezy، استيراد مسار n8n، وضبط تحقق HMAC وتحديث Supabase.' },
  { day: 'اليوم 4', title: 'بوت التليغرام وإشعارات سوريا', tasks: 'إنشاء بوت تليغرام عبر BotFather، ربطه مع n8n، واختبار وصول الإشعار لمزود دمشق.' },
  { day: 'اليوم 5', title: 'سكريبت الوكيل الذكي (VPS)', tasks: 'رفع سكريبت البايثون على VPS، ضبط Gemini API، وتشغيل الخدمة عبر Systemd.' },
  { day: 'اليوم 6', title: 'اختبارات النهاية إلى النهاية (E2E QA)', tasks: 'تجربة دورة دفع حقيقية في وضع Test Mode، واختبار انقطاع الإنترنت وسيناريوهات الفشل.' },
  { day: 'اليوم 7', title: 'العرض العائلي والإطلاق التجريبي', tasks: 'تجهيز سلة حقيقية لأحد الأقارب في دمشق/حلب، وتنفيذ أول عملية تسليم موثقة بالصور!' }
];
