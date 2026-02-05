"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import PageTransition from '@/components/PageTransition';

export default function ReservePage() {
  const { logo, theme } = useTheme(); // Usamos el logo y tema del contexto
  const router = useRouter();
  
  // Estados
  const [step, setStep] = useState<'welcome' | 'login' | 'register' | 'otp' | 'booking'>('welcome');
  const [userData, setUserData] = useState({ name: '', email: '', phone: '', address: '' });
  const [otp, setOtp] = useState('');
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reservationForm, setReservationForm] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check sesión
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserData(prev => ({ ...prev, email: savedEmail }));
      fetch(`/api/user/profile?email=${savedEmail}`)
        .then(res => res.json())
        .then(u => {
            if(u.name) { setUserData(prev => ({...prev, ...u})); setStep('booking'); }
        });
    }
    fetch('/api/spaces').then(r => r.json()).then(d => setSpaces(Array.isArray(d) ? d : []));
  }, []);

  // Lógica de autenticación
  const handleAuth = async (type: 'login' | 'register') => {
    if(!userData.email) return alert("Email requerido");
    setLoading(true);
    if(type === 'register') await fetch('/api/users', { method: 'POST', body: JSON.stringify({...userData, role:'USER'}) });
    await fetch('/api/auth/otp', { method: 'POST', body: JSON.stringify({ email: userData.email }) });
    setLoading(false);
    setStep('otp');
  };

  const verifyOtp = async () => {
    const res = await fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ email: userData.email, otp }) });
    if (res.ok) {
        localStorage.setItem('userEmail', userData.email);
        if(userData.address) await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(userData) });
        setStep('booking');
    } else { alert("Código incorrecto"); }
  };

  const confirmBooking = async () => {
     const res = await fetch('/api/reservations', {
        method: 'POST', 
        body: JSON.stringify({ spaceId: selectedSpace.id, userEmail: userData.email, ...reservationForm })
     });
     if(res.ok) { alert("¡Reserva confirmada!"); router.push('/profile'); }
     else { alert("Error al reservar"); }
  };

  // Estilos dinámicos
  const glassCard = theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-white/80 border-white text-slate-900';
  const primaryColor = 'var(--color-primary)';

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col md:flex-row font-sans overflow-hidden">
        
        {/* --- COLUMNA IZQUIERDA: BRANDING --- */}
        <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative overflow-hidden bg-slate-100 dark:bg-slate-900">
           {/* Fondo decorativo */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${primaryColor}, transparent 50%)` }}></div>
           
           <div className="relative z-10">
              {logo && <img src={logo} alt="Logo" className="h-16 w-auto object-contain mb-8 animate-in fade-in slide-in-from-top duration-700" />}
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] mb-6">
                Espacios <br/> <span style={{ color: primaryColor }}>Creativos</span>
              </h1>
              <p className="text-lg font-bold opacity-60 max-w-sm">La plataforma premium para gestionar tu trabajo y reuniones con estilo.</p>
           </div>
           
           <div className="relative z-10 hidden md:block">
              <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Powered by Reserva App</p>
           </div>
        </div>

        {/* --- COLUMNA DERECHA: INTERACCIÓN --- */}
        <div className="md:w-1/2 relative flex items-center justify-center p-6 md:p-12">
           <div className={`w-full max-w-md p-8 md:p-12 rounded-[3rem] backdrop-blur-xl border shadow-2xl transition-all duration-500 ${glassCard}`}>
              
              {/* PASO: WELCOME */}
              {step === 'welcome' && (
                  <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
                      <h2 className="text-3xl font-black uppercase">Bienvenido</h2>
                      <div className="space-y-3">
                          <button onClick={() => setStep('login')} style={{backgroundColor: primaryColor}} className="w-full text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:brightness-110 transition-all">Iniciar Sesión</button>
                          <button onClick={() => setStep('register')} className="w-full bg-black/5 py-4 rounded-2xl font-black uppercase hover:bg-black/10 transition-all">Crear Cuenta</button>
                      </div>
                  </div>
              )}

              {/* PASO: LOGIN/REGISTER */}
              {(step === 'login' || step === 'register') && (
                  <div className="space-y-4 animate-in slide-in-from-right duration-300">
                      <h2 className="text-2xl font-black uppercase mb-6">{step === 'login' ? 'Acceder' : 'Registro'}</h2>
                      {step === 'register' && (
                          <div className="grid grid-cols-2 gap-3">
                              <input placeholder="Nombre" className="p-4 rounded-2xl bg-black/5 font-bold outline-none" onChange={e => setUserData({...userData, name: e.target.value})} />
                              <input placeholder="Teléfono" className="p-4 rounded-2xl bg-black/5 font-bold outline-none" onChange={e => setUserData({...userData, phone: e.target.value})} />
                          </div>
                      )}
                      <input placeholder="Email Corporativo" className="w-full p-4 rounded-2xl bg-black/5 font-bold outline-none" onChange={e => setUserData({...userData, email: e.target.value})} />
                      {step === 'register' && <input placeholder="Dirección" className="w-full p-4 rounded-2xl bg-black/5 font-bold outline-none" onChange={e => setUserData({...userData, address: e.target.value})} />}
                      
                      <button onClick={() => handleAuth(step)} style={{backgroundColor: primaryColor}} className="w-full text-white py-4 rounded-2xl font-black uppercase shadow-lg mt-4">
                          {loading ? 'Procesando...' : 'Continuar'}
                      </button>
                      <button onClick={() => setStep('welcome')} className="w-full text-center text-xs font-bold opacity-50 uppercase mt-4">Volver</button>
                  </div>
              )}

              {/* PASO: OTP */}
              {step === 'otp' && (
                  <div className="space-y-6 text-center animate-in zoom-in duration-300">
                      <h2 className="text-2xl font-black">Código de Verificación</h2>
                      <p className="text-xs opacity-60">Enviado a {userData.email}</p>
                      <input maxLength={6} className="w-full text-center text-4xl tracking-[0.5em] font-black p-4 rounded-2xl bg-black/5 outline-none" onChange={e => setOtp(e.target.value)} />
                      <button onClick={verifyOtp} style={{backgroundColor: primaryColor}} className="w-full text-white py-4 rounded-2xl font-black uppercase shadow-lg">Validar</button>
                  </div>
              )}

              {/* PASO: BOOKING */}
              {step === 'booking' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="flex justify-between items-center">
                          <h2 className="text-xl font-black italic">Hola, {userData.name?.split(' ')[0]}</h2>
                          <button onClick={() => router.push('/profile')} className="text-[10px] font-black uppercase opacity-50 border border-current px-3 py-1 rounded-full">Mi Perfil</button>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase opacity-50 ml-2">Elige tu espacio</label>
                          <select className="w-full p-4 rounded-2xl bg-black/5 font-bold outline-none cursor-pointer appearance-none" onChange={(e) => {
                              const s = spaces.find(sp => sp.id === e.target.value);
                              setSelectedSpace(s); setCurrentImageIndex(0);
                          }}>
                              <option value="">Seleccionar...</option>
                              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                      </div>

                      {selectedSpace && (
                          <div className="space-y-4">
                              {/* Carrusel */}
                              <div className="relative h-40 rounded-2xl overflow-hidden bg-black/10 group">
                                  {selectedSpace.images?.length > 0 ? (
                                      <>
                                        <img src={selectedSpace.images[currentImageIndex]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        {selectedSpace.images.length > 1 && (
                                            <>
                                                <button onClick={() => setCurrentImageIndex(i => (i - 1 + selectedSpace.images.length) % selectedSpace.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-xs">◀</button>
                                                <button onClick={() => setCurrentImageIndex(i => (i + 1) % selectedSpace.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-xs">▶</button>
                                            </>
                                        )}
                                      </>
                                  ) : <div className="flex items-center justify-center h-full opacity-30 font-black">SIN FOTO</div>}
                                  <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-black shadow-sm">${selectedSpace.pricePerHour}/h</div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                  <input type="date" className="p-3 rounded-2xl bg-black/5 font-bold outline-none text-xs" onChange={e => setReservationForm({...reservationForm, startDate: e.target.value})} />
                                  <input type="date" className="p-3 rounded-2xl bg-black/5 font-bold outline-none text-xs" onChange={e => setReservationForm({...reservationForm, endDate: e.target.value})} />
                              </div>

                              <button onClick={confirmBooking} style={{backgroundColor: primaryColor}} className="w-full text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:scale-105 transition-all">
                                  Confirmar Reserva
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