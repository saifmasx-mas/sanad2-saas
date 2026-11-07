import { ServicePackage, Order, ExchangeRateInfo, UserProfile, AgentLog } from '../types/sanad';

export const CURRENT_EXCHANGE_RATE: ExchangeRateInfo = {
  usdToSypOfficial: 13500,
  usdToSypMarket: 14850,
  hedgedRate: 15300, // +3% safety hedge for exchange market fluctuations
  volatilityIndex: 'moderate',
  lastRefreshed: 'منذ 15 دقيقة (تلقائياً عبر سكريبت بايثون)'
};

export const INITIAL_SERVICES: ServicePackage[] = [
  {
    id: 'srv-food-01',
    titleAr: 'سلة الخير الغذائية الملكية (شهرية)',
    titleEn: 'Royal Monthly Family Food Basket',
    descriptionAr: 'تحتوي على: 10كغ رز بسمتي درجة أولى، 10كغ سكر، 5كغ سمنة بلدية، 4 لتر زيت دوار الشمس، 5كغ طحين، معلبات تونة وبقوليات، شاي سيلاني فاخر.',
    category: 'food',
    priceUSD: 48,
    priceSYP: 48 * CURRENT_EXCHANGE_RATE.hedgedRate,
    unit: 'طرد كامل (35 كغ)',
    iconName: 'ShoppingBag',
    badge: 'الأكثر طلباً للمغتربين',
    estimatedDeliveryHours: 24,
    availableCities: ['دمشق', 'ريف دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس', 'حماة'],
    stockStatus: 'available',
    lastUpdated: 'اليوم، 09:30 ص'
  },
  {
    id: 'srv-energy-02',
    titleAr: 'منظومة طاقة وإنارة ليثيوم منزلية',
    titleEn: 'Home Lithium Battery & Inverter Pack',
    descriptionAr: 'بطارية ليثيوم LiFePO4 سعة 150Ah مع إنفرتر هجين ذكي 1.5KVA لتشغيل الإنارة والمراوح والشاشات وشواحن الأجهزة طوال ساعات التقنين.',
    category: 'energy',
    priceUSD: 240,
    priceSYP: 240 * CURRENT_EXCHANGE_RATE.hedgedRate,
    unit: 'جهاز متكامل مع التركيب',
    iconName: 'Zap',
    badge: 'حل جذري للكهرباء',
    estimatedDeliveryHours: 48,
    availableCities: ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'حماة'],
    stockStatus: 'available',
    lastUpdated: 'أمس، 18:00 م'
  },
  {
    id: 'srv-fuel-03',
    titleAr: 'حصة وقود تدفئة شتوي (مازوت مرخص 100 لتر)',
    titleEn: 'Heating Diesel 100L Delivery',
    descriptionAr: 'تعبئة مباشرة لخزانات المازوت عبر صهاريج مرخصة معتمدة مع عداد إلكتروني مضمون وموثق بفيديو التعبئة لراحة بالك.',
    category: 'fuel',
    priceUSD: 85,
    priceSYP: 85 * CURRENT_EXCHANGE_RATE.hedgedRate,
    unit: '100 لتر مازوت نقي',
    iconName: 'Flame',
    badge: 'توصيل بالصهريج',
    estimatedDeliveryHours: 36,
    availableCities: ['دمشق', 'ريف دمشق', 'حمص', 'حلب'],
    stockStatus: 'available',
    lastUpdated: 'اليوم، 10:15 ص'
  },
  {
    id: 'srv-health-04',
    titleAr: 'باقة الرعاية الصحية والأدوية الشهرية',
    titleEn: 'Elderly & Chronic Medication Care Package',
    descriptionAr: 'شراء وتوصيل أدوية الضغط والسكري وأمراض القلب المزمنة بالكامل من صيدلية مرخصة مع زيارة ممرض منزلي لقياس الضغط والسكر وتخطيط قلب أولي.',
    category: 'health',
    priceUSD: 38,
    priceSYP: 38 * CURRENT_EXCHANGE_RATE.hedgedRate,
    unit: 'باقة علاجية شهرية',
    iconName: 'HeartPulse',
    badge: 'رعاية صحية خاصة',
    estimatedDeliveryHours: 12,
    availableCities: ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس'],
    stockStatus: 'available',
    lastUpdated: 'اليوم، 11:00 ص'
  },
  {
    id: 'srv-home-05',
    titleAr: 'صهريج مياه نقية للشرب والاستخدام (10 براميل)',
    titleEn: 'Clean Water Tank Delivery (10 Barrels)',
    descriptionAr: 'تعبئة خزانات المياه العلوية والأرضية بمياه نقية ومفلترة من مصادر معتمدة لضمان عدم انقطاع المياه في أوقات الجفاف وتوقف الضخ.',
    category: 'home',
    priceUSD: 18,
    priceSYP: 18 * CURRENT_EXCHANGE_RATE.hedgedRate,
    unit: '10 براميل (2000 لتر)',
    iconName: 'Droplets',
    estimatedDeliveryHours: 8,
    availableCities: ['دمشق', 'ريف دمشق', 'حلب', 'اللاذقية'],
    stockStatus: 'available',
    lastUpdated: 'أمس، 21:00 م'
  },
  {
    id: 'srv-cash-06',
    titleAr: 'تسديد فواتير الكهرباء والمياه والإنترنت الأرضي',
    titleEn: 'Government & Telecom Utility Bills Payment',
    descriptionAr: 'تسديد فواتير الكهرباء، الهاتف الثابت، خط إنترنت ADSL، والمياه مع تسليم إيصالات الدفع الرسمية للمنزل باليد مع صورة طبق الأصل.',
    category: 'cash',
    priceUSD: 25,
    priceSYP: 25 * CURRENT_EXCHANGE_RATE.hedgedRate,
    unit: 'خدمة تسديد مع إيصال رسمي',
    iconName: 'Receipt',
    estimatedDeliveryHours: 24,
    availableCities: ['جميع المحافظات'],
    stockStatus: 'available',
    lastUpdated: 'اليوم، 08:00 ص'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8491',
    orderNumber: 'SND-2026-8491',
    expatId: 'usr-exp-01',
    expatName: 'سيف الدين',
    expatPhone: '+90 536 251 58 78',
    expatCountry: 'تركيا (بورصة)',
    recipientName: 'عائلة أم محمد الجزائري',
    recipientPhone: '+963 944 123 456',
    recipientCity: 'دمشق',
    recipientAddress: 'شارع بغداد - نزلة السبكي - بناء الأمل طابق 3',
    recipientNotes: 'يرجى الاتصال بالرقم قبل الوصول بنصف ساعة، الوالدة كبيرة بالسن والمصعد معطل أحياناً.',
    items: [
      {
        serviceId: 'srv-food-01',
        serviceTitle: 'سلة الخير الغذائية الملكية (شهرية)',
        quantity: 1,
        unitPriceUSD: 48,
        totalUSD: 48
      },
      {
        serviceId: 'srv-health-04',
        serviceTitle: 'باقة الرعاية الصحية والأدوية الشهرية',
        quantity: 1,
        unitPriceUSD: 38,
        totalUSD: 38
      }
    ],
    totalUSD: 86,
    totalSYP: 86 * 15300,
    exchangeRateUsed: 15300,
    paymentStatus: 'paid',
    paymentReference: 'LS_PAY_889214710',
    orderStatus: 'preparing',
    providerId: 'usr-prv-01',
    providerName: 'مؤسسة ياسمين الشام للخدمات اللوجستية (أبو عمر)',
    createdAt: '2026-11-07 08:14:00',
    paidAt: '2026-11-07 08:15:32',
    telegramNotificationSent: true
  },
  {
    id: 'ord-8492',
    orderNumber: 'SND-2026-8492',
    expatId: 'usr-exp-02',
    expatName: 'ريما الشاغوري',
    expatPhone: '+971 50 123 9876',
    expatCountry: 'الإمارات (دبي)',
    recipientName: 'الحاج محمود الشاغوري',
    recipientPhone: '+963 933 654 321',
    recipientCity: 'دمشق',
    recipientAddress: 'الميدان - حي الجزماتية - حارة الشريف، قرب جامع ماجد',
    recipientNotes: 'التأكد من جودة زيت الزيتون وعلب السمنة',
    items: [
      {
        serviceId: 'srv-fuel-03',
        serviceTitle: 'حصة وقود تدفئة شتوي (مازوت مرخص 100 لتر)',
        quantity: 1,
        unitPriceUSD: 85,
        totalUSD: 85
      }
    ],
    totalUSD: 85,
    totalSYP: 85 * 15300,
    exchangeRateUsed: 15300,
    paymentStatus: 'paid',
    paymentReference: 'LS_PAY_991823412',
    orderStatus: 'out_for_delivery',
    providerId: 'usr-prv-01',
    providerName: 'مؤسسة ياسمين الشام للخدمات اللوجستية (أبو عمر)',
    createdAt: '2026-11-07 06:45:00',
    paidAt: '2026-11-07 06:46:10',
    telegramNotificationSent: true
  },
  {
    id: 'ord-8493',
    orderNumber: 'SND-2026-8493',
    expatId: 'usr-exp-03',
    expatName: 'سامر الحلبي',
    expatPhone: '+46 70 889 0011',
    expatCountry: 'السويد (ستوكهولم)',
    recipientName: 'خالد الحلبي وعائلته',
    recipientPhone: '+963 955 789 012',
    recipientCity: 'حلب',
    recipientAddress: 'الفرقان - شارع البوتاس - دخلة مشفى السلوم',
    recipientNotes: 'تركيب البطارية مع الفني المتخصص فحص التوتر الكهربائي',
    items: [
      {
        serviceId: 'srv-energy-02',
        serviceTitle: 'منظومة طاقة وإنارة ليثيوم منزلية',
        quantity: 1,
        unitPriceUSD: 240,
        totalUSD: 240
      }
    ],
    totalUSD: 240,
    totalSYP: 240 * 15300,
    exchangeRateUsed: 15300,
    paymentStatus: 'paid',
    paymentReference: 'LS_PAY_771928341',
    orderStatus: 'delivered',
    providerId: 'usr-prv-02',
    providerName: 'شركة شهباء الشهباء للطاقة البديلة (حلب)',
    createdAt: '2026-11-06 14:10:00',
    paidAt: '2026-11-06 14:11:05',
    deliveredAt: '2026-11-07 10:30:00',
    proofImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    telegramNotificationSent: true
  }
];

export const INITIAL_LOGS: AgentLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-07 11:15:00',
    source: 'Python VPS Agent',
    action: 'Gemini Analysis',
    details: 'تم تحليل نشرة أسعار أسواق دمشق وحلب عبر Gemini API بنجاح، استقرار سعر صرف السوق الموازي عند 14,850 ل.س/$.',
    status: 'success'
  },
  {
    id: 'log-2',
    timestamp: '2026-11-07 11:15:02',
    source: 'Supabase Sync',
    action: 'Update Services Price',
    details: 'تم تحديث حقل price_syp لـ 6 باقات بناء على هامش التحوط (15,300 ل.س).',
    status: 'success'
  },
  {
    id: 'log-3',
    timestamp: '2026-11-07 08:15:33',
    source: 'n8n Automation',
    action: 'Webhook LemonSqueezy',
    details: 'تم استلام حدث order_created برقم دفع LS_PAY_889214710 والتحقق من التوقيع HMAC بنجاح.',
    status: 'success'
  },
  {
    id: 'log-4',
    timestamp: '2026-11-07 08:15:35',
    source: 'Telegram Bot',
    action: 'Provider Notification',
    details: 'تم إرسال إشعار فوري لمزود دمشق (أبو عمر) عبر تليغرام مع أزرار تفاعلية لبدء التجهيز.',
    status: 'success'
  }
];

export const CURRENT_EXPAT_USER: UserProfile = {
  id: 'usr-exp-01',
  fullName: 'سيف الدين',
  email: 'saif.masx@gmail.com',
  phone: '+90 536 251 58 78',
  role: 'expat',
  country: 'تركيا (بورصة)',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
};

export const CURRENT_PROVIDER_USER: UserProfile = {
  id: 'usr-prv-01',
  fullName: 'أبو عمر (ياسمين الشام اللوجستية)',
  email: 'abu.omar.logistics@sanad-sy.com',
  phone: '+963 944 888 999',
  role: 'provider',
  country: 'سوريا',
  city: 'دمشق',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
};
