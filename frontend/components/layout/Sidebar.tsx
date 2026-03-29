'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, activeNavItem, setActiveNavItem } =
    useDashboardStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative hidden h-full flex-shrink-0 flex-col overflow-hidden border-r border-[rgba(255,255,255,0.06)] bg-black/60 backdrop-blur-2xl lg:flex"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(100,71%,64%)] text-black font-bold text-sm">
          A
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap font-semibold tracking-tight text-white"
            >
              Amboras
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id} className="relative">
              {activeNavItem === item.id && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-[hsl(100,71%,64%,0.10)] border border-[hsl(100,71%,64%,0.20)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <motion.button
                whileHover={{ x: activeNavItem === item.id ? 0 : 3 }}
                transition={{ duration: 0.15 }}
                onClick={() => setActiveNavItem(item.id)}
                className="relative z-10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                style={{
                  color: activeNavItem === item.id
                    ? 'hsl(100,71%,64%)'
                    : 'rgba(255,255,255,0.55)',
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden whitespace-nowrap font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-white/30 transition-colors hover:text-white/60"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </motion.button>
      </div>
    </motion.aside>
  );
}
