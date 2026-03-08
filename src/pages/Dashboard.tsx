import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SlotGrid from '../components/SlotGrid';
import { motion } from 'motion/react';
import { Ticket, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Reservation {
  id: number;
  slot_label: string;
  start_time: string;
  ticket_code: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [slotsRes, resRes] = await Promise.all([
        fetch('/api/slots'),
        fetch(`/api/reservations/${user.id}`)
      ]);
      
      const slotsData = await slotsRes.json();
      const resData = await resRes.json();
      
      setSlots(slotsData);
      setReservations(resData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleReserve = async (slotId: number) => {
    if (!user) {
      alert('Please login to reserve a slot');
      return;
    }
    if (!window.confirm('Do you want to reserve this slot?')) return;

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, slotId }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`Reservation Successful! Ticket Code: ${data.ticketCode}`);
        fetchData();
      } else {
        alert(data.message || 'Reservation failed');
      }
    } catch (error) {
      alert('Error making reservation');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  const activeReservation = reservations.find(r => r.status === 'active');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        
        {activeReservation && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-4"
          >
            <div className="bg-white/20 p-2 rounded-lg">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Active Ticket</p>
              <p className="text-lg font-bold font-mono">{activeReservation.ticket_code}</p>
            </div>
            <div className="h-8 w-px bg-indigo-500 mx-2" />
            <div>
              <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Slot</p>
              <p className="text-lg font-bold">{activeReservation.slot_label}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{reservations.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Last Parked</p>
          <p className="text-lg font-medium text-gray-900 mt-2">
            {reservations.length > 0 ? format(new Date(reservations[0].start_time), 'MMM d, h:mm a') : 'Never'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Account Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <p className="text-lg font-medium text-gray-900">Active</p>
          </div>
        </div>
      </div>

      {/* Parking Grid */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Live Parking Status</h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">Reserved</span>
            </div>
          </div>
        </div>
        
        <SlotGrid slots={slots} onReserve={handleReserve} />
      </div>

      {/* Recent History */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Ticket</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.slice(0, 5).map((res) => (
                <tr key={res.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-mono font-medium">{res.ticket_code}</td>
                  <td className="px-4 py-3">{res.slot_label}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(res.start_time), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      res.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No reservations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
