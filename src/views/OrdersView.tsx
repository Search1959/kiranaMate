import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Share2,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Receipt,
  MessageSquare
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings, LanguageCode } from '../types';
import { api } from '../lib/api';
import { getWhatsAppWebLink, getSmsLink, generateOrderStatusWhatsAppText } from '../lib/whatsapp';

interface OrdersViewProps {
  orders: Order[];
  settings: StoreSettings;
  lang: LanguageCode;
  onRefreshData: () => void;
  onOpenNewOrder: () => void;
  onOpenInvoicePrint: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  settings,
  lang,
  onRefreshData,
  onOpenNewOrder,
  onOpenInvoicePrint
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search.trim() || (
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerMobile && o.customerMobile.includes(search))
    );
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" /> Customer Delivery Orders
          </h2>
          <p className="text-xs text-slate-500">
            Manage WhatsApp & phone delivery orders
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create New Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or customer name..."
            className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'NEW', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  #{order.orderNumber}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {order.customerName} {order.customerMobile ? `(+91 ${order.customerMobile})` : ''}
                </span>
                <p className="text-[10px] text-slate-400">
                  {(order.createdAt ? new Date(order.createdAt) : new Date()).toLocaleString('en-IN')} • Address: {(order as any).deliveryAddress || 'Store Pickup'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-slate-900 block">₹{(order.total ?? 0).toLocaleString('en-IN')}</span>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-xl border focus:outline-none ${
                    order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    order.orderStatus === 'OUT_FOR_DELIVERY' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="READY">READY</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-1 first:pt-0 last:pb-0 flex justify-between">
                  <span>{item.quantity}x {item.productName}</span>
                  <span className="font-bold text-slate-800">₹{item.total}</span>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={() => onOpenInvoicePrint(order)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-600" /> Print Order Slip
              </button>

              {order.customerMobile && (
                <div className="flex gap-1.5">
                  <a
                    href={getWhatsAppWebLink(order.customerMobile, generateOrderStatusWhatsAppText(order, settings, lang))}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] shadow-xs"
                    title="Send WhatsApp Order Update"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a
                    href={getSmsLink(order.customerMobile, generateOrderStatusWhatsAppText(order, settings, lang))}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] shadow-xs"
                    title="Send SMS Text Order Update"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> SMS
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
