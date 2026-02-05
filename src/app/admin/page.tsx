"use client";
import { useState, useEffect } from 'react';

// --- DICCIONARIO DE IDIOMAS ---
// CORRECCIÓN: Las claves aquí ahora coinciden exactamente con los valores de 'tab'
const translations: any = {
  es: {
    adminPanel: "Panel de Administración",
    // Estas claves deben coincidir con los valores del estado 'tab'
    reservas: "📅 Reservas",
    espacios: "🏢 Inventario",
    usuarios: "👥 Usuarios",
    settings: "⚙️ Configuración",
    
    create: "Crear Nuevo",
    edit: "Editar",
    delete: "Eliminar",
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando Sistema...",
    confirmDelete: "¿Estás seguro de eliminar este registro?",
    noData: "No hay datos disponibles"
  },
  en: {
    adminPanel: "Admin Dashboard",
    reservas: "📅 Reservations",
    espacios: "🏢 Inventory",
    usuarios: "👥 Users",
    settings: "⚙️ Settings",

    create: "Create New",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading System...",
    confirmDelete: "Are you sure you want to delete this record?",
    noData: "No data available"
  }
};

export default function AdminDashboard() {
  // --- ESTADOS GLOBALES ---
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [theme, setTheme] = useState<'light' | 'dark' | 'colorful'>('light');
  const [appName, setAppName] = useState("Reserva App");
  
  // Estado de pestaña inicial
  const [tab, setTab] = useState('reservas');
  
  const t = translations[lang];

  // --- ESTADOS DE DATOS ---
  // Inicializamos como arrays vacíos para evitar errores de map
  const [reservations, setReservations] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE MODALES ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [targetCollection, setTargetCollection] = useState<'reservas' | 'espacios' | 'usuarios'>('reservas');
  const [formData, setFormData] = useState<any>({});

  // --- ESTILOS VISUALES ---
  const getThemeClasses = () => {
    switch(theme) {
      case 'dark': return "bg-slate-900 text-white";
      case 'colorful': return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white";
      default: return "bg-slate-50 text-slate-900";
    }
  };

  const getCardClasses = () => {
    switch(theme) {
      case 'dark': return "bg-slate-800 border-slate-700 text-white";
      case 'colorful': return "bg-white/20 backdrop-blur-lg border-white/30 text-white placeholder-white shadow-xl";
      default: return "bg-white border-slate-200 text-slate-900";
    }
  };

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      const [resRes, resSpa, resUsers] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/spaces'),
        fetch('/api/users')
      ]);
      
      const dRes = await resRes.json();
      const dSpa = await resSpa.json();
      const dUsers = await resUsers.json();

      setReservations(Array.isArray(dRes) ? dRes : []);
      setSpaces(Array.isArray(dSpa) ? dSpa : []);
      setUsers(Array.isArray(dUsers) ? dUsers : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- HELPERS ---
  const formatDate = (d: any) => {
    if(!d) return "--";
    try {
        const date = new Date(d);
        if(isNaN(date.getTime())) return "Pendiente";
        return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US');
    } catch { return "--"; }
  };

  // --- CRUD LÓGICA ---
  const handleCreate = (collection: any) => {
    setTargetCollection(collection);
    setModalType('create');
    setFormData({});
    setModalOpen(true);
  };

  const handleEdit = (item: any, collection: any) => {
    setTargetCollection(collection);
    setModalType('edit');
    setCurrentItem(item);
    
    if (collection === 'reservas') {
      setFormData({
        ...item,
        startDate: item.startDate ? item.startDate.split('T')[0] : '',
        endDate: item.endDate ? item.endDate.split('T')[0] : ''
      });
    } else {
      setFormData(item);
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: string, collection: string) => {
    if (!confirm(t.confirmDelete)) return;
    
    let endpoint = '';
    if (collection === 'reservas') endpoint = `/api/reservations/${id}`;
    if (collection === 'espacios') endpoint = `/api/spaces/${id}`;
    if (collection === 'usuarios') endpoint = `/api/users/${id}`;

    await fetch(endpoint, { method: 'DELETE' });
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let endpoint = '';
    let method = modalType === 'create' ? 'POST' : 'PUT';

    if (targetCollection === 'reservas') {
      endpoint = modalType === 'create' ? '/api/reservations' : `/api/reservations/${currentItem.id}`;
      if (modalType === 'edit') method = 'PATCH'; 
    }
    if (targetCollection === 'espacios') {
      endpoint = modalType === 'create' ? '/api/spaces' : `/api/spaces/${currentItem.id}`;
    }
    if (targetCollection === 'usuarios') {
      endpoint = modalType === 'create' ? '/api/users' : `/api/users/${currentItem.id}`;
    }

    // Pequeño ajuste para reservas manuales
    const payload = { ...formData };
    if (targetCollection === 'reservas' && !payload.userEmail && modalType === 'create') {
        payload.userEmail = "admin@manual.com"; 
    }

    try {
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Error en la operación");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest">{t.loading}</div>;

  return (
    <div className={`min-h-screen transition-all duration-500 ${getThemeClasses()} p-4 md:p-10 font-sans`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">{appName}</h1>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{t.adminPanel}</p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Selector Idioma */}
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="font-bold text-xs bg-black/10 px-3 py-1 rounded-lg hover:bg-black/20 transition-all">
              {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
            
            {/* Selector Tema */}
            <div className="flex bg-black/5 p-1 rounded-xl">
              <button onClick={() => setTheme('light')} className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white shadow-md scale-110' : 'hover:bg-black/10'}`}>☀️</button>
              <button onClick={() => setTheme('dark')} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-md scale-110' : 'hover:bg-black/10'}`}>🌑</button>
              <button onClick={() => setTheme('colorful')} className={`p-2 rounded-lg transition-all ${theme === 'colorful' ? 'bg-white/30 shadow-md scale-110' : 'hover:bg-black/10'}`}>🌈</button>
            </div>
          </div>
        </header>

        {/* --- TABS (CORREGIDO) --- */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['reservas', 'espacios', 'usuarios', 'settings'].map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 ${
                tab === tb 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : `bg-black/5 hover:bg-black/10 ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`
              }`}
            >
              {/* Aquí usamos tb como clave para buscar en el diccionario t */}
              {t[tb]} 
            </button>
          ))}
        </div>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="space-y-6">
          
          {/* BOTÓN CREAR (No visible en Settings) */}
          {tab !== 'settings' && (
            <div className="flex justify-end">
              <button 
                onClick={() => handleCreate(tab)} 
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-lg hover:bg-green-600 transition-all hover:-translate-y-1 active:scale-95"
              >
                + {t.create}
              </button>
            </div>
          )}

          {/* VISTA: RESERVAS */}
          {tab === 'reservas' && (
            <div className="grid gap-4">
              {reservations.length === 0 && <p className="text-center opacity-50 font-bold py-10">{t.noData}</p>}
              {reservations.map((res: any) => (
                <div key={res.id} className={`${getCardClasses()} p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-xl transition-all`}>
                  <div className="flex-1">
                    <h3 className="font-black text-xl">{res.userName || 'Usuario'}</h3>
                    <p className="opacity-60 text-xs font-bold uppercase tracking-wider">{res.userEmail}</p>
                    <div className="mt-3 flex gap-2">
                       <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">{res.space?.name}</span>
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' : res.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                         {res.status}
                       </span>
                    </div>
                    <p className="mt-3 text-xs font-bold flex items-center gap-2">
                      <span className="opacity-50">📅</span> {formatDate(res.startDate)} ➜ {formatDate(res.endDate)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(res, 'reservas')} className="bg-slate-100 text-slate-600 p-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm">✏️</button>
                    <button onClick={() => handleDelete(res.id, 'reservas')} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA: ESPACIOS (INVENTARIO) */}
          {tab === 'espacios' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((s: any) => (
                <div key={s.id} className={`${getCardClasses()} p-8 rounded-[2.5rem] border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative`}>
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="w-full h-40 object-cover rounded-2xl mb-5 shadow-sm" />
                  ) : (
                    <div className="w-full h-40 bg-black/5 rounded-2xl mb-5 flex items-center justify-center text-4xl opacity-20">🏢</div>
                  )}
                  
                  <h3 className="text-2xl font-black mb-2 leading-none">{s.name}</h3>
                  <p className="text-xs opacity-60 mb-5 line-clamp-2 leading-relaxed">{s.description || "Sin descripción"}</p>
                  
                  <div className="flex gap-2 mb-6">
                    <span className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-blue-200">${s.pricePerHour}/h</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold">👥 {s.capacity}</span>
                  </div>
                  
                  {s.equipment && (
                     <div className="mb-6 p-3 bg-black/5 rounded-xl text-[10px] font-bold opacity-70">
                        🔧 {s.equipment}
                     </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(s, 'espacios')} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase hover:bg-blue-600 transition-all shadow-lg">{t.edit}</button>
                    <button onClick={() => handleDelete(s.id, 'espacios')} className="px-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA: USUARIOS */}
          {tab === 'usuarios' && (
            <div className={`${getCardClasses()} rounded-[2.5rem] p-8 overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 text-[10px] uppercase font-black tracking-widest opacity-50">
                      <th className="pb-4 pl-2">Usuario</th>
                      <th className="pb-4">Rol</th>
                      <th className="pb-4">Reservas</th>
                      <th className="pb-4 text-right pr-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {users.map((u: any) => (
                      <tr key={u.id} className="group hover:bg-black/5 transition-colors">
                        <td className="py-4 pl-2">
                          <div className="font-bold text-sm">{u.name || 'Sin nombre'}</div>
                          <div className="text-[10px] opacity-60 font-mono">{u.email}</div>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${
                            u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
                            u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {u.role || 'USER'}
                          </span>
                        </td>
                        <td className="py-4 font-mono font-bold text-xs opacity-70 pl-4">{u.reservations?.length || 0}</td>
                        <td className="py-4 text-right pr-2 flex justify-end gap-2">
                          <button onClick={() => handleEdit(u, 'usuarios')} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-all">✏️</button>
                          <button onClick={() => handleDelete(u.id, 'usuarios')} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA: SETTINGS */}
          {tab === 'settings' && (
            <div className={`${getCardClasses()} p-10 rounded-[3rem] max-w-2xl mx-auto shadow-2xl`}>
              <h2 className="text-3xl font-black mb-8 italic">{t.settings}</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase opacity-50 ml-3">{t.systemName}</label>
                  <input value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full p-4 rounded-2xl bg-black/5 font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase opacity-50 ml-3">{t.logoUrl}</label>
                  <input placeholder="https://..." className="w-full p-4 rounded-2xl bg-black/5 font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all" />
                </div>
                
                <div className="bg-amber-50 text-amber-800 p-5 rounded-2xl text-xs font-bold border border-amber-100 flex gap-3 items-center">
                  <span className="text-2xl">⚠️</span>
                  <p>La persistencia de configuración global requiere implementar el endpoint del modelo SystemConfig en la base de datos.</p>
                </div>
                
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 hover:bg-blue-600 transition-all shadow-xl">
                  {t.save}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* --- MODAL UNIVERSAL --- */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className={`bg-white text-slate-900 p-8 md:p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border-t-[12px] ${targetCollection === 'usuarios' ? 'border-purple-500' : 'border-blue-500'}`}>
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tight leading-none">
                {modalType === 'create' ? t.create : t.edit} <br/>
                <span className={targetCollection === 'usuarios' ? 'text-purple-600' : 'text-blue-600'}>{targetCollection}</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* CAMPOS RESERVAS */}
                {targetCollection === 'reservas' && (
                  <>
                    <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 focus:border-blue-500 outline-none transition-all" type="email" placeholder="Email Usuario" required value={formData.userEmail || ''} onChange={e => setFormData({...formData, userEmail: e.target.value})} />
                    <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none" required value={formData.spaceId || ''} onChange={e => setFormData({...formData, spaceId: e.target.value})}>
                      <option value="">Selecciona Espacio</option>
                      {spaces.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Inicio</label>
                          <input className="w-full bg-slate-50 p-3 rounded-2xl font-bold border-2 border-slate-100" type="date" required value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Fin</label>
                          <input className="w-full bg-slate-50 p-3 rounded-2xl font-bold border-2 border-slate-100" type="date" required value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                       </div>
                    </div>
                    {modalType === 'edit' && (
                      <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="CANCELLED">Cancelada</option>
                      </select>
                    )}
                  </>
                )}

                {/* CAMPOS ESPACIOS */}
                {targetCollection === 'espacios' && (
                  <>
                    <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 focus:border-blue-500 outline-none transition-all" placeholder="Nombre del Salón" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <textarea className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none transition-all" placeholder="Descripción breve..." rows={2} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                    <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none text-xs" placeholder="URL Imagen (https://...)" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input className="bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none" type="number" placeholder="Capacidad (pax)" required value={formData.capacity || ''} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                      <input className="bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none" type="number" placeholder="Precio ($/h)" required value={formData.pricePerHour || ''} onChange={e => setFormData({...formData, pricePerHour: e.target.value})} />
                    </div>
                    <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none" placeholder="Equipamiento (separado por comas)" value={formData.equipment || ''} onChange={e => setFormData({...formData, equipment: e.target.value})} />
                  </>
                )}

                {/* CAMPOS USUARIOS */}
                {targetCollection === 'usuarios' && (
                  <>
                    <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 focus:border-purple-500 outline-none transition-all" placeholder="Nombre Completo" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none" type="email" placeholder="Correo Electrónico" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none" placeholder="Teléfono" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    
                    <div className="space-y-1 pt-2">
                        <label className="text-xs font-black uppercase text-slate-400 ml-3">Nivel de Acceso</label>
                        <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-purple-500" value={formData.role || 'USER'} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="USER">Usuario (Cliente)</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-colors">{t.cancel}</button>
                  <button type="submit" className={`flex-1 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-all hover:scale-105 ${targetCollection === 'usuarios' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{t.save}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}