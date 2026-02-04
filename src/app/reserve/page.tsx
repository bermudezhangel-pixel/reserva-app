"use client";
import { useState, useEffect } from 'react';
import { translations, Locale } from '@/lib/translations';

const languageOptions: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function ReservePage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [spaces, setSpaces] = useState([]);
  const [form, setForm] = useState({ userName: '', userEmail: '', userPhone: '', date: '', spaceId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const t = translations[locale];

  useEffect(() => {
    // 1. Detectar idioma del navegador
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (translations[browserLang]) setLocale(browserLang);

    // 2. Cargar los 31 espacios (oficinas, salas, desks)
    fetch('/api/spaces')
      .then(res => res.json())
      .then(data => setSpaces(data));
  }, []);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.spaceId) return alert("Por favor selecciona un espacio");
    
    setIsSubmitting(true);
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setIsSubmitting(false);
    
    if (res.ok) {
      alert("✅ ¡Reserva enviada con éxito!");
      setForm({ ...form, userName: '', userEmail: '', userPhone: '', date: '' });
    }
  };

  return (
    <div dir={t.dir} className="min-h-screen bg-slate-50 p-4 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200">
        
        <div className="flex justify-end mb-6">
          <select 
            onChange={(e) => setLocale(e.target.value as Locale)} 
            value={locale} 
            className="bg-slate-100 border border-slate-300 text-slate-900 text-sm rounded-full p-2 px-4 font-bold outline-none"
          >
            {languageOptions.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{t.title}</h2>
        <p className="text-slate-500 mb-8 font-medium">Oficinas, Salas y Hot Desks.</p>
        
        <form onSubmit={enviar} className="space-y-5">
          {/* SELECTOR DE ESPACIOS DINÁMICO */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 text-blue-600">¿Qué deseas reservar?</label>
            <select 
              className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none font-bold text-slate-900 bg-white"
              onChange={e => setForm({...form, spaceId: e.target.value})}
              required
              value={form.spaceId}
            >
              <option value="">Selecciona un espacio / Choose a space</option>
              {spaces.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} (Cap: {s.capacity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t.name}</label>
            <input 
              type="text" 
              className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all text-slate-900 font-medium" 
              value={form.userName}
              onChange={e => setForm({...form, userName: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t.email}</label>
            <input 
              type="email" 
              className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all text-slate-900 font-medium" 
              value={form.userEmail}
              onChange={e => setForm({...form, userEmail: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{t.phone}</label>
              <input 
                type="tel" 
                className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all text-slate-900 font-medium" 
                value={form.userPhone}
                onChange={e => setForm({...form, userPhone: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{t.date}</label>
              <input 
                type="date" 
                className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all text-slate-900 font-medium" 
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-2xl font-black text-lg shadow-lg transition-all transform active:scale-95 disabled:bg-slate-400"
          >
            {isSubmitting ? "..." : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
}