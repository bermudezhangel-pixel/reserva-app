"use client";
import { useState, useEffect } from 'react';
import { translations, Locale } from '@/lib/translations';

// Añadimos las banderas a los idiomas
const languageOptions: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: 'es' }, // Nota: algunos sistemas no muestran bandera de España con emoji regional, usamos 🇪🇸
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function ReservePage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [form, setForm] = useState({ userName: '', userEmail: '', userPhone: '', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const t = translations[locale];

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (translations[browserLang]) setLocale(browserLang);
  }, []);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setIsSubmitting(false);
    if (res.ok) alert("✅ ¡Reserva enviada con éxito!");
  };

  return (
    <div dir={t.dir} className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200">
        
        {/* Selector de Idioma con Banderas */}
        <div className="flex justify-end mb-6">
          <div className="relative inline-block">
            <select 
              onChange={(e) => setLocale(e.target.value as Locale)} 
              value={locale} 
              className="appearance-none bg-slate-100 border border-slate-300 text-slate-900 text-sm rounded-full focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 px-4 pr-10 cursor-pointer font-bold"
            >
              {languageOptions.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              ▼
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{t.title}</h2>
        <p className="text-slate-500 mb-8 font-medium">Complete los detalles para asegurar su lugar.</p>
        
        <form onSubmit={enviar} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t.name}</label>
            <input 
              type="text" 
              className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium" 
              placeholder="Ej: Angel Bermudez"
              onChange={e => setForm({...form, userName: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t.email}</label>
            <input 
              type="email" 
              className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium" 
              placeholder="angel@correo.com"
              onChange={e => setForm({...form, userEmail: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t.phone}</label>
            <input 
              type="tel" 
              className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium" 
              placeholder="+1 234 567 890"
              onChange={e => setForm({...form, userPhone: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t.date}</label>
            <input 
              type="date" 
              className="w-full border-2 border-slate-200 p-4 rounded-xl focus:border-blue-600 outline-none transition-all text-slate-900 font-medium" 
              onChange={e => setForm({...form, date: e.target.value})} 
              required 
            />
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95 disabled:bg-slate-400"
          >
            {isSubmitting ? "..." : t.submit}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 uppercase tracking-widest font-bold">Secure Booking System</p>
      </div>
    </div>
  );
}