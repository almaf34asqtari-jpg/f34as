import React, { useEffect, useState } from 'react';
import { Bell, X, Tag, CreditCard, Star, MessageSquare } from 'lucide-react';
import { PushNotification } from '../types/marketplace';

interface NotificationToastProps {
  notifications: PushNotification[];
  onOpenNotification: (notif: PushNotification) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onOpenNotification,
}) => {
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (!latest.read) {
        setActiveToast(latest);
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 5500);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        onClick={() => {
          onOpenNotification(activeToast);
          setActiveToast(null);
        }}
        className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3.5 cursor-pointer hover:bg-slate-800/95 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          {activeToast.type === 'discount_request' ? (
            <Tag className="w-4 h-4 text-emerald-400" />
          ) : activeToast.type === 'payment_escrow' ? (
            <CreditCard className="w-4 h-4 text-emerald-400" />
          ) : activeToast.type === 'review_received' ? (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <Bell className="w-4 h-4 text-emerald-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
              {activeToast.title}
            </p>
            <span className="text-[10px] text-slate-400">{activeToast.createdAt}</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {activeToast.body}
          </p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1.5 inline-block">
            Click to view & negotiate ➔
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveToast(null);
          }}
          className="text-slate-500 hover:text-slate-300 p-1"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
