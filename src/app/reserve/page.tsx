"use client";
import { useState, useEffect } from 'react';

export default function ReservePage() {
  const [step, setStep] = useState<'email' | 'otp' | 'profile' | 'reserve'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados de datos
  const [spaces, setSpaces] = useState([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [userData, setUserData] = useState({ 
    name: '', phone: '', company: '', taxId: '', billingAddress: '', billingCity: '' 
  });
  const [form, setForm] = useState({ spaceId: '', date: '' });

  useEffect(() => {
    fetch('/api/spaces').then(res => res.json()).then(setSpaces);
  }, []);

  useEffect(() => {
    if (form.spaceId) {
      fetch(`/api/availability/${form.spaceId}`).then(res => res.json()).then(setBlockedDates);
    }
  }, [form.spaceId]);

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
      if (data.needsProfile) setStep('profile');
      else setStep('reserve');
    } else {
      alert("Código incorrecto");
    }
  };

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ email, ...userData })
    });
    setStep('reserve');
  };

  const confirmarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockedDates.includes(form.date)) return alert("Fecha no disponible");
    
    const res = await fetch('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ ...form, userName: userData.name, userEmail: email, userPhone: userData.phone })
    });
    if (res.ok) alert("¡Reserva confirmada con éxito!");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-600">
        
        {step === 'email' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-black">Bienvenido 🔑</h2>
            <p className="text-slate-500">Ingresa tu email para continuar.</p>
            <input type="email" className="w-full border-2 p-4 rounded-xl" placeholder="ejemplo@correo.com" onChange={e => setEmail(e.target.value)} />
            <button onClick={enviarCodigo} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg uppercase tracking-wider">{loading ? 'Cargando...' : 'Obtener Código'}</button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-center">Código OTP 📬</h2>
            <p className="text-slate-500 text-center">Ingresa los 6 dígitos enviados a tu correo.</p>
            <input type="text" className="w-full border-2 p-4 rounded-xl text-center text-3xl font-bold tracking-widest" maxLength={6} onChange={e => setOtp(e.target.value)} />
            <button onClick={verificarCodigo} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-wider">Verificar Identidad</button>
          </div>
        )}

        {step === 'profile' && (
          <form onSubmit={guardarPerfil} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            <h2 className="text-2xl font-black">Datos de Facturación 👤</h2>
            <div className="space-y-3">
              <p className="text-xs font-bold text-blue-600 uppercase">Información Personal</p>
              <input type="text" placeholder="Nombre completo" className="w-full border-2 p-3 rounded-xl" required onChange={e => setUserData({...userData, name: e.target.value})} />
              <input type="tel" placeholder="Teléfono" className="w-full border-2 p-3 rounded-xl" required onChange={e => setUserData({...userData, phone: e.target.value})} />
              <input type="text" placeholder="Empresa" className="w-full border-2 p-3 rounded-xl" onChange={e => setUserData({...userData, company: e.target.value})} />
            </div>
            <div className="space-y-3 pt-4 border-t-2 border-slate-50">
              <p className="text-xs font-bold text-blue-600 uppercase">Datos Fiscales</p>
              <input type="text" placeholder="RUC / NIT / Tax ID" className="w-full border-2 p-3 rounded-xl" required onChange={e => setUserData({...userData, taxId: e.target.value})} />
              <input type="text" placeholder="Dirección de Facturación" className="w-full border-2 p-3 rounded-xl" required onChange={e => setUserData({...userData, billingAddress: e.target.value})} />
              <input type="text" placeholder="Ciudad" className="w-full border-2 p-3 rounded-xl" required onChange={e => setUserData({...userData, billingCity: e.target.value})} />
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg">Completar Registro</button>
          </form>
        )}

        {step === 'reserve' && (
          <form onSubmit={confirmarReserva} className="space-y-4">
            <h2 className="text-2xl font-black text-center">Reserva tu Espacio 🏢</h2>
            <select className="w-full border-2 p-4 rounded-xl font-bold bg-slate-50" required onChange={e => setForm({...form, spaceId: e.target.value})}>
              <option value="">¿Qué deseas reservar?</option>
              {spaces.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" className={`w-full border-2 p-4 rounded-xl font-bold ${blockedDates.includes(form.date) ? 'border-red-500 bg-red-50' : ''}`} onChange={e => setForm({...form, date: e.target.value})} required />
            {blockedDates.includes(form.date) && <p className="text-red-500 text-xs font-bold text-center">❌ Fecha no disponible para este espacio.</p>}
            <button disabled={blockedDates.includes(form.date)} className="w-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg uppercase tracking-wider disabled:bg-slate-300">Finalizar Reserva</button>
          </form>
        )}

      </div>
    </div>
  );
}