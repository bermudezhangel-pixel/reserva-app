"use client";
import { useState, useEffect } from 'react';

export default function ReservePage() {
  const [step, setStep] = useState<'email' | 'otp' | 'reserve'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  
  // Formulario final
  const [form, setForm] = useState({ spaceId: '', userName: '', userPhone: '', date: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/spaces').then(res => res.json()).then(setSpaces);
  }, []);

  // Bloqueo de calendario según oficina seleccionada
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
    if (res.ok) setStep('reserve');
    else alert("Código inválido");
  };

  const confirmarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockedDates.includes(form.date)) return alert("Día ocupado");

    const res = await fetch('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ ...form, userEmail: email })
    });
    if (res.ok) alert("¡Reserva confirmada!");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-600 font-sans">
        
        {step === 'email' && (
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black">Acceso 🔑</h2>
            <p className="text-slate-500">Introduce tu email para enviarte un código.</p>
            <input type="email" className="w-full border-2 p-4 rounded-xl text-center" placeholder="tu@email.com" onChange={e => setEmail(e.target.value)} />
            <button onClick={enviarCodigo} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black">{loading ? 'Enviando...' : 'Pedir Código'}</button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black">Código OTP 📬</h2>
            <p className="text-slate-500">Escribe los 6 dígitos que te enviamos.</p>
            <input type="text" className="w-full border-2 p-4 rounded-xl text-center text-3xl font-bold" maxLength={6} onChange={e => setOtp(e.target.value)} />
            <button onClick={verificarCodigo} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black">Verificar</button>
          </div>
        )}

        {step === 'reserve' && (
          <form onSubmit={confirmarReserva} className="space-y-4">
            <h2 className="text-2xl font-black mb-4 text-center">Reservar ahora 🏢</h2>
            <select className="w-full border-2 p-4 rounded-xl font-bold bg-slate-50" required onChange={e => setForm({...form, spaceId: e.target.value})}>
              <option value="">¿Qué oficina/sala?</option>
              {spaces.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="text" placeholder="Tu Nombre" className="w-full border-2 p-4 rounded-xl" required onChange={e => setForm({...form, userName: e.target.value})} />
            <input type="tel" placeholder="Tu Teléfono" className="w-full border-2 p-4 rounded-xl" required onChange={e => setForm({...form, userPhone: e.target.value})} />
            <input 
              type="date" 
              className={`w-full border-2 p-4 rounded-xl font-bold ${blockedDates.includes(form.date) ? 'border-red-500 bg-red-50' : ''}`}
              onChange={e => setForm({...form, date: e.target.value})} 
              required 
            />
            {blockedDates.includes(form.date) && <p className="text-red-500 text-xs font-bold">⚠️ Este día no está disponible para este espacio.</p>}
            <button disabled={blockedDates.includes(form.date)} className="w-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg shadow-green-200">Confirmar Todo</button>
          </form>
        )}
      </div>
    </div>
  );
}