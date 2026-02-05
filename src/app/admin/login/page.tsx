"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import PageTransition from '@/components/PageTransition';

export default function AdminLogin() {
  const { theme, logo, appTitle } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Estilos dinámicos (Mismo diseño que el resto de la app)
  const glassClass = "backdrop-blur-xl border border-current/10 shadow-2xl transition-all duration-300";
  const primaryColor = 'var(--color-primary)';
  const bgClass = theme === 'dark' ? 'bg-slate-900 text-white' : theme === 'colorful' ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white' : 'bg-slate-100 text-slate-900';
  const cardClass = theme === 'light' ? 'bg-white/80 border-white' : 'bg-black/30 border-white/10 text-white';

  // 1. Enviar OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Ingresa el email de administrador");
    
    setLoading(true);
    
    // Primero verificamos si el usuario existe y es ADMIN
    const checkUser = await fetch(`/api/user/profile?email=${email}`);
    const user = await checkUser.json();

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      setLoading(false);
      return alert("Acceso denegado: Este email no tiene permisos de administrador.");
    }

    // Si es admin, enviamos OTP
    const res = await fetch('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    setLoading(false);
    if (res.ok) {
      setStep('otp');
    } else {
      alert("Error enviando código");
    }
  };

  // 2. Verificar OTP y Entrar
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    setLoading(false);

    if (res.ok) {
      // Guardamos la sesión de ADMIN
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminSession', Date.now().toString());
      router.push('/admin');
    } else {
      alert("Código incorrecto");
    }
  };

  return (
    <PageTransition>
      <div className={`min-h-screen flex items-center justify-center p-6 font-sans ${bgClass}`}>
        <div className={`w-full max-w-md p-10 rounded-[3rem] ${glassClass} ${cardClass}`}>
          
          <div className="text-center mb-10">
            {logo ? (
              <img src={logo} alt="Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
            ) : (
              <div className="text-4xl mb-2">🔒</div>
            )}
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">{appTitle}</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mt-2">Acceso Administrativo</p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50 ml-3">Email de Administrador</label>
                <input 
                  type="email" 
                  autoFocus
                  placeholder="admin@empresa.com" 
                  className="w-full p-4 rounded-2xl bg-current/5 font-bold outline-none focus:bg-current/10 transition-all border border-transparent focus:border-current/20"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button 
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black uppercase text-xs text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Verificando...' : 'Solicitar Acceso'}
              </button>
              <button type="button" onClick={() => router.push('/')} className="w-full text-center text-[10px] font-bold opacity-40 hover:opacity-100 uppercase">Volver al inicio</button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6 animate-in zoom-in duration-300">
              <div className="text-center">
                <h2 className="text-xl font-black uppercase">Código de Seguridad</h2>
                <p className="text-xs opacity-60 mt-1">Enviado a {email}</p>
              </div>
              
              <input 
                type="text" 
                maxLength={6} 
                autoFocus
                className="w-full text-center text-4xl tracking-[0.5em] font-black p-4 rounded-2xl bg-current/5 outline-none focus:ring-2 ring-current/20"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />

              <button 
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black uppercase text-xs text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Validando...' : 'Entrar al Panel'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-center text-[10px] font-bold opacity-40 hover:opacity-100 uppercase">Cambiar Email</button>
            </form>
          )}

        </div>
      </div>
    </PageTransition>
  );
}