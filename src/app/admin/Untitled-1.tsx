import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const reservations = await prisma.reservation.findMany({
    include: { space: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Admin Management</h2>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Space</th>
              <th className="p-4">Date/Time</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id} className="border-t">
                <td className="p-4">{res.userName}</td>
                <td className="p-4">{res.space.name}</td>
                <td className="p-4">{res.date.toDateString()} ({res.startTime}-{res.endTime})</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {res.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                   {/* Add server actions here to update status */}
                   <button className="text-blue-600 hover:underline">Confirm</button>
                   <button className="text-red-600 hover:underline">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}e