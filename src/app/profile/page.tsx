"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Intentamos recuperar la sesión
    const email = localStorage.getItem('userEmail');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    // Si no hay email o la sesión expiró, al login
    if (!email || (sessionExpiry && Date.now() > parseInt(sessionExpiry))) {
      localStorage.clear();
      router.push('/reserve');
      return;
    }

    // Cargar datos del perfil y sus reservas
    Promise.all([
      fetch(`/api/user/profile?email=${email}`).then(res => res.json()),
      fetch(`/api/user/reservations?email=${email}`).then(res => res.json())
    ]).then(([userData, resData]) => {
      setUser(userData);
      setReservations(resData);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="p-20 text-center font-bold">Cargando tu espacio...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado con Saludo */}
        <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border">
          <div>
            <h1 className="text-3xl font-black">¡Hola, {user?.name || 'Usuario'}! 👋</h1>
            <p className="text-slate-500">Bienvenido a tu panel de gestión.</p>
          </div>
          <button onClick={() => router.push('/reserve')} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">Nueva Reserva</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Mis Reservas */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg text-blue-600">📅</span> 
              Mis Reservas
            </h2>
            {reservations.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-dashed text-center text-slate-400">
                Aún no tienes reservas registradas.
              </div>
            ) : (
              <div className="grid gap-4">
                {reservations.map((res: any) => (
                  <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
                    <div>
                      <p className="font-black text-lg">{res.space?.name}</p>
                      <p className="text-slate-500 text-sm">
                        {new Date(res.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-bold ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Datos de Facturación */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border h-fit">
            <h2 className="text-xl font-black mb-6">Datos Fiscales</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Empresa</p>
                <p className="font-medium">{user?.company || 'No definida'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Tax ID / RUC</p>
                <p className="font-medium">{user?.taxId}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Dirección</p>
                <p className="font-medium">{user?.billingAddress}, {user?.billingCity}</p>
              </div>
              <button onClick={() => alert("Función para editar en desarrollo")} className="w-full mt-4 text-blue-600 font-bold text-xs hover:underline">Editar mis datos</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}