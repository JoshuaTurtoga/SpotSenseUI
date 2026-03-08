import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SlotGrid from '../components/SlotGrid';
import { RefreshCw, Users, Car, Percent } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({ total: 0, occupied: 0, reserved: 0, available: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [slotsRes, statsRes] = await Promise.all([
        fetch('/api/slots'),
        fetch('/api/stats')
      ]);
      
      const slotsData = await slotsRes.json();
      const statsData = await statsRes.json();
      
      setSlots(slotsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (slotId: number, currentStatus: string) => {
    // Simulate Computer Vision detection: Toggle between Available and Occupied
    // If reserved, maybe we shouldn't toggle easily, but for demo let's allow admin to override
    const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
    
    try {
      await fetch(`/api/slots/${slotId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (!user || user.role !== 'admin') return <div className="p-10 text-center">Access Denied</div>;
  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
          <p className="text-gray-500 mt-1">Monitor and manage parking facility</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Slots</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(((stats.occupied + stats.reserved) / stats.total) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Computer Vision Simulation</h2>
          <p className="text-sm text-gray-500">Click on a slot to toggle its status (Simulate car entry/exit)</p>
        </div>
        
        <SlotGrid slots={slots} isAdmin={true} onToggleStatus={handleToggleStatus} />
      </div>
    </div>
  );
}

import { CheckCircle } from 'lucide-react';
