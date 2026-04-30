import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { label: '訂單管理', path: '/admin/orders', icon: LayoutDashboard },
    { label: '菜單管理', path: '/admin/menu', icon: UtensilsCrossed },
  ];

  return (
    <div className="flex min-h-screen bg-warm-bg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-warm-muted/20 bg-warm-card p-6 flex flex-col">
        <div className="mb-10 px-2">
          <h1 className="text-3xl font-serif font-bold text-warm-accent">暖心後台</h1>
          <p className="text-xs text-warm-muted uppercase tracking-widest mt-1">Management Console</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-warm-accent text-white shadow-lg shadow-warm-accent/20" 
                    : "text-warm-ink hover:bg-warm-accent/10"
                )}
              >
                <Icon size={20} className={cn("transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="ml-auto"
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-warm-muted/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-warm-muted hover:text-warm-ink transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">返迴前台</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={location.pathname}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
