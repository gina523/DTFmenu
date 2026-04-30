import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, X, Check, Utensils } from 'lucide-react';
import { MenuService, OrderService } from '../lib/services';
import { cn, formatCurrency } from '../lib/utils';

export function CustomerMenu() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const unsub = MenuService.subscribeItems(setMenuItems);
    return () => unsub();
  }, []);

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.size === 'Standard');
      if (existing) {
        return prev.map(i => (i.id === item.id && i.size === 'Standard') ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, size: 'Standard', itemNotes: '' }];
    });
  };

  const updateCartItem = (index: number, updates: any) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item).filter(i => i.quantity > 0));
  };

  const [hasPlasticBag, setHasPlasticBag] = useState(false);

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.size === 'Large' ? item.price * 1.5 : item.price;
    return sum + price * item.quantity;
  }, 0) + (hasPlasticBag ? 5 : 0);

  const handleSubmitOrder = async () => {
    if (orderType === 'dine-in' && !tableNumber) return alert('請輸入桌號');
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      await OrderService.createOrder({
        tableNumber: orderType === 'takeout' ? '外帶' : tableNumber,
        orderType,
        notes: orderNotes,
        hasPlasticBag,
        items: cart.map(i => ({ 
          id: i.id, 
          name: i.name, 
          quantity: i.quantity, 
          price: i.size === 'Large' ? i.price * 1.5 : i.price,
          size: i.size,
          itemNotes: i.itemNotes
        })),
        total: cartTotal,
      });
      setCart([]);
      setOrderNotes('');
      setHasPlasticBag(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
      setIsCartOpen(false);
    } catch (error) {
      alert('下單失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-warm-bg/80 backdrop-blur-md border-b border-warm-muted/10 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-bold text-warm-ink">暖心食光</h1>
          <p className="text-xs text-warm-muted tracking-widest uppercase mt-0.5">Warm Dining Moments</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-3 bg-warm-accent text-white rounded-full shadow-lg shadow-warm-accent/30 hover:scale-105 transition-transform"
        >
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-warm-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-warm-accent">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-10">
        <div className="max-w-4xl mx-auto bg-warm-card rounded-[40px] p-8 shadow-sm border border-warm-muted/5 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-serif text-warm-ink mb-6">歡迎光臨，我們準備好為您服務了</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <label className="text-sm font-bold text-warm-muted uppercase tracking-widest block">用餐方式</label>
                <div className="flex p-1 bg-warm-bg rounded-2xl w-fit">
                  <button 
                    onClick={() => { setOrderType('dine-in'); setHasPlasticBag(false); }}
                    className={cn(
                      "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                      orderType === 'dine-in' ? "bg-white text-warm-accent shadow-sm" : "text-warm-muted"
                    )}
                  >
                    內用
                  </button>
                  <button 
                    onClick={() => setOrderType('takeout')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                      orderType === 'takeout' ? "bg-white text-warm-accent shadow-sm" : "text-warm-muted"
                    )}
                  >
                    外帶
                  </button>
                </div>
              </div>

              {orderType === 'dine-in' && (
                <div className="flex-1 space-y-4">
                  <label className="text-sm font-bold text-warm-muted uppercase tracking-widest block">您的桌號</label>
                  <input 
                    type="text" 
                    placeholder="例如: A1" 
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-warm-bg border-none rounded-2xl px-6 py-3 focus:ring-2 focus:ring-warm-accent transition-all text-warm-ink font-medium"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 pointer-events-none">
            <Utensils size={160} />
          </div>
        </div>
      </section>

      {/* Menu Sections */}
      <main className="max-w-4xl mx-auto px-6">
        {categories.length === 0 && (
          <div className="text-center py-20 bg-warm-card rounded-[40px]">
            <p className="text-warm-muted">菜單正在準備中...</p>
          </div>
        )}
        
        {categories.map((cat: any) => (
          <div key={cat} className="mb-12">
            <h3 className="text-2xl font-serif font-semibold text-warm-ink mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-warm-accent"></span>
              {cat}
              <span className="flex-1 h-px bg-warm-accent opacity-20"></span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems
                .filter(item => item.category === cat)
                .map(item => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="bg-warm-card rounded-3xl p-6 shadow-sm border border-warm-muted/5 flex flex-col group relative overflow-hidden"
                  >
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-warm-bg/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="text-warm-muted font-bold px-4 py-2 bg-white/80 rounded-full border border-warm-muted/20">暫不供應</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-xl text-warm-ink">{item.name}</h4>
                      <span className="text-warm-accent font-bold tracking-tighter text-2xl">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <p className="text-sm text-warm-muted italic serif mb-6 line-clamp-2">{item.description}</p>
                    <div className="mt-auto flex justify-end">
                      <button 
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium",
                          item.isAvailable 
                            ? "bg-warm-accent/10 text-warm-accent hover:bg-warm-accent hover:text-white" 
                            : "opacity-20 cursor-not-allowed"
                        )}
                      >
                        <Plus size={18} />
                        <span>加入購物車</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-warm-ink/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-warm-card z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-warm-muted/10 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-warm-ink">您的購物車</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-warm-muted hover:text-warm-ink">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {cart.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <Utensils size={64} className="text-warm-muted/20 mb-4" />
                    <p className="text-warm-muted italic serif">購物車還是空的哦</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="space-y-4 pb-6 border-b border-warm-muted/5 last:border-0 last:pb-0">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-warm-ink text-lg">{item.name}</h4>
                            <div className="flex gap-2 mt-2">
                              {['Standard', 'Large'].map((s) => (
                                <button 
                                  key={s}
                                  onClick={() => updateCartItem(idx, { size: s })}
                                  className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all border",
                                    item.size === s ? "bg-warm-accent border-warm-accent text-white" : "border-warm-muted/20 text-warm-muted"
                                  )}
                                >
                                  {s === 'Standard' ? '標準' : '大份'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-warm-accent font-bold text-lg">
                              {formatCurrency((item.size === 'Large' ? item.price * 1.5 : item.price) * item.quantity)}
                            </p>
                            <div className="flex items-center gap-3 bg-warm-bg rounded-xl p-1 mt-2 w-fit ml-auto">
                              <button onClick={() => updateCartItem(idx, { quantity: item.quantity - 1 })} className="p-1 text-warm-muted hover:text-warm-accent">
                                <Minus size={14} />
                              </button>
                              <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                              <button onClick={() => updateCartItem(idx, { quantity: item.quantity + 1 })} className="p-1 text-warm-muted hover:text-warm-accent">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <input 
                          type="text" 
                          placeholder="餐點備註 (如: 不要蔥...)" 
                          value={item.itemNotes}
                          onChange={(e) => updateCartItem(idx, { itemNotes: e.target.value })}
                          className="w-full bg-warm-bg/50 border-none rounded-xl px-4 py-2 text-xs text-warm-ink italic placeholder:text-warm-muted/40"
                        />
                      </div>
                    ))}

                    <div className="pt-6 border-t border-warm-muted/10 space-y-6">
                      {orderType === 'takeout' && (
                        <label className="flex items-center gap-3 p-4 bg-warm-accent/5 rounded-2xl border border-warm-accent/10 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={hasPlasticBag}
                            onChange={(e) => setHasPlasticBag(e.target.checked)}
                            className="w-5 h-5 rounded border-warm-muted/20 text-warm-accent focus:ring-warm-accent"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-bold text-warm-ink block">加購塑膠袋</span>
                            <span className="text-xs text-warm-muted italic serif">若需提袋請加購 (+ NT$5)</span>
                          </div>
                          <span className="font-bold text-warm-accent">+NT$5</span>
                        </label>
                      )}

                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-warm-muted font-bold block mb-2">整單備註</label>
                        <textarea 
                          placeholder="有什麼想告訴我們的嗎？" 
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="w-full bg-warm-bg border-none rounded-2xl px-4 py-3 text-sm italic serif focus:ring-1 focus:ring-warm-accent"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-warm-muted/10 bg-warm-bg/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-warm-muted">總金額</span>
                  <span className="text-3xl font-serif font-bold text-warm-accent">{formatCurrency(cartTotal)}</span>
                </div>
                <button 
                  disabled={cart.length === 0 || isSubmitting}
                  onClick={handleSubmitOrder}
                  className="w-full py-4 bg-warm-accent text-white rounded-2xl font-bold shadow-lg shadow-warm-accent/30 hover:bg-warm-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? '正在發送...' : '確認下單'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-warm-ink text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 border border-white/10"
          >
            <div className="bg-green-500 p-1 rounded-full"><Check size={16} /></div>
            <span className="font-medium">下單成功！廚房正在為您準備...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
