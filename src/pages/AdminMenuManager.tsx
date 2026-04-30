import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MenuService } from '../lib/services';
import { Plus, Trash2, Edit2, X, Check, Utensils, Image as ImageIcon } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function AdminMenuManager() {
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: '',
    imageUrl: '',
    isAvailable: true
  });

  useEffect(() => {
    const unsub = MenuService.subscribeItems(setItems);
    return () => unsub();
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        description: item.description || '',
        category: item.category,
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: 0,
        description: '',
        category: '',
        imageUrl: '',
        isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'menuItems', editingItem.id), formData);
      } else {
        await addDoc(collection(db, 'menuItems'), formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('保存失敗');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個品項嗎？')) return;
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch (error) {
      alert('刪除失敗');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-warm-ink">菜單管理</h2>
          <p className="text-warm-muted italic serif">在這裡調整您的風味饗宴...</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-warm-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-warm-accent/20 hover:bg-warm-accent-hover transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          <span>新增品項</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-warm-card rounded-3xl p-8 shadow-sm border border-warm-muted/10 group flex flex-col">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <span className="text-[10px] uppercase tracking-tighter text-warm-muted border border-warm-muted/20 rounded-full px-2 py-0.5 mb-2 inline-block">
                    {item.category}
                  </span>
                  <h3 className="text-2xl font-bold text-warm-ink">{item.name}</h3>
               </div>
               <div className={cn("w-3 h-3 rounded-full shadow-sm", item.isAvailable ? "bg-green-400" : "bg-red-400")} title={item.isAvailable ? '供應中' : '缺貨中'} />
             </div>
             
             <p className="text-warm-accent font-bold text-xl mb-4">{formatCurrency(item.price)}</p>
             <p className="text-sm text-warm-muted mb-8 italic serif flex-1">{item.description}</p>
             
             <div className="flex gap-2 pt-6 border-t border-warm-muted/5">
               <button 
                onClick={() => handleOpenModal(item)}
                className="flex-1 py-3 bg-warm-bg text-warm-ink rounded-xl font-medium hover:bg-warm-muted/10 transition-colors flex items-center justify-center gap-2"
               >
                 <Edit2 size={16} />
                 <span>編輯</span>
               </button>
               <button 
                onClick={() => handleDelete(item.id)}
                className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
               >
                 <Trash2 size={18} />
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-warm-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-warm-card rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <h3 className="text-3xl font-serif font-bold text-warm-ink mb-8">{editingItem ? '編輯品項' : '新增品項'}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1 border-b border-warm-muted/20">
                    <label className="block text-[10px] uppercase tracking-widest text-warm-muted mb-1">名稱</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-transparent border-none py-2 focus:ring-0 text-lg font-medium"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 border-b border-warm-muted/20">
                    <label className="block text-[10px] uppercase tracking-widest text-warm-muted mb-1">價格</label>
                    <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-transparent border-none py-2 focus:ring-0 text-lg font-medium"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 border-b border-warm-muted/20">
                    <label className="block text-[10px] uppercase tracking-widest text-warm-muted mb-1">分類</label>
                    <input 
                      required
                      type="text" 
                      placeholder="例: 主食, 飲料"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-transparent border-none py-2 focus:ring-0 text-lg font-medium"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 border-b border-warm-muted/20">
                    <label className="block text-[10px] uppercase tracking-widest text-warm-muted mb-1">狀態</label>
                    <div className="flex items-center gap-2 py-2">
                      <input 
                        type="checkbox" 
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                        className="w-5 h-5 rounded border-warm-muted/20 text-warm-accent focus:ring-warm-accent"
                      />
                      <span className="text-sm text-warm-ink">供應中</span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-warm-muted/20">
                  <label className="block text-[10px] uppercase tracking-widest text-warm-muted mb-1">描述</label>
                  <textarea 
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-transparent border-none py-2 focus:ring-0 text-sm serif italic"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-warm-bg text-warm-ink rounded-2xl font-bold hover:bg-warm-muted/10 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-warm-accent text-white rounded-2xl font-bold shadow-lg shadow-warm-accent/20 hover:bg-warm-accent-hover transition-all"
                  >
                    保存
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
