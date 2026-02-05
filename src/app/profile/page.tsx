"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import PageTransition from '@/components/PageTransition';
import BackButton from '@/components/BackButton';

const textProfile = {
  es: {
    title: "Mi Perfil",
    subtitle: "Gestiona tu información y reservas",
    personalInfo: "Información Personal",
    edit: "Editar",
    cancel: "Cancelar",
    save: "Guardar Cambios",
    history: "Historial de Reservas",
    noBookings: "Aún no tienes reservas.",
    newBooking: "Nueva Reserva",
    logout: "Cerrar Sesión",
    stats: "Estadísticas",
    total: "Reservas Totales",
    last: "Última Reserva",
    labels: { name: "Nombre", phone: "Teléfono", address: "Dirección", email: "Email" }
  },
  en: {
    title: "My Profile",
    subtitle: "Manage your info and bookings",
    personalInfo: "Personal Information",
    edit: "Edit",
    cancel: "Cancel",
    save: "Save Changes",
    history: "Booking History",
    noBookings: "No bookings yet.",
    newBooking: "New Booking",
    logout: "Logout",
    stats: "Statistics",
    total: "Total Bookings",
    last: "Last Booking",
    labels: { name: "Name", phone: "Phone", address: "Address", email: "Email" }
  }
};

export default function ProfilePage() {
  const { lang, theme } = useTheme();
  const t = textProfile[lang as 'es' | 'en'];
  const router = useRouter();
  
  const [user, setUser] = useState<any>({});
  const [reservations, setReservations] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar Datos
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) { router.push('/reserve'); return; }

    Promise.all([
      fetch(`/api/user/profile?email=${email}`).then(r => r.json()),
      fetch(`/api/user-bookings?email=${email}`).then(r => r.json()) // Asumiendo que existe, o filtrar de reservations
    ]).then(([uData, rData]) => {
      setUser(uData);
      // Si no tienes endpoint específico de bookings de usuario, usa el general y filtra (menos eficiente pero sirve)
      // O crea /api/reservations?email=...
      if(Array.isArray(rData)) setReservations(rData);
      else {
          // Fallback: fetch all and filter (solo para MVP)
          fetch('/api/reservations').then(r=>r.json()).then(all => {
             if(Array.isArray(all)) setReservations(all.filter((r:any) => r.userEmail === email));
          });
      }
      setLoading(false);
    });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(user)
    });
    setEditing(false);
  };

  const handleLogout = () => {
    if(confirm("Logout?")) {
        localStorage.clear();
        router.push('/reserve');
    }
  };

  // Estilos
  const glassCard = "backdrop-blur-xl bg-white/60 dark:bg-black/40 border border-current/10 shadow-lg rounded-[2rem] p-8";
  const inputClass = "w-full p-3 rounded-xl bg-current/5 font-bold outline-none focus:bg-current/10 transition-colors";

  if(loading) return <div className="min-h-screen flex items-center justify-center animate-pulse">LOADING...</div>;

  return (
    <PageTransition>
      <div className="min-h-screen p-6 md:p-12 font-sans max-w-6xl mx-auto">
        <BackButton route="/reserve" />
        
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 pl-16">
            <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter">{t.title}</h1>
                <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-2">{t.subtitle}</p>
            </div>
            <button onClick={handleLogout} className="mt-4 md:mt-0 text-red-500 font-black uppercase text-xs border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all">
                {t.logout}
            </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* COLUMNA 1: INFO Y STATS */}
            <div className="space-y-8">
                {/* Stats Card */}
                <div className={`${glassCard} bg-[var(--color-primary)] text-white border-transparent`}>
                    <h3 className="font-black uppercase opacity-80 text-xs mb-4">{t.stats}</h3>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-5xl font-black">{reservations.length}</p>
                            <p className="text-xs font-bold opacity-60">{t.total}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-2xl font-black">
                                {reservations.length > 0 ? new Date(reservations[0].startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : '--'}
                             </p>
                             <p className="text-xs font-bold opacity-60">{t.last}</p>
                        </div>
                    </div>
                </div>

                {/* Personal Info Card */}
                <div className={glassCard}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black uppercase text-xl">{t.personalInfo}</h3>
                        <button onClick={() => setEditing(!editing)} className="text-xs font-black opacity-50 hover:opacity-100 hover:text-[var(--color-primary)]">
                            {editing ? t.cancel : t.edit}
                        </button>
                    </div>

                    {editing ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            <input className={inputClass} value={user.name || ''} onChange={e => setUser({...user, name: e.target.value})} placeholder={t.labels.name} />
                            <input className={inputClass} value={user.phone || ''} onChange={e => setUser({...user, phone: e.target.value})} placeholder={t.labels.phone} />
                            <textarea className={inputClass} rows={2} value={user.address || ''} onChange={e => setUser({...user, address: e.target.value})} placeholder={t.labels.address} />
                            <button className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">{t.save}</button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div><p className="text-[10px] font-black uppercase opacity-40">{t.labels.name}</p><p className="font-bold">{user.name}</p></div>
                            <div><p className="text-[10px] font-black uppercase opacity-40">{t.labels.email}</p><p className="font-bold opacity-60">{user.email}</p></div>
                            <div><p className="text-[10px] font-black uppercase opacity-40">{t.labels.phone}</p><p className="font-bold">{user.phone || '--'}</p></div>
                            <div><p className="text-[10px] font-black uppercase opacity-40">{t.labels.address}</p><p className="font-bold">{user.address || '--'}</p></div>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMNA 2 y 3: HISTORIAL */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase">{t.history}</h2>
                    <button onClick={() => router.push('/reserve')} className="bg-current/5 hover:bg-[var(--color-primary)] hover:text-white px-6 py-2 rounded-xl font-black uppercase text-xs transition-all">
                        + {t.newBooking}
                    </button>
                </div>

                <div className="grid gap-4">
                    {reservations.length === 0 && <div className="p-10 text-center opacity-40 font-bold">{t.noBookings}</div>}
                    
                    {reservations.map(res => (
                        <div key={res.id} className={`${glassCard} !p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:scale-[1.01] transition-transform`}>
                             <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-black text-lg">{res.space?.name || "Espacio"}</h3>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${res.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-600' : res.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                        {res.status}
                                    </span>
                                 </div>
                                 <p className="text-xs font-bold opacity-60">
                                    📅 {new Date(res.startDate).toLocaleDateString()} ➜ {new Date(res.endDate).toLocaleDateString()}
                                 </p>
                             </div>
                             <div className="text-right">
                                 <p className="font-bold text-xl">${res.space?.pricePerHour || 0}</p>
                                 <p className="text-[10px] uppercase font-black opacity-40">Total estimado</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </PageTransition>
  );
}