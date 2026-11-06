import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Tag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertCircle,
  Lock,
  ArrowRight,
  ArrowLeft,
  Percent,
  AlertTriangle,
  Banknote,
  Phone,
  Sparkles,
} from 'lucide-react';
import {
  ChatThread,
  ChatMessage,
  UserProfile,
  NegotiationOffer,
  Listing,
} from '../types/marketplace';
import { formatOMR, calculateDiscountPercent } from '../utils/logic';
import {
  getStoredThreads,
  saveThreads,
  getStoredMessages,
  saveMessages,
  getStoredNotifications,
  saveNotifications,
  getStoredListings,
} from '../utils/storage';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  initialThreadId?: string;
  onProceedToPayment?: (listing: Listing, agreedPrice: number, discountAmount?: number) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialThreadId,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      return getStoredThreads();
    } catch {
      return [];
    }
  });
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      return getStoredMessages();
    } catch {
      return {};
    }
  });
  const [activeThreadId, setActiveThreadId] = useState<string>(
    initialThreadId || (threads[0]?.id || '')
  );
  const [inputText, setInputText] = useState('');
  const [counterPriceInput, setCounterPriceInput] = useState('');
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [dealConfirmedNotice, setDealConfirmedNotice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync when initialThreadId changes
  useEffect(() => {
    if (initialThreadId) {
      setActiveThreadId(initialThreadId);
    }
  }, [initialThreadId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesMap, activeThreadId, isOpen]);

  if (!isOpen || !currentUser) return null;

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const currentMessages = activeThread ? messagesMap[activeThread.id] || [] : [];
  const activeNegotiation = activeThread?.activeNegotiation;

  const isSeller = activeThread ? currentUser.id === activeThread.sellerId : false;
  const isBuyer = activeThread ? currentUser.id === activeThread.buyerId : false;

  // Send a regular human-to-human text message (No AI auto-reply)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId: activeThread.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...currentMessages, newMessage];
    const updatedMap = { ...messagesMap, [activeThread.id]: updatedMessages };
    setMessagesMap(updatedMap);
    saveMessages(updatedMap);

    const updatedThreads = threads.map((t) =>
      t.id === activeThread.id
        ? {
            ...t,
            lastMessage: newMessage.text,
            lastMessageTime: 'Just now',
          }
        : t
    );
    setThreads(updatedThreads);
    saveThreads(updatedThreads);

    setInputText('');
  };

  // Seller Action: Accept Offer
  const handleAcceptOffer = () => {
    if (!activeThread || !activeNegotiation) return;

    const updatedOffer: NegotiationOffer = {
      ...activeNegotiation,
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    };

    const updatedThreads = threads.map((t) =>
      t.id === activeThread.id ? { ...t, activeNegotiation: updatedOffer } : t
    );
    setThreads(updatedThreads);
    saveThreads(updatedThreads);

    const confirmMsg: ChatMessage = {
      id: `msg-${Date.now()}-accept`,
      threadId: activeThread.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: `Deal agreed! I have accepted your offer of ${formatOMR(activeNegotiation.offeredPrice)}. Let's coordinate in-person cash handover or Venmo exchange in Oman.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
      offerAttachment: updatedOffer,
    };

    const updatedMessages = [...currentMessages, confirmMsg];
    const updatedMap = { ...messagesMap, [activeThread.id]: updatedMessages };
    setMessagesMap(updatedMap);
    saveMessages(updatedMap);

    // Notify buyer
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-accepted`,
      userId: activeNegotiation.buyerId,
      title: 'Discount Offer Accepted! 🎉',
      body: `${currentUser.name} accepted your offer of ${formatOMR(activeNegotiation.offeredPrice)} for "${activeThread.listingTitle.slice(0, 25)}...". Arrange cash/Venmo handover.`,
      type: 'offer_accepted',
      relatedListingId: activeNegotiation.listingId,
      relatedThreadId: activeThread.id,
      read: false,
      createdAt: 'Just now',
    });
    saveNotifications(notifs);
  };

  // Seller Action: Decline Offer
  const handleDeclineOffer = () => {
    if (!activeThread || !activeNegotiation) return;

    const updatedOffer: NegotiationOffer = {
      ...activeNegotiation,
      status: 'declined',
      updatedAt: new Date().toISOString(),
    };

    const updatedThreads = threads.map((t) =>
      t.id === activeThread.id ? { ...t, activeNegotiation: updatedOffer } : t
    );
    setThreads(updatedThreads);
    saveThreads(updatedThreads);

    const declineMsg: ChatMessage = {
      id: `msg-${Date.now()}-decline`,
      threadId: activeThread.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: `Thank you for the offer, but I cannot accept ${formatOMR(activeNegotiation.offeredPrice)} at this time.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
      offerAttachment: updatedOffer,
    };

    const updatedMessages = [...currentMessages, declineMsg];
    const updatedMap = { ...messagesMap, [activeThread.id]: updatedMessages };
    setMessagesMap(updatedMap);
    saveMessages(updatedMap);
  };

  // Seller Action: Submit Counter-Offer
  const handleSendCounterOffer = () => {
    if (!activeThread || !activeNegotiation) return;
    const counter = parseFloat(counterPriceInput);
    if (isNaN(counter) || counter <= 0) return;

    const updatedOffer: NegotiationOffer = {
      ...activeNegotiation,
      status: 'countered',
      counterPrice: counter,
      updatedAt: new Date().toISOString(),
    };

    const updatedThreads = threads.map((t) =>
      t.id === activeThread.id ? { ...t, activeNegotiation: updatedOffer } : t
    );
    setThreads(updatedThreads);
    saveThreads(updatedThreads);

    const counterMsg: ChatMessage = {
      id: `msg-${Date.now()}-counter`,
      threadId: activeThread.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: `I counter-offer ${formatOMR(counter)} for in-person handover.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
      offerAttachment: updatedOffer,
    };

    const updatedMessages = [...currentMessages, counterMsg];
    const updatedMap = { ...messagesMap, [activeThread.id]: updatedMessages };
    setMessagesMap(updatedMap);
    saveMessages(updatedMap);

    setShowCounterInput(false);
    setCounterPriceInput('');
  };

  // Buyer Action: Accept Counter-Offer
  const handleAcceptCounter = () => {
    if (!activeThread || !activeNegotiation || !activeNegotiation.counterPrice) return;
    const agreedPrice = activeNegotiation.counterPrice;

    const updatedOffer: NegotiationOffer = {
      ...activeNegotiation,
      status: 'accepted',
      offeredPrice: agreedPrice,
      discountPercent: calculateDiscountPercent(activeNegotiation.originalPrice, agreedPrice),
      updatedAt: new Date().toISOString(),
    };

    const updatedThreads = threads.map((t) =>
      t.id === activeThread.id ? { ...t, activeNegotiation: updatedOffer } : t
    );
    setThreads(updatedThreads);
    saveThreads(updatedThreads);

    const acceptCounterMsg: ChatMessage = {
      id: `msg-${Date.now()}-accept-counter`,
      threadId: activeThread.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: `Deal agreed at ${formatOMR(agreedPrice)}! We will meet in person and pay via Cash or Venmo upon inspection.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
      offerAttachment: updatedOffer,
    };

    const updatedMessages = [...currentMessages, acceptCounterMsg];
    const updatedMap = { ...messagesMap, [activeThread.id]: updatedMessages };
    setMessagesMap(updatedMap);
    saveMessages(updatedMap);
  };

  // Buyer & Seller: Confirm in-person cash / Venmo deal
  const handleConfirmInPersonDeal = () => {
    setDealConfirmedNotice(true);
    setTimeout(() => setDealConfirmedNotice(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e20] text-zinc-100 rounded-2xl w-full max-w-5xl h-[88vh] overflow-hidden shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Top Header with Back button */}
        <div className="p-3.5 sm:p-4 bg-[#161618] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono-tech"
            >
              <ArrowLeft className="w-4 h-4 text-[#e0f252]" />
              <span className="font-bold">Back</span>
            </button>
            <h2 className="font-oswald text-base sm:text-lg font-bold text-white uppercase tracking-wider">
              Real-Time Negotiations & In-Person Handover
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RED SECURITY WARNING BANNER */}
        <div className="px-4 py-2 bg-red-950/50 border-b border-red-500/50 flex items-center justify-between text-red-200 text-xs">
          <div className="flex items-center gap-2 font-mono-tech">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>DATA BREACH WARNING:</strong> NO website card payments. Settle strictly with <strong>Cash on Handover</strong> or <strong>Venmo</strong> when meeting in person.
            </span>
          </div>
        </div>

        {/* Modal Body: Sidebar threads + Active chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Threads Sidebar (Desktop & Tablet) */}
          <div className="w-80 border-r border-white/10 bg-[#161618] flex flex-col hidden md:flex shrink-0">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono-tech">
                Negotiation Inbox
              </span>
              <span className="text-[10px] bg-[#e0f252]/10 text-[#e0f252] font-mono-tech font-bold px-2 py-0.5 rounded">
                {threads.length} conversations
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {threads.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono-tech text-zinc-500">
                  No active negotiations yet. Click "Ask Discount" on any listing to start.
                </div>
              ) : (
                threads.map((thread) => {
                  const otherPartyName = currentUser.id === thread.buyerId ? thread.sellerName : thread.buyerName;
                  const otherPartyAvatar = currentUser.id === thread.buyerId ? thread.sellerAvatar : thread.buyerAvatar;
                  const isSelected = thread.id === activeThreadId;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`p-3 cursor-pointer transition-colors flex items-start gap-3 ${
                        isSelected ? 'bg-white/10 border-l-2 border-[#e0f252]' : 'hover:bg-white/5'
                      }`}
                    >
                      <img
                        src={otherPartyAvatar}
                        alt={otherPartyName}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate font-oswald uppercase">
                            {otherPartyName}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono-tech">
                            {thread.lastMessageTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#e0f252] truncate font-mono-tech">
                          {thread.listingTitle}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono-tech">
                          {thread.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Column */}
          {activeThread ? (
            <div className="flex-1 flex flex-col bg-[#1e1e20] overflow-hidden">
              {/* Active Thread Header */}
              <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#161618]">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeThread.listingImage}
                    alt={activeThread.listingTitle}
                    className="w-11 h-11 rounded-lg object-cover shrink-0 border border-white/15"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-oswald text-xs sm:text-sm font-bold text-white uppercase truncate">
                        {activeThread.listingTitle}
                      </h3>
                      <span className="font-oswald text-xs font-bold text-[#e0f252] shrink-0">
                        {formatOMR(activeThread.listingPrice)}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono-tech text-zinc-400 flex items-center gap-1.5">
                      <span>Chatting with <strong className="text-white">{isSeller ? activeThread.buyerName : activeThread.sellerName}</strong></span>
                      <span>•</span>
                      <span className="text-[#e0f252]">Real Person (No AI)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Deal Confirmation Banner Toast */}
              {dealConfirmedNotice && (
                <div className="p-3 bg-[#e0f252] text-[#111113] font-oswald uppercase tracking-wider text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Cash / Venmo Handover Terms Agreed! Inspect the physical item before handing over payment.
                  </span>
                  <button onClick={() => setDealConfirmedNotice(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Active Negotiation Deal Banner */}
              {activeNegotiation && (
                <div className="bg-[#161618] border-b border-white/10 p-3 sm:p-3.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#e0f252] text-[#111113] flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono-tech">
                          <span className="text-xs font-bold text-white uppercase">
                            Offer Status:
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              activeNegotiation.status === 'accepted'
                                ? 'bg-[#e0f252] text-[#111113]'
                                : activeNegotiation.status === 'countered'
                                ? 'bg-amber-400 text-[#111113]'
                                : activeNegotiation.status === 'declined'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            {activeNegotiation.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono-tech text-zinc-300 mt-0.5">
                          Offered: <strong className="text-[#e0f252]">{formatOMR(activeNegotiation.offeredPrice)}</strong>{' '}
                          (Original: {formatOMR(activeNegotiation.originalPrice)} • {activeNegotiation.discountPercent}% off)
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                      {isSeller && activeNegotiation.status === 'pending' && (
                        <>
                          <button
                            onClick={handleAcceptOffer}
                            className="bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] text-xs font-oswald uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Offer</span>
                          </button>
                          <button
                            onClick={() => setShowCounterInput(!showCounterInput)}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono-tech font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Counter
                          </button>
                          <button
                            onClick={handleDeclineOffer}
                            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono-tech px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {isBuyer && activeNegotiation.status === 'countered' && activeNegotiation.counterPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono-tech font-bold text-amber-300">
                            Counter: {formatOMR(activeNegotiation.counterPrice)}
                          </span>
                          <button
                            onClick={handleAcceptCounter}
                            className="bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] text-xs font-oswald uppercase font-bold px-3 py-1.5 rounded-lg"
                          >
                            Accept Counter
                          </button>
                        </div>
                      )}

                      {/* When Accepted: Confirm In-Person Handover */}
                      {activeNegotiation.status === 'accepted' && (
                        <button
                          onClick={handleConfirmInPersonDeal}
                          className="flex items-center gap-1.5 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] text-xs font-oswald uppercase tracking-wider font-bold px-4 py-2 rounded-lg shadow-md transition-all"
                        >
                          <Banknote className="w-4 h-4" />
                          <span>Confirm Cash / Venmo Handover</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Counter input drawer */}
                  {showCounterInput && isSeller && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 font-mono-tech">
                      <span className="text-xs text-zinc-300">Counter Price (OMR):</span>
                      <input
                        type="number"
                        value={counterPriceInput}
                        onChange={(e) => setCounterPriceInput(e.target.value)}
                        placeholder="e.g. 165"
                        className="w-28 px-2 py-1 text-xs bg-[#1e1e20] border border-white/20 rounded text-white outline-none focus:border-[#e0f252]"
                      />
                      <button
                        onClick={handleSendCounterOffer}
                        className="px-3 py-1 bg-[#e0f252] text-[#111113] font-bold text-xs rounded"
                      >
                        Send Counter
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentMessages.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono-tech text-zinc-500">
                    No messages yet. Send a message to arrange inspection time and location.
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isMyMsg = msg.senderId === currentUser.id;

                    if (msg.isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="px-3 py-1.5 rounded-lg bg-[#161618] border border-white/10 text-[11px] font-mono-tech text-zinc-300 text-center max-w-md">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-md p-3 rounded-xl text-xs leading-relaxed font-mono-tech ${
                            isMyMsg
                              ? 'bg-[#e0f252] text-[#111113] font-medium'
                              : 'bg-[#161618] text-white border border-white/10'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isMyMsg ? 'text-[#111113]/60' : 'text-zinc-500'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#161618] border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type message, negotiate cash price, or arrange meetup spot in Oman..."
                  className="flex-1 px-3.5 py-2.5 bg-[#1e1e20] border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-[#e0f252] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-[#e0f252] hover:bg-[#cbdb40] disabled:opacity-40 text-[#111113] rounded-xl font-bold transition-all"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs font-mono-tech text-zinc-500">
              Select a conversation to start negotiating.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
