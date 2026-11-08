import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Phone, 
  ExternalLink,
  ChevronDown,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionLink?: {
    label: string;
    url: string;
  };
}

export const CustomerChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'أهلاً بك في منصة سَنَد 2! أنا مساعدك الذكي لخدمة المغتربين السوريين. كيف أستطيع مساعدتك اليوم في تلبية احتياجات أهلك في سوريا؟',
      timestamp: 'الآن',
      suggestions: [
        'كيف أطلب سلة غذائية لأهلي بدمشق؟',
        'ما هي طرق الدفع المتاحة بالدولار؟',
        'كيف تضمنون وصول الطلب وتوثيقه؟',
        'أين يقع مقركم وكيف أتصل بكم؟'
      ]
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // محرك الردود الذكي المخصص لخدمات سَنَد 2 والواقع السوري
  const generateBotReply = (userQuery: string): { reply: string; actionLink?: { label: string; url: string } } => {
    const q = userQuery.toLowerCase();

    if (q.includes('تتبع') || q.includes('خريطة') || q.includes('وين الطلب') || q.includes('أين الطلب') || q.includes('موقع المندوب')) {
      return {
        reply: 'يمكنك الآن تتبع موقع مندوب التوصيل المباشر في شوارع دمشق والمحافظات السورية لحظة بلحظة عبر خريطة Google Maps التفاعلية من تبويب "تتبع الطلبات (Live)" في القائمة العلوية، مع معرفة وقت الوصول التقديري والاتصال المباشر بالمندوب.'
      };
    }

    if (q.includes('سلة') || q.includes('غذائ') || q.includes('طعام') || q.includes('رز') || q.includes('أكل')) {
      return {
        reply: 'سلة الخير الملكية (35 كغ) مجهزة بأعلى مواصفات الجودة (رز بسمتي، سكر، سمنة بلدية، زيت، طحين، معلبات، شاي). سعرها 48$ فقط شاملة التوصيل حتى باب المنزل في دمشق، ريف دمشق، حلب، حمص، الساحل وحماة خلال 24 ساعة مع فيديو توثيقي.'
      };
    }

    if (q.includes('دفع') || q.includes('دولار') || q.includes('فيزا') || q.includes('ماستركارد') || q.includes('lemon')) {
      return {
        reply: 'الدفع يتم بالدولار الأمريكي عبر بوابة Lemon Squeezy العالمية المعتمدة والآمنة، والتي تقبل كافة البطاقات المصرفية (Visa, MasterCard, Apple Pay) من أوروبا والخليج وأمريكا بكل سلاسة.'
      };
    }

    if (q.includes('كهربا') || q.includes('طاقة') || q.includes('بطارية') || q.includes('شمسية') || q.includes('انفرتر')) {
      return {
        reply: 'نوفر منظومة طاقة وإنارة ليثيوم منزلية متكاملة (بطارية LiFePO4 سعة 150Ah + إنفرتر هجين ذكي 1.5KVA) بسعر 240$ مع التركيب والتشغيل الفوري لحل مشكلة التقنين والكهرباء نهائياً.'
      };
    }

    if (q.includes('دواء') || q.includes('أدوية') || q.includes('صحة') || q.includes('ضغط') || q.includes('سكري') || q.includes('صيدلية')) {
      return {
        reply: 'باقة الرعاية الصحية والأدوية الشهرية (38$) تشمل شراء أدوية الأمراض المزمنة من صيدليات مرخصة وتوصيلها فورياً، مع زيارة ممرض منزلي لفحص الضغط والسكري وتخطيط القلب الأولي للأهل.'
      };
    }

    if (q.includes('مازوت') || q.includes('تدفئة') || q.includes('وقود') || q.includes('صهريج')) {
      return {
        reply: 'نوفر وقود مازوت تدفئة شتوي مرخص (100 لتر) بسعر 85$ عبر صهاريج مجهزة بعدادات إلكترونية وفيديو توثيقي للتعبئة داخل خزان العائلة لضمان نقاء الوقود وعدم التلاعب.'
      };
    }

    if (q.includes('توثيق') || q.includes('ضمان') || q.includes('تأكيد') || q.includes('استلام') || q.includes('صور')) {
      return {
        reply: 'نضمن لك الأمان 100%! لا يعتبر الطلب مكتملاً في سَنَد 2 إلا بعد قيام مندوب التوصيل بتسليم السلة باليد للمستلم والتقاط صورة/فيديو لإيصال الاستلام الموقع ورفعه في النظام لتراه في لوحة تحكمك فوراً.'
      };
    }

    if (q.includes('تواصل') || q.includes('عنوان') || q.includes('هاتف') || q.includes('رقم') || q.includes('بورصة') || q.includes('تركيا') || q.includes('ايميل')) {
      return {
        reply: 'مقرنا الرئيسي في تركيا - بورصة. يمكنك التواصل معنا مباشرة هاتفياً أو عبر واتساب على الرقم +905362515878 أو عبر البريد saif.masx@gmail.com.',
        actionLink: {
          label: 'محادثة فورية على واتساب (+905362515878)',
          url: 'https://wa.me/905362515878'
        }
      };
    }

    return {
      reply: 'شكراً لسؤالك! فريق سَنَد 2 جاهز لخدمتك على مدار الساعة لتأمين أي طلب خاص لعائلتك في سوريا. هل تود أن أحولك لمحادثة مباشرة مع مسؤول خدمة العملاء على واتساب؟',
      actionLink: {
        label: 'تواصل مع الدعم الفني على واتساب',
        url: 'https://wa.me/905362515878'
      }
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const { reply, actionLink } = generateBotReply(query);
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
        actionLink
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* زر فتح الشات العائم ببريق ذهبي وأرجواني ملكي */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-amber-500/30 flex items-center gap-2.5 transition transform hover:scale-105 cursor-pointer font-black font-['Cairo']"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="w-2.5 h-2.5 rounded-full bg-purple-950 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>
          <span className="hidden sm:inline text-xs font-black">مساعد سَنَد 2 الذكي</span>
        </button>
      )}

      {/* نافذة المحادثة التفاعلية */}
      {isOpen && (
        <div className="fixed bottom-6 left-4 sm:left-6 z-50 w-[94vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-[#180530] border border-amber-400/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in text-purple-100 font-['Cairo'] backdrop-blur-xl" dir="rtl">
          
          {/* شريط رأس الشات */}
          <div className="bg-gradient-to-r from-[#280754] via-[#3b0b78] to-[#180238] p-4 border-b border-purple-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">مساعد سَنَد 2 للعملاء</h3>
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                </div>
                <p className="text-[10px] text-amber-300">متصل 24/7 للرد الفوري على المغتربين</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="https://wa.me/905362515878"
                target="_blank"
                rel="noreferrer"
                title="محادثة واتساب مباشرة"
                className="p-1.5 text-amber-300 hover:text-white rounded-lg hover:bg-purple-900/40 transition"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-purple-900/40 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* محتوى الرسائل */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0e021f]/90 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-purple-900/60 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 rounded-2xl rounded-tl-sm p-3 font-bold shadow-md'
                    : 'bg-[#1e073d] border border-purple-800/80 text-purple-100 rounded-2xl rounded-tr-sm p-3.5 shadow-md leading-relaxed'
                }`}>
                  <p>{msg.text}</p>
                  
                  {msg.actionLink && (
                    <a
                      href={msg.actionLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-black px-3 py-1.5 rounded-xl text-[11px] mt-1 transition shadow-sm"
                    >
                      <span>{msg.actionLink.label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {msg.suggestions && (
                    <div className="pt-2 flex flex-col gap-1.5">
                      <span className="text-[10px] text-purple-300/80">أسئلة شائعة يمكنك النقر عليها:</span>
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-right text-[11px] bg-[#0e021f] hover:bg-purple-950 border border-purple-800/80 hover:border-amber-400/60 text-purple-200 hover:text-amber-300 p-2 rounded-xl transition cursor-pointer"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`block text-[9px] ${msg.sender === 'user' ? 'text-purple-950/70' : 'text-purple-400'} text-left`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-purple-300">
                <div className="w-7 h-7 rounded-xl bg-purple-900/60 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#1e073d] border border-purple-800 p-2.5 rounded-2xl flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* صندوق كتابة الرسالة */}
          <div className="p-3 bg-[#180530] border-t border-purple-800/80">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="اكتب استفسارك هنا..."
                className="flex-1 bg-[#0e021f] border border-purple-800/80 rounded-xl px-3.5 py-2.5 text-xs text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 flex items-center justify-center transition cursor-pointer disabled:opacity-40 shadow-sm"
              >
                <Send className="w-4 h-4 -rotate-90" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
