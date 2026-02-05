"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Router para redireccionar
import { useTheme } from '@/context/ThemeContext';
import PageTransition from '@/components/PageTransition';
import ImageUploader from '@/components/ImageUploader';
import BackButton from '@/components/BackButton';

export default function AdminDashboard() {
  const { 
    theme, changeTheme, lang, changeLang, 
    logo, updateLogo, 
    appTitle, appSubtitle, updateAppTexts,
    customPalettes, updatePaletteColor, 
    t 
  } = useTheme();

  const router = useRouter(); // Hook de navegación
  const [authorized, setAuthorized] = useState(false); // Estado de seguridad

  const [tab, setTab] = useState('reservas');
  
  // Datos CRUD
  const [spaces, setSpaces] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // UI States
  const [modalOpen, setModalOpen] = useState(false);
  const [targetCollection, setTargetCollection] = useState('espacios');
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // --- CAPA DE SEGURIDAD ---
  useEffect(() => {
    const checkAuth = async () => {
      const adminEmail = localStorage.getItem('adminEmail');
      
      if (!adminEmail) {
        router.push('/admin/login');
        return;
      }

      // Doble verificación: Consultamos a la API si el usuario sigue siendo admin
      try {
        const res = await fetch(`/api/user/profile?email=${adminEmail}`);
        const user = await res.json();
        
        if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
          setAuthorized(true);
          fetchData(); // Solo cargamos datos si está autorizado
        } else {
          localStorage.removeItem('adminEmail'); // Token inválido
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  // FETCH DATA
  const fetchData = async () => {
    try {
      const [r, s, u] = await Promise.all([
        fetch('/api/reservations').then(res => res.json()),
        fetch('/api/spaces').then(res => res.json()),
        fetch('/api/users').then(res => res.json())
      ]);
      setReservations(Array.isArray(r) ? r : []); 
      setSpaces(Array.isArray(s) ? s : []); 
      setUsers(Array.isArray(u) ? u : []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  // HANDLERS
  const handleEdit = (item: any, collection: string) => { setTargetCollection(collection); setFormData(item); setModalOpen(true); };
  const handleCreate = (collection: string) => { setTargetCollection(collection); setFormData({}); setModalOpen(true); };
  
  const handleDelete = async (id: string, collection: string) => {
    if(!confirm(t.delete + "?")) return;
    const endpoint = collection === 'reservas' ? 'reservations' : collection;
    await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = targetCollection === 'reservas' ? 'reservations' : targetCollection;
    const url = formData.id ? `/api/${endpoint}/${formData.id}` : `/api/${endpoint}`;
    const method = formData.id ? 'PUT' : 'POST';
    
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setModalOpen(false);
    fetchData();
  };

  // ESTILOS DINÁMICOS
  const glassClass = "backdrop-blur-xl border border-current/10 shadow-xl transition-all duration-300";
  const inputClass = "w-full p-3 rounded-xl bg-current/5 border border-current/10 font-bold outline-none focus:bg-current/10 transition-colors placeholder:opacity-40";

  // Si no está autorizado o está cargando, mostramos pantalla de carga
  if (!authorized || loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest">{t.loading}...</div>;

  return (
    <PageTransition>
      <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
        {/* BOTÓN VOLVER al perfil (o salir) */}
        <BackButton route="/profile" />
        
        {/* --- HEADER --- */}
        <header className="flex flex-col xl:flex-row justify-between items-center mb-12 pl-0 md:pl-20 gap-8 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
             {logo ? (
               <img src={logo} alt="Logo" className="h-20 w-auto object-contain drop-shadow-lg" />
             ) : (
               <div className="h-20 w-20 bg-current/10 rounded-2xl flex items-center justify-center text-4xl">💎</div>
             )}
             <div>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">{appTitle}</h1>
                <p className="text-xs font-bold opacity-60 uppercase tracking-[0.3em] mt-1">{appSubtitle}</p>
             </div>
          </div>
          
          <div className="flex flex-col items-center xl:items-end gap-4">
             <div className="flex gap-2">
                {/* Selector Idioma */}
                <div className="flex bg-current/5 p-1.5 rounded-2xl gap-1">
                    {(['es', 'en'] as const).map(l => (
                    <button key={l} onClick={() => changeLang(l)} 
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${lang === l ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'opacity-50 hover:opacity-100'}`}>
                        {l.toUpperCase()}
                    </button>
                    ))}
                </div>
                {/* BOTÓN LOGOUT */}
                <button onClick={handleLogout} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-2xl text-xs font-black uppercase hover:bg-red-500 hover:text-white transition-all">
                    Salir 🔒
                </button>
             </div>

             {/* Navegación Tabs */}
             <div className="flex flex-wrap justify-center gap-2">
                {['reservas', 'espacios', 'usuarios', 'design'].map(tb => (
                  <button key={tb} onClick={() => setTab(tb)}
                    className={`px-5 py-3 rounded-2xl font-bold uppercase text-[10px] md:text-xs transition-all border border-transparent ${
                      tab === tb ? 'bg-[var(--color-primary)] text-white shadow-lg scale-105' : 'bg-current/5 hover:bg-current/10 hover:scale-105'
                    }`}>
                    {t[tb] || tb}
                  </button>
                ))}
             </div>
          </div>
        </header>

        {/* --- PESTAÑA DISEÑO --- */}
        {tab === 'design' && (
          <div className={`p-8 md:p-12 rounded-[3rem] ${glassClass} space-y-12 animate-in fade-in zoom-in-95`}>
            
            {/* 1. IDENTIDAD */}
            <section className="grid md:grid-cols-2 gap-8">
               <div className="p-8 rounded-3xl bg-current/5 border border-current/5">
                  <h2 className="text-xl font-black uppercase mb-2 flex items-center gap-2">🖼️ {t.appIdentity}</h2>
                  <p className="text-xs opacity-60 mb-6">{t.logoDesc}</p>
                  <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 p-2">
                          {logo && <img src={logo} className="w-full h-full object-contain" />}
                      </div>
                      <div className="flex-1">
                          <ImageUploader existingImages={[]} onImagesChange={(imgs: string[]) => imgs.length > 0 && updateLogo(imgs[0])} />
                      </div>
                  </div>
               </div>

               <div className="p-8 rounded-3xl bg-current/5 border border-current/5">
                  <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">📝 {t.titles}</h2>
                  <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase opacity-50 ml-2">{t.titleLabel}</label>
                        <input className={inputClass} value={appTitle} onChange={(e) => updateAppTexts(e.target.value, appSubtitle)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase opacity-50 ml-2">{t.subtitleLabel}</label>
                        <input className={inputClass} value={appSubtitle} onChange={(e) => updateAppTexts(appTitle, e.target.value)} />
                      </div>
                  </div>
               </div>
            </section>

            <hr className="border-current/10" />

            {/* 2. TEMAS Y COLORES */}
            <section>
                <h2 className="text-3xl font-black uppercase mb-8 text-center">🎨 {t.design} & Themes</h2>
                <div className="grid lg:grid-cols-3 gap-6">
                {(['light', 'dark', 'colorful'] as const).map((tName) => (
                    <div key={tName} className={`relative p-8 rounded-[2rem] transition-all duration-500 overflow-hidden group ${
                        theme === tName ? 'ring-4 ring-[var(--color-primary)] scale-105 shadow-2xl bg-current/5' : 'bg-current/5 opacity-70 hover:opacity-100 hover:scale-[1.02]'
                    }`}>
                        {theme === tName && <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-white text-[9px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">{t.active}</div>}
                        
                        <h3 className="font-black uppercase text-2xl mb-6">{tName}</h3>
                        
                        <div className="space-y-4 relative z-10">
                            {[
                              { key: 'primary', label: t.primaryColor },
                              { key: 'background', label: t.bgColor },
                              { key: 'card', label: t.cardColor },
                              { key: 'text', label: t.textColor }
                            ].map((col) => (
                              <div key={col.key} className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 rounded-xl">
                                  <input type="color" 
                                    value={customPalettes[tName][col.key as keyof typeof customPalettes['light']]} 
                                    onChange={(e) => updatePaletteColor(tName, col.key as any, e.target.value)} 
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                                  <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase opacity-50 leading-none">{col.label}</p>
                                    <p className="text-[10px] font-mono opacity-80">{customPalettes[tName][col.key as keyof typeof customPalettes['light']]}</p>
                                  </div>
                              </div>
                            ))}
                        </div>

                        <button onClick={() => changeTheme(tName)} className={`w-full mt-8 py-4 rounded-xl font-black uppercase text-xs transition-all shadow-lg ${
                            theme === tName ? 'bg-green-500 text-white cursor-default' : 'bg-slate-900 text-white hover:bg-[var(--color-primary)]'
                        }`}>
                            {theme === tName ? '✓ ' + t.active : t.activate}
                        </button>
                    </div>
                ))}
                </div>
            </section>
          </div>
        )}

        {/* --- PESTAÑA INVENTARIO --- */}
        {tab === 'espacios' && (
            <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-center">
                   <h2 className="text-3xl font-black uppercase italic">{t.inventory}</h2>
                   <button onClick={() => handleCreate('espacios')} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:brightness-110 transition-all">+ {t.create}</button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {spaces.map(s => (
                        <div key={s.id} className={`p-6 rounded-[2.5rem] ${glassClass} group hover:-translate-y-2`}>
                             <div className="h-48 bg-current/5 rounded-2xl mb-5 overflow-hidden relative">
                                {s.images?.[0] ? <img src={s.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="flex items-center justify-center h-full text-4xl opacity-20">🏢</div>}
                                <div className="absolute top-3 right-3 bg-white/90 text-black px-3 py-1 rounded-lg text-xs font-black shadow-sm">${s.pricePerHour}/h</div>
                             </div>
                             <h3 className="font-black text-2xl leading-none mb-2">{s.name}</h3>
                             <div className="flex gap-2 mb-6">
                               <span className="text-[10px] font-black bg-current/5 px-2 py-1 rounded uppercase opacity-60">👥 {s.capacity} Pax</span>
                             </div>
                             <div className="flex gap-3">
                                <button onClick={() => handleEdit(s, 'espacios')} className="flex-1 bg-current/5 py-3 rounded-xl text-xs font-black uppercase hover:bg-current/10">{t.edit}</button>
                                <button onClick={() => handleDelete(s.id, 'espacios')} className="px-5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- PESTAÑA USUARIOS --- */}
        {tab === 'usuarios' && (
             <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-center">
                   <h2 className="text-3xl font-black uppercase italic">{t.users}</h2>
                   <button onClick={() => handleCreate('usuarios')} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:brightness-110 transition-all">+ {t.create}</button>
                </div>
                <div className={`p-8 rounded-[2.5rem] ${glassClass}`}>
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-[10px] uppercase opacity-40 border-b border-current/10"><th className="pb-4 pl-4">{t.name}</th><th className="pb-4">{t.role}</th><th className="pb-4 text-right pr-4">Action</th></tr>
                       </thead>
                       <tbody className="divide-y divide-current/5">
                        {users.map(u => (
                            <tr key={u.id} className="group hover:bg-current/5 transition-colors">
                                <td className="py-4 pl-4"><p className="font-bold">{u.name}</p><p className="text-[10px] opacity-50 font-mono">{u.email}</p></td>
                                <td className="py-4"><span className="text-[9px] font-black bg-current/10 px-2 py-1 rounded uppercase">{u.role}</span></td>
                                <td className="py-4 text-right pr-4 gap-2 flex justify-end">
                                    <button onClick={() => handleEdit(u, 'usuarios')} className="text-xs font-black opacity-40 hover:opacity-100 hover:text-[var(--color-primary)]">✏️</button>
                                    <button onClick={() => handleDelete(u.id, 'usuarios')} className="text-xs font-black opacity-40 hover:opacity-100 hover:text-red-500">❌</button>
                                </td>
                            </tr>
                        ))}
                       </tbody>
                    </table>
                </div>
             </div>
        )}

        {/* --- PESTAÑA RESERVAS --- */}
        {tab === 'reservas' && (
             <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-center">
                   <h2 className="text-3xl font-black uppercase italic">{t.reservations}</h2>
                   <button onClick={() => handleCreate('reservas')} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:brightness-110 transition-all">+ {t.create}</button>
                </div>
                <div className="grid gap-4">
                    {reservations.map(res => (
                        <div key={res.id} className={`p-6 rounded-[2rem] ${glassClass} flex flex-col md:flex-row justify-between items-center gap-4 hover:border-current/20`}>
                            <div className="flex-1">
                                <h3 className="font-black text-xl">{res.userName || 'Unknown'}</h3>
                                <p className="text-xs font-bold opacity-60 mb-2">{res.space?.name}</p>
                                <div className="flex gap-2">
                                   <span className="bg-current/5 text-[10px] font-black px-2 py-1 rounded uppercase">{new Date(res.startDate).toLocaleDateString()}</span>
                                   <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${res.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>{res.status}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(res, 'reservas')} className="bg-current/5 px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-current/10 transition-colors">{t.edit}</button>
                                <button onClick={() => handleDelete(res.id, 'reservas')} className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* --- MODAL --- */}
        {modalOpen && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
              <div className={`p-8 md:p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border-t-8 border-[var(--color-primary)] bg-[var(--bg-card)] text-[var(--text-main)]`}>
                 <h2 className="text-3xl font-black uppercase mb-8">{formData.id ? t.edit : t.create} <span className="text-[var(--color-primary)]">{targetCollection}</span></h2>
                 <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {targetCollection === 'espacios' && (
                        <>
                           <input placeholder={t.name} className={inputClass} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                           <textarea placeholder={t.desc} className={inputClass} rows={2} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                           <div className="grid grid-cols-2 gap-4">
                               <input type="number" placeholder={t.cap} className={inputClass} value={formData.capacity || ''} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                               <input type="number" placeholder={t.price} className={inputClass} value={formData.pricePerHour || ''} onChange={e => setFormData({...formData, pricePerHour: e.target.value})} />
                           </div>
                           <div className="bg-current/5 p-4 rounded-2xl">
                              <label className="text-[10px] font-black uppercase opacity-50 block mb-3">Fotos</label>
                              <ImageUploader existingImages={formData.images || []} onImagesChange={(imgs: string[]) => setFormData({...formData, images: imgs})} />
                           </div>
                           <input placeholder={t.equip} className={inputClass} value={formData.equipment || ''} onChange={e => setFormData({...formData, equipment: e.target.value})} />
                        </>
                    )}
                    
                    {targetCollection === 'usuarios' && (
                        <>
                           <input placeholder={t.name} className={inputClass} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                           <input type="email" placeholder={t.email} className={inputClass} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                           <input placeholder={t.phone} className={inputClass} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                           <select className={inputClass} value={formData.role || 'USER'} onChange={e => setFormData({...formData, role: e.target.value})}>
                               <option value="USER">USER</option><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option>
                           </select>
                        </>
                    )}

                    {targetCollection === 'reservas' && (
                        <>
                           <input type="email" placeholder={t.email} className={inputClass} value={formData.userEmail || ''} onChange={e => setFormData({...formData, userEmail: e.target.value})} />
                           <select className={inputClass} value={formData.spaceId || ''} onChange={e => setFormData({...formData, spaceId: e.target.value})}>
                               <option value="">Select Space</option>
                               {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                           <div className="grid grid-cols-2 gap-4">
                               <input type="date" className={inputClass} value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                               <input type="date" className={inputClass} value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                           </div>
                           <select className={inputClass} value={formData.status || 'PENDING'} onChange={e => setFormData({...formData, status: e.target.value})}>
                               <option value="PENDING">PENDING</option><option value="CONFIRMED">CONFIRMED</option><option value="CANCELLED">CANCELLED</option>
                           </select>
                        </>
                    )}

                    <div className="flex gap-3 pt-6">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-xs bg-current/5 hover:bg-current/10 transition-colors">{t.cancel}</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl font-black uppercase text-xs text-white shadow-xl hover:brightness-110 transition-all" style={{backgroundColor: 'var(--color-primary)'}}>{t.save}</button>
                    </div>
                 </form>
              </div>
           </div>
        )}
      </div>
    </PageTransition>
  );
}