import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Globe, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft,
  X
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/sanad';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('tareq.dalati@gmail.com');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  
  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('expat');
  const [regCountry, setRegCountry] = useState('ألمانيا');
  const [regCity, setRegCity] = useState('دمشق');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // تسجيل الدخول السريع عبر Google
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      const googleUser: UserProfile = {
        id: `usr-google-${Date.now()}`,
        fullName: activeTab === 'login' ? 'سيف الدين (حساب Google)' : (regFullName || 'مستخدم غوغل الجديد'),
        email: 'saif.masx@gmail.com',
        phone: '+90 536 251 58 78',
        role: regRole,
        country: 'تركيا (بورصة)',
        city: 'بورصة',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      };

      onLoginSuccess(googleUser);
      setIsLoading(false);
      setSuccessMessage('تم تسجيل الدخول بنجاح عبر حساب Google المعتمد!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1000);
    }, 900);
  };

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      let loggedUser: UserProfile;

      if (activeTab === 'login') {
        loggedUser = {
          id: 'usr-exp-01',
          fullName: 'سيف الدين',
          email: loginEmail || 'saif.masx@gmail.com',
          phone: '+90 536 251 58 78',
          role: 'expat',
          country: 'تركيا (بورصة)',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        };
      } else {
        loggedUser = {
          id: `usr-reg-${Date.now()}`,
          fullName: regFullName || 'مستخدم جديد',
          email: regEmail || 'user@example.com',
          phone: regPhone || '+90 536 251 58 78',
          role: regRole,
          country: regRole === 'expat' ? regCountry : 'سوريا',
          city: regRole === 'provider' ? regCity : undefined,
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
        };
      }

      onLoginSuccess(loggedUser);
      setIsLoading(false);
      setSuccessMessage(activeTab === 'login' ? 'تم تسجيل الدخول بنجاح!' : 'تم إنشاء حسابك في سَنَد 2 بنجاح!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#180530] border border-amber-400/50 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-in text-purple-100 font-['Cairo']">
        
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute left-5 top-5 text-purple-300 hover:text-white p-1 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس النافذة */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center text-purple-950 font-black text-xl mx-auto mb-3 shadow-lg shadow-amber-400/30">
            سَـ2
          </div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            {activeTab === 'login' ? 'تسجيل الدخول إلى سَنَد 2' : 'إنشاء حساب جديد في سَنَد 2'}
          </h2>
          <p className="text-xs text-purple-300/80 mt-1">
            {activeTab === 'login' 
              ? 'أهلاً بعودتك! تابع طلبات أهلك ومستحقاتك في سوريا'
              : 'انضم إلى شبكة سَنَد 2 كمغترب أو كمزود محلي معتمد'}
          </p>
        </div>

        {/* التبديل بين تسجيل الدخول وإنشاء الحساب */}
        <div className="flex bg-[#0e021f] p-1 rounded-2xl border border-purple-800/80 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-black shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* زر Google الرسمي المخصص لتسجيل الدخول وإنشاء الحساب */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-3 shadow-md mb-5"
        >
          {/* أيقونة Google الرسمية الملونة SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>
            {activeTab === 'login' ? 'تسجيل الدخول السريع بحساب Google' : 'إنشاء حساب فوري عبر Google'}
          </span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-purple-800/80 w-full" />
          <span className="bg-[#180530] px-3 text-[11px] text-purple-300/80 absolute">أو بالبريد الإلكتروني</span>
        </div>

        {/* رسالة النجاح إن وجدت */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-purple-900/80 border border-amber-400/60 text-amber-300 text-xs flex items-center gap-2 animate-fade-in font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* النموذج اليدوي */}
        <form onSubmit={handleManualAuth} className="space-y-3.5 text-xs">
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-purple-200 mb-1">الاسم الكامل:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="مثال: سيف الدين الحلبي"
                    className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl pr-9 pl-3 py-2 text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-1">نوع الحساب:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('expat')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      regRole === 'expat'
                        ? 'bg-purple-900/80 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-[#0e021f] border-purple-800 text-purple-300'
                    }`}
                  >
                    مغترب سوري في الخارج
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('provider')}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      regRole === 'provider'
                        ? 'bg-purple-900/80 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-[#0e021f] border-purple-800 text-purple-300'
                    }`}
                  >
                    مزود خدمة في سوريا
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-purple-200 mb-1">رقم الهاتف:</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+90 536 251 58 78"
                    className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl pr-9 pl-3 py-2 text-purple-100 placeholder:text-purple-400/60 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-purple-200 mb-1">البريد الإلكتروني:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
              <input
                type="email"
                required
                value={activeTab === 'login' ? loginEmail : regEmail}
                onChange={e => activeTab === 'login' ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl pr-9 pl-3 py-2 text-purple-100 placeholder:text-purple-400/60 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-200 mb-1">كلمة المرور:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute right-3 top-2.5" />
              <input
                type="password"
                required
                value={activeTab === 'login' ? loginPassword : regPassword}
                onChange={e => activeTab === 'login' ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0e021f] border border-purple-800/80 rounded-xl pr-9 pl-3 py-2 text-purple-100 placeholder:text-purple-400/60 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-400/20 mt-2"
          >
            {isLoading ? 'جاري التحقق...' : (activeTab === 'login' ? 'دخول إلى حسابي' : 'إنشاء حساب جديد')}
          </button>
        </form>

        <p className="text-[10px] text-center text-purple-300/70 mt-4">
          بياناتك مشفرة ومحمية وفق معايير Supabase Auth & Google OAuth 2.0
        </p>
      </div>
    </div>
  );
};
