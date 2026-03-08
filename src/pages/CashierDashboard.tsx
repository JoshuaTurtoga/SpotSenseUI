import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SlotGrid from '../components/SlotGrid';
import { Ticket, DollarSign, Search, Printer } from 'lucide-react';

export default function CashierDashboard() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [ticketQuery, setTicketQuery] = useState('');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    const res = await fetch('/api/slots');
    setSlots(await res.json());
  };

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleIssueTicket = async (slotId: number) => {
    if (!window.confirm('Issue walk-in ticket for this slot?')) return;
    
    try {
      const res = await fetch('/api/cashier/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Ticket Issued!\nCode: ${data.ticketCode}`);
        fetchSlots();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error issuing ticket');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    
    setLoading(true);
    setCheckoutData(null);
    
    try {
      const res = await fetch('/api/cashier/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: ticketQuery }),
      });
      const data = await res.json();
      
      if (data.success) {
        setCheckoutData(data);
        fetchSlots();
        setTicketQuery('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'cashier') return <div className="p-10 text-center">Access Denied</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cashier Station</h1>
          <p className="text-gray-500 mt-1">Issue tickets and process payments</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Slot Selection */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Issue Ticket</h2>
          <p className="text-sm text-gray-500 mb-6">Select an available slot to issue a physical ticket for walk-in customers.</p>
          <SlotGrid slots={slots} onReserve={handleIssueTicket} />
        </div>

        {/* Right: Checkout */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Process Payment</h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Code</label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={ticketQuery}
                    onChange={(e) => setTicketQuery(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="ENTER CODE"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Calculate & Pay
              </button>
            </form>
          </div>

          {checkoutData && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payment Success</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium text-gray-900">{checkoutData.duration} hrs</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-100">
                  <span className="text-gray-500 font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-emerald-700">₱{checkoutData.fee.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={() => window.print()}
                className="mt-4 w-full bg-white border border-emerald-200 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
              >
                Print Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
