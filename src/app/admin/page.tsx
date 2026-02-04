"use client";
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'reservas' | 'espacios'>('reservas');
  const [reservations, setReservations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resRes, resSpa] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/spaces')
      ]);
      setReservations(await resRes.json());
      setSpaces(await resSpa.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    // Actualización visual inmediata
    setReservations((prev: any) =>
      prev.map((r: any) => r.id === id ? { ...r, status: nuevoEstado } : r)
    );

    try {
      await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nuevoEstado })
      });
    } catch (error) {
      console.error(error);
      fetchData(); // Si falla, recarga los reales
    }
  };

  const guardarCambiosEspacio = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/spaces/${editingSpace.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingSpace,
        capacity: parseInt(editingSpace.capacity),
        pricePerHour: parseFloat(editingSpace.pricePerHour)
      })
    });
    setEditingSpace(null);
    fetchData();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-2xl animate-pulse">
      CARGANDO...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Admin Panel ⚙️</h1>
          <div className="flex bg-white border-2 border-slate-200 rounded-2xl p-1 shadow-sm font-bold">
            <button 
              onClick={() => setTab('reservas')} 
              className={`px-8 py-2 rounded-xl transition-all ${tab === 'reservas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}
            >
              Reservas
            </button>
            <button 
              onClick={() => setTab('espacios')} 
              className={`px-8 py-2 rounded-xl transition-all ${tab === 'espacios' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}
            >
              Inventario
            </button>
          </div>
        </header>

        {tab === 'reservas' ? (
          <div className="grid gap-4">
            {reservations.map((res: any) => (
              <div key={res.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-black text-xl">{res.userName}</p>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                      res.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-blue-600 mb-1 tracking-tight">@{res.space?.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{new Date(res.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Email: {res.userEmail}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => cambiarEstado(res.id, 'CONFIRMED')} 
                    className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                      res.status === 'CONFIRMED' ? 'bg-green-600 text-white scale-95 opacity-50' : 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    {res.status === 'CONFIRMED' ? '✓ CONFIRMADA' : 'CONFIRMAR'}
                  </button>
                  <button 
                    onClick={() => cambiarEstado(res.id, 'CANCELLED')} 
                    className="flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((s: any) => (
              <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                <h3 className="text-2xl font-black text-slate-800 mb-2">{s.name}</h3>
                <div className="flex gap-4 mb-6">
                  <div className="bg-blue-50 px-3 py-1 rounded-lg">
                    <p className="text-[10px] font-black text-blue-600 uppercase">Precio</p>
                    <p className="font-bold text-slate-800">${s.pricePerHour}/h</p>
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-lg">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Capacidad</p>
                    <p className="font-bold text-slate-800">{s.capacity} pers.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingSpace(s)} 
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg"
                >
                  EDITAR ESPACIO
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE EDICIÓN - ESTILO LIMPIO */}
        {editingSpace && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white p-10 rounded-[3rem] max-w-sm w-full shadow-2xl border-t-[12px] border-blue-600">
              <h2 className="text-3xl font-black mb-6">Ajustar <span className="text-blue-600">{editingSpace.name}</span></h2>
              <form onSubmit={guardarCambiosEspacio} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Nombre</label>
                  <input className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" type="text" value={editingSpace.name} onChange={e => setEditingSpace({...editingSpace, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Capacidad</label>
                    <input className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" type="number" value={editingSpace.capacity} onChange={e => setEditingSpace({...editingSpace, capacity: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Costo/h</label>
                    <input className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" type="number" step="0.01" value={editingSpace.pricePerHour} onChange={e => setEditingSpace({...editingSpace, pricePerHour: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all uppercase text-xs">Guardar</button>
                  <button type="button" onClick={() => setEditingSpace(null)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase text-xs">Cerrar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}