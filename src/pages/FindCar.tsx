import { useState } from 'react';
import { Search, MapPin, Ticket } from 'lucide-react';
import { motion } from 'motion/react';

export default function FindCar() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/find-car?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error searching for vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Find My Car</h1>
        <p className="text-gray-500 mt-2">Locate your vehicle using your Ticket ID or Slot Number</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Ticket ID (e.g., X7Y2) or Slot (e.g., A-1)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 border-t border-gray-100 pt-8"
          >
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Vehicle Found!</h3>
                  <p className="text-emerald-700 font-medium mt-1">Your car is parked at Slot {result.slot_label}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Ticket ID:</span>
                      <span className="ml-2 font-mono font-bold text-gray-900">{result.ticket_code}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Driver:</span>
                      <span className="ml-2 font-medium text-gray-900">{result.driver_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Entry Time:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(result.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium text-emerald-600 uppercase text-xs tracking-wider">Parked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
