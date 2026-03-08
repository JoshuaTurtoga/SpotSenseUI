import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Car, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Slot {
  id: number;
  label: string;
  status: 'available' | 'occupied' | 'reserved';
  type: 'standard' | 'priority';
}

interface SlotGridProps {
  slots: Slot[];
  onReserve?: (slotId: number) => void;
  isAdmin?: boolean;
  onToggleStatus?: (slotId: number, currentStatus: string) => void;
}

export default function SlotGrid({ slots, onReserve, isAdmin, onToggleStatus }: SlotGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md aspect-square transform hover:scale-105 ${
            slot.status === 'available'
              ? 'border-emerald-100 bg-emerald-50 hover:border-emerald-300'
              : slot.status === 'occupied'
              ? 'border-red-100 bg-red-50 hover:border-red-300'
              : 'border-amber-100 bg-amber-50 hover:border-amber-300'
          }`}
          onClick={(e) => {
            e.preventDefault(); // Prevent any parent link clicks
            if (isAdmin && onToggleStatus) {
              onToggleStatus(slot.id, slot.status);
            } else if (onReserve && slot.status === 'available') {
              onReserve(slot.id);
            }
          }}
        >
          <div className={`p-3 rounded-full ${
            slot.status === 'available' ? 'bg-emerald-100 text-emerald-600' :
            slot.status === 'occupied' ? 'bg-red-100 text-red-600' :
            'bg-amber-100 text-amber-600'
          }`}>
            <Car className="w-6 h-6" />
          </div>
          
          <div className="text-center">
            <h3 className="font-bold text-gray-900">{slot.label}</h3>
            <span className={`text-xs font-medium uppercase tracking-wider ${
              slot.status === 'available' ? 'text-emerald-700' :
              slot.status === 'occupied' ? 'text-red-700' :
              'text-amber-700'
            }`}>
              {slot.status}
            </span>
          </div>

          {slot.type === 'priority' && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" title="Priority Slot" />
          )}

          {isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5 transition-colors rounded-xl">
              <span className="sr-only">Toggle Status</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
