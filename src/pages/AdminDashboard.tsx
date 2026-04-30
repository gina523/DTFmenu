import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, AlertCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { OrderService } from '../lib/services';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = OrderService.subscribeOrders(setOrders);
    return () => unsub();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await OrderService.updateOrderStatus(id, status);
    } catch (error) {
      alert('更新失敗');
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    served: orders.filter(o => o.status === 'served').length,
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-warm-ink">當日訂單</h2>
          <p className="text-warm-muted italic serif">正在監控即時訂單流...</p>
        </div>
        <div className="flex gap-6">
          <StatBox label="待處理" value={stats.pending} color="text-amber-500" />
          <StatBox label="準備中" value={stats.preparing} color="text-warm-accent" />
          <StatBox label="已完結" value={stats.served} color="text-green-600" />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={order.id}
              className={cn(
                "bg-warm-card rounded-[32px] p-8 shadow-sm border-2 transition-colors",
                order.status === 'pending' ? "border-amber-100 bg-amber-50/10" : 
                order.status === 'preparing' ? "border-warm-accent/20 bg-warm-accent/5" : 
                "border-green-100"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-serif font-bold text-warm-ink flex items-center gap-2">
                    #{order.tableNumber}
                    <span className={cn(
                      "text-[10px] uppercase px-2 py-0.5 rounded-full border",
                      order.orderType === 'takeout' ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-blue-50 border-blue-200 text-blue-700"
                    )}>
                      {order.orderType === 'takeout' ? '外帶' : '內用'}
                    </span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-warm-muted uppercase tracking-widest mt-1">
                    <Clock size={12} />
                    {format(order.createdAt.toDate(), 'HH:mm', { locale: zhTW })}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-4 mb-8 min-h-[120px]">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1 border-l-2 border-warm-bg pl-3 py-1">
                    <div className="flex justify-between items-center text-warm-ink/80">
                      <div className="flex items-center gap-2">
                         <span className="w-5 h-5 flex items-center justify-center bg-warm-bg rounded-lg text-xs font-bold">{item.quantity}</span>
                         <span className="font-medium">{item.name}</span>
                         {item.size === 'Large' && <span className="text-[10px] bg-warm-accent/10 text-warm-accent px-1.5 rounded">大份</span>}
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    {item.itemNotes && (
                      <p className="text-[11px] text-warm-muted italic serif ml-7">
                        備註: {item.itemNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mb-4 p-3 bg-warm-bg/50 rounded-2xl border border-warm-muted/5">
                  <p className="text-[11px] uppercase tracking-widest text-warm-muted font-bold mb-1">整單備註</p>
                  <p className="text-xs text-warm-ink italic serif leading-relaxed">{order.notes}</p>
                </div>
              )}

              {order.hasPlasticBag && (
                <div className="mb-8 flex items-center gap-2 px-3 py-2 bg-warm-accent/5 rounded-xl border border-warm-accent/10">
                  <ShoppingBag size={14} className="text-warm-accent" />
                  <span className="text-xs font-bold text-warm-accent">顧客已加購塑膠袋 (+NT$5)</span>
                </div>
              )}

              <div className="pt-6 border-t border-warm-muted/10 flex justify-between items-center mb-8">
                <span className="text-warm-muted text-sm uppercase tracking-widest">總金額</span>
                <span className="text-2xl font-serif font-bold text-warm-accent">{formatCurrency(order.total)}</span>
              </div>

              <div className="flex gap-3">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                    className="flex-1 py-3 bg-warm-accent text-white rounded-2xl font-bold hover:bg-warm-accent-hover transition-colors shadow-lg shadow-warm-accent/20"
                  >
                    開始製作
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => handleStatusUpdate(order.id, 'served')}
                    className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                  >
                    完成出餐
                  </button>
                )}
                {order.status !== 'cancelled' && order.status !== 'served' && (
                  <button 
                    onClick={() => {
                       if(confirm('確定要取消訂單嗎？')) handleStatusUpdate(order.id, 'cancelled');
                    }}
                    className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                {order.status === 'served' && (
                  <div className="flex-1 flex items-center justify-center gap-2 text-green-600 font-medium">
                    <CheckCircle2 size={18} />
                    <span>已完成服務</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-40 flex flex-col items-center">
          <ShoppingBag size={80} className="text-warm-muted/10 mb-6" />
          <p className="text-xl text-warm-muted serif italic">目前沒有任何訂單滴答滴答...</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-warm-card rounded-3xl p-4 px-6 shadow-sm border border-warm-muted/10 flex flex-col items-center">
      <span className="text-xs text-warm-muted uppercase tracking-widest mb-1">{label}</span>
      <span className={cn("text-3xl font-serif font-bold", color)}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { label: '待處理', class: 'bg-amber-100 text-amber-700' },
    preparing: { label: '製作中', class: 'bg-warm-accent/10 text-warm-accent' },
    served: { label: '已送達', class: 'bg-green-100 text-green-700' },
    cancelled: { label: '已取消', class: 'bg-red-100 text-red-700' },
  };

  const config = configs[status] || { label: status, class: 'bg-gray-100' };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider", config.class)}>
      {config.label}
    </span>
  );
}
