'use client';

import { useStore } from '../../../store/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EmptyState from '../../../components/ui/EmptyState';
import ClickableAvatar from '../../../components/ui/ClickableAvatar';

export default function MessagesPage() {
  const { state, sendMessage } = useStore();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const currentUserId = state.currentUser?.id;
  if (!currentUserId) return null;

  const userConversations = state.conversations.filter(c => c.participants.includes(currentUserId));

  const handleSend = () => {
    if (!messageText.trim() || !selectedConversation) return;
    const otherUserId = userConversations.find(c => c.id === selectedConversation)?.participants.find(p => p !== currentUserId);
    if (otherUserId) { sendMessage(otherUserId, messageText); setMessageText(''); }
  };

  const getConversationMessages = (convId: string) => {
    const conv = state.conversations.find(c => c.id === convId);
    if (!conv) return [];
    return state.messages.filter(m =>
      conv.participants.includes(m.senderId) && conv.participants.includes(m.receiverId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const selectedConv = userConversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen flex">
      <div className={`${selectedConversation ? 'hidden md:block' : 'w-full'} md:w-80 border-r border-[#1a1a1a] min-h-screen`}>
        <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3">
          <h1 className="text-lg font-bold text-white">Messages</h1>
        </div>
        {userConversations.length === 0 ? (
          <EmptyState icon="💬" title="Your inbox is empty" description="When you message someone or they message you, conversations will appear here." />
        ) : (
          <div>
            {userConversations.map(conv => {
              const otherUserId = conv.participants.find(p => p !== currentUserId);
              const otherUser = state.users.find(u => u.id === otherUserId);
              if (!otherUser) return null;
              const isSelected = selectedConversation === conv.id;
              const hasUnread = conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId !== currentUserId;
              return (
                <button key={conv.id} onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isSelected ? 'bg-[#141414]' : 'hover:bg-[#141414]/50'}`}>
                  <div className="relative">
                    <ClickableAvatar src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full bg-[#1a1a1a]" />
                    {otherUser.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/profile?userId=${otherUser.id}`); }} className={`text-sm font-medium truncate hover:underline text-left ${hasUnread ? 'text-white' : 'text-[#a0a0a0]'}`}>{otherUser.name}</button>
                    </div>
                    <p className={`text-xs truncate ${hasUnread ? 'text-[#a0a0a0]' : 'text-[#666]'}`}>{conv.lastMessage?.content || 'No messages yet'}</p>
                  </div>
                  {hasUnread && <div className="w-2 h-2 bg-[#e50914] rounded-full" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3 flex items-center gap-3">
              <button onClick={() => setSelectedConversation(null)} className="md:hidden text-[#666] hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {(() => {
                const otherUserId = selectedConv.participants.find(p => p !== currentUserId);
                const otherUser = state.users.find(u => u.id === otherUserId);
                if (!otherUser) return null;
                return (
                  <>
                    <ClickableAvatar src={otherUser.avatar} alt={otherUser.name} className="w-8 h-8 rounded-full bg-[#1a1a1a]" />
                    <div>
                      <button onClick={() => router.push(`/profile?userId=${otherUser.id}`)} className="text-white text-sm font-medium hover:underline text-left">{otherUser.name}</button>
                      <div className={`text-xs ${otherUser.isOnline ? 'text-green-500' : 'text-[#666]'}`}>{otherUser.isOnline ? 'Online' : 'Offline'}</div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {getConversationMessages(selectedConversation!).map(msg => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-[#e50914] text-white rounded-br-sm' : 'bg-[#1a1a1a] text-white rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#1a1a1a] px-4 py-3">
              <div className="flex gap-2">
                <input value={messageText} onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
                <button onClick={handleSend} disabled={!messageText.trim()}
                  className="px-4 bg-[#e50914] hover:bg-[#ff1a25] disabled:opacity-30 text-white rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-white font-semibold mb-2">Select a conversation</h3>
              <p className="text-[#666] text-sm">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
