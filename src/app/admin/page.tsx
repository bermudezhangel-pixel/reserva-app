"use client";
import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [tab, setTab] = useState<'reservas' | 'espacios'>('reservas');
  const [reservations, setReservations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para nuevo espacio
  const [newSpace, setNewSpace] = useState({ name: '', capacity: 1, pricePerHour: 0, description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resRes, resSpa] = await Promise.all([
      fetch('/api/reservations'),
      fetch('/api/spaces')
    ]);
    setReservations(await resRes.json());
    setSpaces(await resSpa.json());
    setLoading(false);
  };

  const deleteSpace = async (id: string) => {
    if (!confirm("¿Borrar este espacio? Se perderán sus reservas.")) return;
    await fetch(`/api/spaces/${id}`, { method: 'DELETE' });
    loadData();
  };

  const createSpace = async () => {
    await fetch('/api/spaces', {
      method: 'POST',
      body: JSON.stringify(newSpace)
    });
    setNewSpace({ name: '', capacity: 1, pricePerHour: 0, description: '' });
    loadData();
  };

  if (loading) return <div className="p-10 text-center font-bold">Cargando panel profesional...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Centro de Control 🚀</h1>
        
        {/* Selector de Pestañas */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setTab('reservas')}
            className={`px-6 py-3 rounded-full font-bold transition ${tab === 'reservas' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
          >
            📋 Reservas Actuales
          </button>
          <button 
            onClick={() => setTab('espacios')}
            className={`px-6 py-3 rounded-full font-bold transition ${tab === 'espacios' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
          >
            🏢 Gestionar Oficinas/Salas
          </button>
        </div>

        {tab === 'reservas' ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Espacio</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r: any) => (
                  <tr key={r.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-bold">{r.userName}<br/><span className="text-xs font-normal text-slate-500">{r.userEmail}</span></td>
                    <td className="p-4 text-blue-600 font-bold">{r.space?.name}</td>
                    <td className="p-4">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Formulario Crear */}
            <div className="bg-white p-6 rounded-3xl shadow-lg h-fit border-2 border-blue-100">
              <h3 className="text-xl font-black mb-4">Añadir Nuevo Espacio</h3>
              <input type="text" placeholder="Nombre (Ej: Oficina 20)" className="w-full border p-3 rounded-lg mb-3" value={newSpace.name} onChange={e => setNewSpace({...newSpace, name: e.target.value})} />
              <input type="number" placeholder="Capacidad" className="w-full border p-3 rounded-lg mb-3" value={newSpace.capacity} onChange={e => setNewSpace({...newSpace, capacity: parseInt(e.target.value)})} />
              <input type="number" placeholder="Precio x Hora" className="w-full border p-3 rounded-lg mb-4" value={newSpace.pricePerHour} onChange={e => setNewSpace({...newSpace, pricePerHour: parseFloat(e.target.value)})} />
              <button onClick={createSpace} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">＋ Crear Espacio</button>
            </div>

            {/* Lista de Espacios */}
            <div className="md:col-span-2 space-y-4">
              {spaces.map((s: any) => (
                <div key={s.id} className="bg-white p-6 rounded-2xl shadow flex justify-between items-center border-l-8 border-blue-600">
                  <div>
                    <h4 className="text-xl font-black text-slate-800">{s.name}</h4>
                    <p className="text-slate-500 text-sm">Capacidad: <b>{s.capacity} personas</b> | Precio: <b>${s.pricePerHour}/h</b></p>
                  </div>
                  <button 
                    onClick={() => deleteSpace(s.id)}
                    className="bg-red-100 text-red-600 p-3 rounded-xl hover:bg-red-600 hover:text-white transition"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}