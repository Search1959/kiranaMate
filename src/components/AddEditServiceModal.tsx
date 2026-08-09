import React, { useState, useEffect } from 'react';
import { X, Wrench, Check, RefreshCw, Star } from 'lucide-react';
import { ServiceItem } from '../types';
import { serviceStore } from '../lib/serviceStore';
import { getServiceSectorConfig } from '../lib/serviceSectorConfig';

interface AddEditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pass an existing service to edit it; omit/undefined to add a new one. */
  editingService?: ServiceItem | null;
}

export const AddEditServiceModal: React.FC<AddEditServiceModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editingService
}) => {
  const cfg = getServiceSectorConfig(serviceStore.getActiveSector());
  const isEditing = !!editingService;

  const [name, setName] = useState('');
  const [category, setCategory] = useState(cfg.categories[0] || 'General');
  const [price, setPrice] = useState<number | ''>('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(30);
  const [gstPercent, setGstPercent] = useState<number | ''>(18);
  const [description, setDescription] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingService) {
      setName(editingService.name);
      setCategory(editingService.category);
      setPrice(editingService.price);
      setDurationMinutes(editingService.durationMinutes);
      setGstPercent(editingService.gstPercent ?? 18);
      setDescription(editingService.description || '');
      setIsPopular(!!editingService.isPopular);
    } else {
      setName('');
      setCategory(cfg.categories[0] || 'General');
      setPrice('');
      setDurationMinutes(30);
      setGstPercent(18);
      setDescription('');
      setIsPopular(false);
    }
  }, [isOpen, editingService]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter the service name!');
      return;
    }
    if (!price || Number(price) <= 0) {
      alert('Please enter a valid price!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        price: Number(price),
        durationMinutes: Number(durationMinutes) || 30,
        gstPercent: Number(gstPercent) || 0,
        description: description.trim() || undefined,
        isPopular
      };

      if (isEditing && editingService) {
        serviceStore.updateService(editingService.id, payload);
      } else {
        serviceStore.addService(payload);
      }

      onSaved();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-200 border border-white/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <span>{isEditing ? 'Edit Service' : 'Add New Service'}</span>
              </h2>
              <p className="text-xs text-blue-100/80">{cfg.name} • shows up in Service POS Billing catalog</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-blue-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs text-white">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Service Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. AC Gas Refill, Hair Cut & Styling"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cfg.categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-2 rounded-xl border font-bold text-left truncate transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 ring-2 ring-blue-500/40'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 space-y-2">
            <label className="font-bold text-slate-200 block">Price (₹) *</label>
            <input
              type="number"
              min="1"
              value={price}
              onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter price e.g. 800"
              className="w-full bg-slate-800 border border-blue-500/30 rounded-xl px-4 py-2.5 text-lg font-black text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="30"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-medium text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">GST %</label>
              <input
                type="number"
                min="0"
                max="28"
                value={gstPercent}
                onChange={e => setGstPercent(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="18"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-medium text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Description (shown on the POS card)</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Deep cleansing, exfoliation and hydration facial"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPopular}
              onChange={e => setIsPopular(e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-slate-600"
            />
            <span className="font-bold text-slate-200 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Mark as "Popular" (highlighted badge on the POS card)
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Add Service'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
