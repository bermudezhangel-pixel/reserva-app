"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // [SECCIÓN: ESTADOS PRINCIPALES]
  const [step, setStep] = useState<'email' | 'otp' | 'reserve'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  // [SECCIÓN: ESTADOS DE DATOS Y RESERVA]
  const [spaces, setSpaces] = useState([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [form, setForm] = useState({ 
    spaceId: '', 
    startDate: '', 
    endDate: '' 
  });

  // [SECCIÓN: EFECTOS - AUTO-LOGIN]
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    if (savedEmail && sessionExpiry) {
      if (Date.now() < parseInt(sessionExpiry)) {
        setEmail(savedEmail);
        setStep('reserve');
        fetch(`/api/user/profile?email=${savedEmail}`)
          .then(res => res.json())
          .then(data => { 
            if (data && data.name) setUserName(data.name);
          })
          .catch(() => {
            localStorage.clear();
            setStep('email');
          });
      }
    }
  }, []);

  // [SECCIÓN: EFECTOS - CARGAR ESPACIOS]
  useEffect(() => {
    fetch('/api/spaces').then(res => res.json()).then(setSpaces);
  }, []);

  // [SECCIÓN: EFECTOS - CARGAR DISPONIBILIDAD]
  useEffect(() => {
    if (form.spaceId) {
      fetch(`/api/availability/${form.spaceId}`).then(res => res.json()).then(setBlockedDates);
    }
  }, [form.spaceId]);

  // [SECCIÓN: LÓGICA DE VALIDACIÓN DE RANGO]
  const checkRangeConflict = () => {
    if (!form.startDate || !form.endDate) return false;
    
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    
    if (end < start) return true; // Error: Fecha fin es antes que inicio

    let current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (blockedDates.includes(dateStr)) return true;
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  const hasConflict = checkRangeConflict();

  // [SECCIÓN: FUNCIONES DE AUTENTICACIÓN]
  const enviarCodigo = async () => {
    setLoading(true);
    await fetch('/api/auth/otp', { method: 'POST', body: JSON.stringify({ email }) });
    setLoading(false);
    setStep('otp');
  };

  const verificarCodigo = async () => {
    const res = await fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ email, otp }) });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('sessionExpiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
      if (data.needsProfile) {
        router.push('/profile');
      } else {
        setUserName(data.user?.name || '');
        setStep('reserve');
      }
    } else {
      alert("Código incorrecto");
    }
  };

  // [SECCIÓN: FUNCIONES DE RESERVA]
  const confirmarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConflict) return alert("El rango seleccionado tiene días ocupados");
    
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userEmail: email })
    });
    
    if (res.ok) {
      alert("¡Reserva confirmada!");
      router.push('/profile');
    } else {
      alert("Error al procesar reserva");
    }
  };

  // [SECCIÓN: RENDERIZADO DE INTERFAZ]
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border-t-8 border-blue-600">
        
        {step === 'email' && (
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black italic">Acceso 🔑</h2>
            <input type="email" className="w-full border-2 p-4 rounded-2xl text-center font-bold" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={enviarCodigo} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase">{loading ? 'Enviando...' : 'Obtener Código'}</button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black italic">Verifica 📬</h2>
            <input type="text" className="w-full border-2 p-4 rounded-2xl text-center text-3xl font-bold tracking-widest" maxLength={6} onChange={e => setOtp(e.target.value)} />
            <button onClick={verificarCodigo} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase">Entrar</button>
          </div>
        )}

        {step === 'reserve' && (
          <form onSubmit={confirmarReserva} className="space-y-4">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-black italic">¡Hola, {userName || 'bienvenido'}! 👋</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{email}</p>
            </div>

            {/* SELECTOR DE ESPACIO */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">¿Qué deseas reservar?</label>
              <select className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold bg-slate-50 focus:border-blue-600 outline-none transition-all" required onChange={e => setForm({...form, spaceId: e.target.value})}>
                <option value="">Selecciona un lugar...</option>
                {spaces.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* SELECTORES DE RANGO (DESDE - HASTA) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Desde</label>
                <input type="date" className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-blue-600" required onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Hasta</label>
                <input type="date" className={`w-full border-2 p-3 rounded-xl font-bold text-sm outline-none transition-all ${hasConflict ? 'border-red-500 bg-red-50 text-red-600 line-through decoration-red-600' : 'border-slate-100 focus:border-blue-600'}`} required onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
            </div>

            {/* MENSAJE DE ERROR ROJO */}
            {hasConflict && (
              <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100">
                <p className="text-red-600 text-[10px] font-black uppercase text-center italic">⚠️ Rango no disponible o inválido</p>
              </div>
            )}

            {/* LISTA DE DÍAS BLOQUEADOS */}
            {blockedDates.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Días no disponibles:</p>
                <div className="flex flex-wrap gap-1">
                  {blockedDates.slice(0, 10).map(d => (
                    <span key={d} className="text-[9px] bg-white border border-red-100 text-red-500 px-2 py-0.5 rounded-lg line-through decoration-red-400 font-bold italic">
                      {d.split('-').reverse().slice(0,2).join('/')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button disabled={hasConflict || !form.endDate} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 uppercase tracking-widest hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">Confirmar Rango</button>
            
            <button type="button" onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full text-[10px] text-slate-300 mt-4 uppercase font-bold hover:text-red-400 transition-colors">Cerrar sesión</button>
          </form>
        )}
      </div>
    </div>
  );
}