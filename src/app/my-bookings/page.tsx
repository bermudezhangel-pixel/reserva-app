"use client";
import { useState } from 'react';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);

  const buscar = async () => {
    const res = await fetch(`/api/user-bookings?email=${email}`);
    const data = await res.json();
    setBookings(data);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-2xl my-10 font-sans">
      <h2 className="text-2xl font-bold mb-6">Mis Reservas / My Bookings</h2>
      <div className="flex gap-2 mb-8">
        <input 
          type="email" 
          placeholder="Tu email" 
          className="flex-1 border p-3 rounded-lg"
          onChange={e => setEmail(e.target.value)} 
        />
        <button onClick={buscar} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">Buscar</button>
      </div>

      <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.id} className="border-l-4 border-blue-600 p-4 bg-slate-50 rounded-r-lg">
            <p className="font-bold text-slate-800">{b.space.name}</p>
            <p className="text-sm text-slate-500">{new Date(b.date).toLocaleDateString()} | {b.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}