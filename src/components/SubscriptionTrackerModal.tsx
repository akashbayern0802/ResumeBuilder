import React, { useState, useEffect } from 'react';
import { X, Plus, CreditCard, Calendar, Store, DollarSign } from 'lucide-react';

interface Subscription {
  id: string;
  merchant: string;
  amount: string;
  paymentSource: string;
  frequency: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionTrackerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentSource, setPaymentSource] = useState('');
  const [frequency, setFrequency] = useState('Monthly');

  useEffect(() => {
    const saved = localStorage.getItem('MY_SUBSCRIPTIONS');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveSubscriptions = (subs: Subscription[]) => {
    setSubscriptions(subs);
    localStorage.setItem('MY_SUBSCRIPTIONS', JSON.stringify(subs));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount.trim()) return;

    const newSub: Subscription = {
      id: Date.now().toString(),
      merchant,
      amount,
      paymentSource,
      frequency
    };
    saveSubscriptions([...subscriptions, newSub]);
    
    // Reset fields
    setMerchant('');
    setAmount('');
    setPaymentSource('');
    setFrequency('Monthly');
  };

  const handleDelete = (id: string) => {
    saveSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] border border-slate-200 flex flex-col animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Subscription Tracker</h2>
              <p className="text-xs text-slate-500">Manage your monthly subscriptions and recurring payments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 overflow-y-auto flex-1 min-h-0 bg-slate-50/30">
          
          {/* Add Form */}
          <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Add New Subscription</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> Merchant
                </label>
                <input
                  type="text"
                  required
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  placeholder="e.g. Netflix, Spotify"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Amount
                </label>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 15.99"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Payment Source
                </label>
                <input
                  type="text"
                  value={paymentSource}
                  onChange={e => setPaymentSource(e.target.value)}
                  placeholder="e.g. Chase Visa, PayPal"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Frequency
                </label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Subscription
              </button>
            </div>
          </form>

          {/* Grid display */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">Your Subscriptions ({subscriptions.length})</h3>
            </div>
            
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No subscriptions added yet. Enter one above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="px-5 py-3">Merchant</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Payment Source</th>
                      <th className="px-5 py-3">Frequency</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{sub.merchant}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{sub.amount}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{sub.paymentSource || '-'}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {sub.frequency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
