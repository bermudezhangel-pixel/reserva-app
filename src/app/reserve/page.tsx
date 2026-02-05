"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReservePage() {
  // --- ESTADOS GLOBALES ---
  const [theme, setTheme] = useState('light');
  const [step, setStep] = useState<'welcome' | 'login' | 'register' | 'otp' | 'booking'>('welcome');
  const router = useRouter();

  // --- DATOS USUARIO ---
  const [userData, setUserData] = useState({ name: '', email: '', phone: '', address: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // --- DATOS RESERVA ---
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<any>(null); // Para el carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Carrusel index
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [reservationForm, setReservationForm] = useState({ startDate: '', endDate: '' });

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    // Cargar tema
    setTheme(localStorage.getItem('app-theme') || 'light');

    // Chequear sesión
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserData(prev => ({ ...prev, email: savedEmail }));
      fetch(`/api/user/profile?email=${savedEmail}`)
        .then(res => res.json())
        .then(u => {
          if (u.name) {
             setUserData(prev => ({...prev, ...u}));
             setStep('booking');
          } else {
             localStorage.clear();
          }
        });
    }

    // Cargar espacios
    fetch('/api/spaces').then(r => r.json()).then(d => setSpaces(Array.isArray(d) ? d : []));
  }, []);

  // --- ESTILOS VISUALES ---
  const getThemeClass = () => {
    if (theme === 'dark') return "bg-slate-900 text-white";
    if (theme === 'colorful') return "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white";
    return "bg-slate-100 text-slate-900";
  };
  
  const getCardClass = () => theme === 'light' ? "bg-white shadow-2xl border-white" : "bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl";

  // --- LOGICA DE AUTH ---
  const handleAuthSubmit = async (type: 'login' | 'register') => {
    if(!userData.email) return alert("Email requerido");
    if(type === 'register' && (!userData.name || !userData.phone)) return alert("Completa todos los datos");

    setLoading(true);
    // 1. Crear usuario si es registro
    if (type === 'register') {
      await fetch('/api/users', { // Usamos la API de users que creamos antes
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, role: 'USER' })
      });
    }

    // 2. Enviar OTP (sirve para login y verify registro)
    await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userData.email })
    });

    setLoading(false);
    setStep('otp');
  };

  const verifyOtp = async () => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userData.email, otp })
    });

    if (res.ok) {
      localStorage.setItem('userEmail', userData.email);
      // Si era registro, actualizamos la dirección extra si faltó
      if (userData.address) {
         await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(userData) });
      }
      setStep('booking');
    } else {
      alert("Código incorrecto");
    }
  };

  // --- LOGICA CARRUSEL ---
  const nextImage = () => {
    if (!selectedSpace?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedSpace.images.length);
  };

  const prevImage = () => {
    if (!selectedSpace?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedSpace.images.length) % selectedSpace.images.length);
  };

  // --- LOGICA RESERVA ---
  const confirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;
    
    const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            spaceId: selectedSpace.id, 
            userEmail: userData.email,
            startDate: reservationForm.startDate,
            endDate: reservationForm.endDate
        })
    });

    if(res.ok) {
        alert("¡Reserva Exitosa!");
        router.push('/profile');
    } else {
        alert("Error al reservar (revisa fechas)");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 ${getThemeClass()}`}>
      
      <div className={`w-full max-w-lg p-8 rounded-[3rem] border-t-8 border-blue-500 transition-all duration-500 ${getCardClass()}`}>
        
        {/* --- PASO 0: BIENVENIDA --- */}
        {step === 'welcome' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-5xl font-black italic tracking-tighter">Bienvenido</h1>
            <p className="opacity-70 font-bold text-sm uppercase tracking-widest">Reserva tu espacio ideal en segundos</p>
            
            <div className="space-y-4 pt-4">
              <button onClick={() => setStep('login')} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                Iniciar Sesión
              </button>
              <button onClick={() => setStep('register')} className="w-full bg-white text-slate-900 border-2 border-slate-100 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                Crear Cuenta Nueva
              </button>
            </div>
            
            {/* Theme Toggle Mini */}
            <div className="flex justify-center gap-4 mt-8 opacity-50">
               <button onClick={()=>{setTheme('light'); localStorage.setItem('app-theme', 'light')}}>☀️</button>
               <button onClick={()=>{setTheme('dark'); localStorage.setItem('app-theme', 'dark')}}>🌑</button>
               <button onClick={()=>{setTheme('colorful'); localStorage.setItem('app-theme', 'colorful')}}>🌈</button>
            </div>
          </div>
        )}

        {/* --- PASO 1: LOGIN --- */}
        {step === 'login' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-black uppercase">Ingresar</h2>
            <input 
               type="email" placeholder="Tu correo electrónico" 
               className="w-full p-4 rounded-2xl bg-black/5 font-bold outline-none focus:ring-4 ring-blue-500/30 transition-all"
               onChange={e => setUserData({...userData, email: e.target.value})}
            />
            <button onClick={() => handleAuthSubmit('login')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-blue-700">
                {loading ? 'Verificando...' : 'Enviar Código'}
            </button>
            <button onClick={() => setStep('welcome')} className="text-xs font-bold opacity-50 hover:opacity-100 uppercase w-full text-center">Volver</button>
          </div>
        )}

        {/* --- PASO 2: REGISTRO --- */}
        {step === 'register' && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-black uppercase">Registro</h2>
            <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Nombre" className="bg-black/5 p-4 rounded-2xl font-bold outline-none" onChange={e => setUserData({...userData, name: e.target.value})} />
                <input type="text" placeholder="Teléfono" className="bg-black/5 p-4 rounded-2xl font-bold outline-none" onChange={e => setUserData({...userData, phone: e.target.value})} />
            </div>
            <input type="email" placeholder="Email" className="w-full bg-black/5 p-4 rounded-2xl font-bold outline-none" onChange={e => setUserData({...userData, email: e.target.value})} />
            <textarea placeholder="Dirección Facturación" rows={2} className="w-full bg-black/5 p-4 rounded-2xl font-bold outline-none" onChange={e => setUserData({...userData, address: e.target.value})} />
            
            <button onClick={() => handleAuthSubmit('register')} className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-green-600 transition-all">
                {loading ? 'Creando...' : 'Registrarme'}
            </button>
            <button onClick={() => setStep('welcome')} className="text-xs font-bold opacity-50 hover:opacity-100 uppercase w-full text-center">Volver</button>
          </div>
        )}

        {/* --- PASO 3: OTP --- */}
        {step === 'otp' && (
          <div className="space-y-6 text-center animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black">Código 📬</h2>
            <p className="text-xs font-bold opacity-60 uppercase">Enviado a {userData.email}</p>
            <input type="text" maxLength={6} className="w-full text-center text-4xl tracking-[0.5em] font-black p-4 rounded-2xl bg-black/5 outline-none focus:ring-4 ring-blue-500/30" onChange={e => setOtp(e.target.value)} />
            <button onClick={verifyOtp} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg">Validar</button>
          </div>
        )}

        {/* --- PASO 4: RESERVAR (Booking) --- */}
        {step === 'booking' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center pb-4 border-b border-black/10">
               <div>
                  <h2 className="text-xl font-black italic">Hola, {userData.name?.split(' ')[0]} 👋</h2>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Vamos a reservar</p>
               </div>
               <button onClick={() => router.push('/profile')} className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                  👤 Mi Perfil
               </button>
            </div>

            {/* SELECCIÓN DE ESPACIO */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50 ml-2">Selecciona un Espacio</label>
                <select 
                    className="w-full p-4 rounded-2xl bg-black/5 font-bold outline-none cursor-pointer"
                    onChange={(e) => {
                        const s = spaces.find(sp => sp.id === e.target.value);
                        setSelectedSpace(s);
                        setCurrentImageIndex(0);
                    }}
                >
                    <option value="">-- Ver Disponibles --</option>
                    {spaces.map(s => <option key={s.id} value={s.id}>{s.name} (${s.pricePerHour}/h)</option>)}
                </select>
            </div>

            {/* CARRUSEL E INFO DEL ESPACIO */}
            {selectedSpace && (
                <div className="bg-black/5 p-4 rounded-[2rem] animate-in zoom-in-95 duration-300">
                    {/* CARRUSEL DE FOTOS */}
                    <div className="relative w-full h-48 bg-slate-200 rounded-2xl overflow-hidden mb-4 shadow-inner group">
                        {selectedSpace.images && selectedSpace.images.length > 0 ? (
                            <>
                                <img 
                                    src={selectedSpace.images[currentImageIndex]} 
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                                    alt="Space" 
                                />
                                {selectedSpace.images.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-xs font-black hover:bg-white">◀</button>
                                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-xs font-black hover:bg-white">▶</button>
                                    </>
                                )}
                            </>
                        ) : selectedSpace.image ? (
                             /* Fallback si es imagen vieja única */
                             <img src={selectedSpace.image} className="w-full h-full object-cover" alt="Space" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-2xl">NO FOTO 📷</div>
                        )}
                    </div>
                    
                    {/* DESCRIPCIÓN */}
                    <h3 className="text-xl font-black mb-1">{selectedSpace.name}</h3>
                    <p className="text-xs opacity-70 mb-3 leading-relaxed">{selectedSpace.description || "Un espacio perfecto para tus eventos."}</p>
                    
                    {selectedSpace.equipment && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedSpace.equipment.split(',').map((eq: string, i: number) => (
                                <span key={i} className="bg-white/50 border border-black/5 px-2 py-1 rounded-md text-[9px] font-black uppercase">{eq.trim()}</span>
                            ))}
                        </div>
                    )}

                    {/* FORMULARIO DE FECHAS */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-black/5">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-50 ml-1">Entrada</label>
                            <input type="date" className="w-full p-2 rounded-xl bg-white font-bold text-xs outline-none text-slate-900" onChange={e => setReservationForm({...reservationForm, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-50 ml-1">Salida</label>
                            <input type="date" className="w-full p-2 rounded-xl bg-white font-bold text-xs outline-none text-slate-900" onChange={e => setReservationForm({...reservationForm, endDate: e.target.value})} />
                        </div>
                    </div>

                    <button onClick={confirmBooking} className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg">
                        Confirmar Reserva
                    </button>
                </div>
            )}
            
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-xs w-full text-center font-bold opacity-40 hover:text-red-500 transition-colors uppercase pt-4">Cerrar Sesión</button>
          </div>
        )}

      </div>
    </div>
  );
}