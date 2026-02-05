"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // [FUNCIÓN MÁGICA PARA EVITAR INVALID DATE]
  const formatDate = (dateString: any) => {
    if (!dateString) return "---";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Pendiente";
      // Formato simple: DD/MM/AAAA
      return d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return "Error fecha";
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/reserve'); // Si no hay email, mandar al login
      return;
    }

    const cargarDatos = async () => {
      try {
        // 1. Cargar datos del usuario
        const resUser = await fetch(`/api/user/profile?email=${email}`);
        const userData = await resUser.json();
        setUser(userData);

        // 2. Cargar reservas (usando la nueva API blindada)
        const resBookings = await fetch(`/api/user-bookings?email=${email}`);
        const bookingsData = await resBookings.json();
        setReservations(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-blue-600 animate-pulse uppercase tracking-widest">
      Cargando Perfil...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* TARJETA DE USUARIO */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-blue-600 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">👤</div>
          <h1 className="text-3xl font-black italic mb-1">{user?.name || 'Usuario'}</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{user?.email}</p>
          
          <button 
            onClick={() => router.push('/reserve')} 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg"
          >
            + Nueva Reserva
          </button>
        </div>

        {/* LISTA DE RESERVAS */}
        <div>
          <h2 className="text-xl font-black italic mb-4 ml-2 uppercase text-slate-400">Mis Reservas 📅</h2>
          
          {reservations.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm">Aún no tienes reservas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res: any) => (
                <div key={res.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                  {/* Borde de estado lateral */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                    res.status === 'CONFIRMED' ? 'bg-green-400' : 
                    res.status === 'CANCELLED' ? 'bg-red-400' : 'bg-amber-400'
                  }`} />

                  <div className="pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-lg leading-none">{res.space?.name || 'Espacio'}</h3>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${
                        res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                        res.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {res.status === 'CONFIRMED' ? 'CONFIRMADA' : res.status}
                      </span>
                    </div>

                    {/* SECCIÓN DE FECHAS CORREGIDA */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3 bg-slate-50 p-2 rounded-xl inline-flex">
                      <span>📅 {formatDate(res.startDate)}</span>
                      <span className="text-blue-400">➜</span>
                      <span>{formatDate(res.endDate)}</span>
                    </div>

                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                      ID: {res.id.slice(-6)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
        <button 
          onClick={() => { localStorage.clear(); router.push('/reserve'); }} 
          className="w-full text-center text-[10px] font-black text-slate-300 uppercase hover:text-red-400 transition-colors py-4"
        >
          Cerrar Sesión
        </button>

      </div>
    </div>
  );
}