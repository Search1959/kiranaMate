import React, { useState } from 'react';
import { Store, UserCheck, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { User, StoreSettings } from '../types';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
  settings: StoreSettings;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLogin,
  settings
}) => {
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);
  const [pin, setPin] = useState('1234');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-amber-300 flex items-center justify-center mx-auto shadow-lg">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{settings.storeName}</h1>
          <p className="text-xs text-slate-500 font-medium">Kirana Store Management & Business Tracker</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Select User / Role</label>
            <div className="space-y-2">
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    selectedUser.id === u.id
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">{u.role} Access</p>
                    </div>
                  </div>
                  {selectedUser.id === u.id && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Enter 4-Digit Security PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-center font-mono text-lg tracking-widest font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">Default Demo PIN: 1234</p>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <span>LOGIN TO KIRANAMATE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
