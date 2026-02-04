"use client";
import { useState, useEffect } from 'react';

export default function ReservePage() {
  const [spaces, setSpaces] = useState([]);
  const [formData, setFormData] = useState({
    spaceId: '', date: '', startTime: '', endTime: '', userName: '', userEmail: '', userPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (res.ok) alert("Reservation pending!");
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl my-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Book a Space</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" placeholder="Your Name" className="border p-3 rounded" 
          onChange={e => setFormData({...formData, userName: e.target.value})} required />
        <input type="email" placeholder="Email Address" className="border p-3 rounded" 
          onChange={e => setFormData({...formData, userEmail: e.target.value})} required />
        <input type="date" className="border p-3 rounded" 
          onChange={e => setFormData({...formData, date: e.target.value})} required />
        <div className="flex gap-2">
          <input type="time" className="border p-3 w-full rounded" 
            onChange={e => setFormData({...formData, startTime: e.target.value})} required />
          <input type="time" className="border p-3 w-full rounded" 
            onChange={e => setFormData({...formData, endTime: e.target.value})} required />
        </div>
        <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Request Reservation
        </button>
      </form>
    </div>
  );
}