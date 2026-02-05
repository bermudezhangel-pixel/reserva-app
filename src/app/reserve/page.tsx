"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';

// Diccionario local para esta página
const textContent = {
  es: {
    welcome: "Bienvenido",
    subWelcome: "Reserva tu espacio ideal en segundos.",
    login: "Iniciar Sesión",
    register: "Crear Cuenta",
    guest: "Continuar como Invitado",
    emailPlaceholder: "Tu Email Corporativo",
    namePlaceholder: "Nombre Completo",
    phonePlaceholder: "Teléfono",
    addressPlaceholder: "Dirección Fiscal",
    next: "Continuar",
    back: "Volver",
    otpTitle: "Verificación",
    otpDesc: "Código enviado a",
    validate: "Validar Acceso",
    hello: "Hola",
    selectSpace: "Elige tu Espacio",
    price: "/hora",
    cap: "personas",
    bookBtn: "Confirmar Reserva",
    logout: "Cerrar Sesión",
    myProfile: "Mi Perfil",
    success: "¡Reserva Confirmada!",
    error: "Error al procesar la reserva",
    dates: "Fechas",
    startDate: "Inicio",
    endDate: "Fin"
  },
  en: {
    welcome: "Welcome",
    subWelcome: "Book your ideal workspace in seconds.",
    login: "Login",
    register: "Create Account",
    guest: "Continue as Guest",
    emailPlaceholder: "Your Corporate Email",
    namePlaceholder: "Full Name",
    phonePlaceholder: "Phone Number",
    addressPlaceholder: "Billing Address",
    next: "Continue",
    back: "Go Back",
    otpTitle: "Verification",
    otpDesc: "Code sent to",
    validate: "Validate Access",
    hello: "Hello",
    selectSpace: "Choose your Space",
    price: "/hour",
    cap: "people",
    bookBtn: "Confirm Booking",
    logout: "Logout",
    myProfile: "My Profile",
    success: "Booking Confirmed!",
    error: "Error processing booking",
    dates: "Dates",
    startDate: "Start",
    endDate: "End"
  }
};

export default function ReservePage() {
  const { theme, lang, logo, changeLang } = useTheme(); 
  const t = textContent[lang as 'es' | 'en']; // Selección de idioma
  const router = useRouter();

  // Estados Lógicos
  const [step, setStep] = useState<'welcome' | 'auth' | 'otp' | 'booking'>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Datos
  const [spaces, setSpaces] = useState<any[]>([]);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '', address: '' });
  const [otp, setOtp] = useState('');
  
  // Selección (Aquí estaba el error antes)
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reservationForm, setReservationForm] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  // Carga Inicial
  useEffect(() => {
    // 1. Cargar espacios
    fetch('/api/spaces').then(r => r.json()).then(d => setSpaces(Array.isArray(d) ? d : []));

    // 2. Verificar sesión existente
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserData(prev => ({ ...prev, email: savedEmail }));
      fetch(`/api/user/profile?email=${savedEmail}`)
        .then(res => res.json())
        .then(u => {
            if(u.name) { 
                setUserData(prev => ({...prev, ...u})); 
                setStep('booking'); 
            }
        });
    }
  }, []);

  // --- HANDLERS ---
  const handleAuthStart = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setStep('auth');
  };

  const handleSendOtp = async () => {
    if(!userData.email) return alert("Email required");
    setLoading(true);
    
    if(authMode === 'register') {
        await fetch('/api/users', { method: 'POST', body: JSON.stringify({...userData, role: 'USER'}) });
    }
    
    const res = await fetch('/api/auth/otp', { method: 'POST', body: JSON.stringify({ email: userData.email }) });
    setLoading(false);
    
    if(res.ok) setStep('otp');
    else alert("Error sending code");
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const res = await fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ email: userData.email, otp }) });
    setLoading(false);

    if (res.ok) {
      localStorage.setItem('userEmail', userData.email);
      if(userData.address && authMode === 'register') {
         await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(userData) });
      }
      setStep('booking');
    } else {
      alert("Invalid Code");
    }
  };

  const handleBooking = async () => {
    if(!selectedSpace?.id) return; // PROTECCIÓN CONTRA EL ERROR NULL
    
    const res = await fetch('/api/reservations', {
       method: 'POST',
       body: JSON.stringify({ 
           spaceId: selectedSpace.id, 
           userEmail: userData.email, 
           ...reservationForm 
       })
    });

    if(res.ok) {
        alert(t.success);
        router.push('/profile');
    } else {
        alert(t.error);
    }
  };

  // Botón Atrás Personalizado
  const handleBack = () => {
    if (step === 'booking') {
        if (confirm("¿Cerrar sesión?")) {
            localStorage.clear();
            setStep('welcome');
        }
    } else if (step === 'otp') setStep('auth');
    else if (step === 'auth') setStep('welcome');
  };

  // Estilos
  const glassClass = "backdrop-blur-2xl border border-white/20 shadow-2xl transition-all duration-500 bg-white/80 dark:bg-black/40 text-[var(--text-main)]";
  const primaryBtn = "bg-[var(--color-primary)] text-white shadow-lg hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all";

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col lg:flex-row font-sans overflow-hidden">
        
        {/* BOTÓN ATRÁS MANUAL (Controla el flujo interno) */}
        {step !== 'welcome' && (
            <button onClick={handleBack} className="fixed top-6 left-6 z-50 bg-white/20 backdrop-blur-md p-3 rounded-full border border-current/10 hover:bg-white hover:text-black transition-all">
                ⬅
            </button>
        )}

        {/* --- COLUMNA IZQUIERDA: VISUAL --- */}
        <div className="lg:w-5/12 relative bg-[var(--color-primary)] p-12 flex flex-col justify-between text-white overflow-hidden">
            {/* Fondo Abstracto */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-0"></div>
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 animate-in slide-in-from-top duration-700">
                {logo ? <img src={logo} className="h-16 w-auto object-contain mb-8 bg-white/90 p-2 rounded-xl" /> : <div className="text-4xl mb-6">💎</div>}
                <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">
                    Premium <br/> Spaces
                </h1>
            </div>

            <div className="relative z-10 hidden lg:block animate-in fade-in delay-300">
                <p className="text-lg font-bold opacity-80 max-w-sm leading-relaxed">
                    {lang === 'es' ? 'La experiencia de coworking definitiva. Gestiona, reserva y conecta.' : 'The ultimate coworking experience. Manage, book, and connect.'}
                </p>
                <div className="flex gap-2 mt-6">
                    <button onClick={() => changeLang('es')} className={`px-3 py-1 rounded-lg text-xs font-black ${lang === 'es' ? 'bg-white text-black' : 'bg-black/20'}`}>ES</button>
                    <button onClick={() => changeLang('en')} className={`px-3 py-1 rounded-lg text-xs font-black ${lang === 'en' ? 'bg-white text-black' : 'bg-black/20'}`}>EN</button>
                </div>
            </div>
        </div>

        {/* --- COLUMNA DERECHA: INTERACCIÓN --- */}
        <div className="lg:w-7/12 relative flex items-center justify-center p-6 lg:p-12 bg-[var(--bg-primary)]">
            <div className={`w-full max-w-xl p-8 lg:p-12 rounded-[2.5rem] ${glassClass}`}>
                
                {/* 1. WELCOME */}
                {step === 'welcome' && (
                    <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tight mb-2">{t.welcome}</h2>
                            <p className="opacity-60 font-medium">{t.subWelcome}</p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={() => handleAuthStart('login')} className={`w-full py-5 rounded-2xl font-black uppercase text-sm ${primaryBtn}`}>{t.login}</button>
                            <button onClick={() => handleAuthStart('register')} className="w-full py-5 rounded-2xl font-black uppercase text-sm bg-current/5 hover:bg-current/10 transition-all">{t.register}</button>
                        </div>
                    </div>
                )}

                {/* 2. AUTH (Login/Register) */}
                {step === 'auth' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black uppercase">{authMode === 'login' ? t.login : t.register}</h2>
                        </div>
                        
                        {authMode === 'register' && (
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder={t.namePlaceholder} className="w-full p-4 rounded-2xl bg-current/5 font-bold outline-none focus:ring-2 ring-[var(--color-primary)]" onChange={e => setUserData({...userData, name: e.target.value})} />
                                <input placeholder={t.phonePlaceholder} className="w-full p-4 rounded-2xl bg-current/5 font-bold outline-none focus:ring-2 ring-[var(--color-primary)]" onChange={e => setUserData({...userData, phone: e.target.value})} />
                            </div>
                        )}
                        
                        <input type="email" placeholder={t.emailPlaceholder} className="w-full p-4 rounded-2xl bg-current/5 font-bold outline-none focus:ring-2 ring-[var(--color-primary)]" onChange={e => setUserData({...userData, email: e.target.value})} />
                        
                        {authMode === 'register' && (
                            <input placeholder={t.addressPlaceholder} className="w-full p-4 rounded-2xl bg-current/5 font-bold outline-none focus:ring-2 ring-[var(--color-primary)]" onChange={e => setUserData({...userData, address: e.target.value})} />
                        )}

                        <button onClick={handleSendOtp} disabled={loading} className={`w-full py-4 rounded-2xl font-black uppercase text-sm mt-4 ${primaryBtn}`}>
                            {loading ? '...' : t.next} ➜
                        </button>
                    </div>
                )}

                {/* 3. OTP */}
                {step === 'otp' && (
                    <div className="text-center space-y-8 animate-in zoom-in duration-300">
                        <div>
                            <h2 className="text-3xl font-black uppercase">{t.otpTitle}</h2>
                            <p className="opacity-60 text-sm mt-2">{t.otpDesc} <strong>{userData.email}</strong></p>
                        </div>
                        <input autoFocus maxLength={6} className="w-full text-center text-5xl tracking-[0.5em] font-black p-4 rounded-2xl bg-current/5 outline-none focus:ring-2 ring-[var(--color-primary)]" onChange={e => setOtp(e.target.value)} />
                        <button onClick={handleVerifyOtp} disabled={loading} className={`w-full py-4 rounded-2xl font-black uppercase text-sm ${primaryBtn}`}>
                            {loading ? '...' : t.validate}
                        </button>
                    </div>
                )}

                {/* 4. BOOKING (Donde estaba el error) */}
                {step === 'booking' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Header Usuario */}
                        <div className="flex justify-between items-center pb-4 border-b border-current/10">
                            <div>
                                <h2 className="text-2xl font-black italic">{t.hello}, {userData.name?.split(' ')[0]} 👋</h2>
                                <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{t.selectSpace}</p>
                            </div>
                            <button onClick={() => router.push('/profile')} className="bg-current/5 hover:bg-[var(--color-primary)] hover:text-white px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all">
                                👤 {t.myProfile}
                            </button>
                        </div>

                        {/* Selector Visual de Espacios (Grid) */}
                        {!selectedSpace ? (
                            <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {spaces.map(s => (
                                    <div 
                                        key={s.id} 
                                        onClick={() => { setSelectedSpace(s); setCurrentImageIndex(0); }}
                                        className="group cursor-pointer rounded-2xl overflow-hidden border border-current/10 hover:border-[var(--color-primary)] transition-all bg-white/50 dark:bg-black/20"
                                    >
                                        <div className="h-28 bg-current/10 relative">
                                            {s.images?.[0] ? (
                                                <img src={s.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-30 text-2xl">🏢</div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-sm leading-tight">{s.name}</h3>
                                            <p className="text-[10px] opacity-60 mt-1">${s.pricePerHour}{t.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Vista Detalle del Espacio (Seleccionado)
                            <div className="space-y-4 animate-in zoom-in-95">
                                {/* Carrusel */}
                                <div className="relative h-56 rounded-3xl overflow-hidden bg-black/10 group shadow-lg">
                                    {selectedSpace.images?.length > 0 ? (
                                        <>
                                            <img src={selectedSpace.images[currentImageIndex]} className="w-full h-full object-cover" />
                                            {selectedSpace.images.length > 1 && (
                                                <>
                                                    <button onClick={() => setCurrentImageIndex(i => (i - 1 + selectedSpace.images.length) % selectedSpace.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-black p-2 rounded-full text-xs hover:scale-110 transition-transform">◀</button>
                                                    <button onClick={() => setCurrentImageIndex(i => (i + 1) % selectedSpace.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-black p-2 rounded-full text-xs hover:scale-110 transition-transform">▶</button>
                                                </>
                                            )}
                                        </>
                                    ) : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📷</div>}
                                    
                                    <button onClick={() => setSelectedSpace(null)} className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-md hover:bg-black/70">
                                        ⬅ {t.back}
                                    </button>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-end">
                                        <h2 className="text-3xl font-black uppercase leading-none">{selectedSpace.name}</h2>
                                        <p className="text-xl font-bold text-[var(--color-primary)]">${selectedSpace.pricePerHour}</p>
                                    </div>
                                    <p className="text-xs opacity-60 mt-2 line-clamp-2">{selectedSpace.description || "Sin descripción disponible."}</p>
                                    
                                    {/* Equipamiento Tags */}
                                    {selectedSpace.equipment && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedSpace.equipment.split(',').map((eq: string, i: number) => (
                                                <span key={i} className="text-[9px] font-black bg-current/5 px-2 py-1 rounded border border-current/10 uppercase">{eq.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Formulario Fechas */}
                                <div className="bg-current/5 p-4 rounded-2xl grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase opacity-50 ml-2">{t.startDate}</label>
                                        <input type="date" className="w-full p-2 bg-transparent font-bold outline-none border-b-2 border-current/10 focus:border-[var(--color-primary)]" onChange={e => setReservationForm({...reservationForm, startDate: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase opacity-50 ml-2">{t.endDate}</label>
                                        <input type="date" className="w-full p-2 bg-transparent font-bold outline-none border-b-2 border-current/10 focus:border-[var(--color-primary)]" onChange={e => setReservationForm({...reservationForm, endDate: e.target.value})} />
                                    </div>
                                </div>

                                <button onClick={handleBooking} className={`w-full py-4 rounded-2xl font-black uppercase text-sm shadow-xl ${primaryBtn}`}>
                                    {t.bookBtn}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </PageTransition>
  );
}