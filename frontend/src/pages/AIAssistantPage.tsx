import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TopNav, type DashboardTab } from '@/components/invoices';
import { GlassCard } from '@/components/invoices';
import { chatWithAssistant } from '@/api/assistantService';
import { getErrorMessage } from '@/api/axios';
import { ROUTES } from '@/routes/paths';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}


export const AIAssistantPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your InvoiceIQ AI Assistant.\n\nI can help you:\n• Explain InvoiceIQ features\n• Find invoices\n• Analyze spending\n• Track workflow\n• Identify duplicates\n• Answer questions about your uploaded invoices',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleUploadClick = () => {
    navigate(ROUTES.DASHBOARD_INVOICES);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(trimmedInput);
      
      // Remove internal classification text from AI response
      const cleanedAnswer = response.answer
        .replace(/^This question is ABOUT InvoiceIQ\.\s*/i, '')
        .replace(/^This question is ABOUT the user's invoice data\.\s*/i, '')
        .replace(/^This question is unrelated to both InvoiceIQ and invoices\.\s*/i, '');
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanedAnswer,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to get AI response');
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
<div className="min-h-screen flex flex-col bg-gradient-to-br from-[#321E48]/10 to-[#EAE0CF]/30">      <TopNav
        activeTab="assistant"
        userName={user?.name}
        onLogout={handleLogout}
        onUploadClick={handleUploadClick}
      />

<main className="flex-1 flex justify-center items-start px-4 sm:px-6 lg:px-8 py-8">      
  <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-[900px] bg-white rounded-xl shadow-lg border border-[#321E48]/20 flex flex-col overflow-hidden h-[calc(100vh-140px)] min-h-[500px] sm:h-[700px]"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-[#321E48]/20 bg-[#321E48]/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#321E48] flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#17433F]">InvoiceIQ AI</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#78A4CB] rounded-full animate-pulse" />
                  <span className="text-xs text-[#43637E]">Online</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-[#EAE0CF] rounded-lg transition-colors">
              <MoreVertical size={18} className="text-[#43637E]" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-[#F5F7F5]/50 p-6">
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-[#321E48] text-white'
                          : 'bg-[#EAE0CF] text-[#17433F]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#EAE0CF] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 bg-[#43637E] rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[#43637E] rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-[#43637E] rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-[#321E48]/20 bg-[#321E48]/5">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask InvoiceIQ AI anything..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-[#EFEABB] rounded-lg focus:outline-none focus:border-[#78A4CB] focus:ring-2 focus:ring-[#78A4CB]/10 bg-[#EAE0CF]/30 text-[#17433F] placeholder:text-[#43637E] disabled:opacity-50 transition-all text-sm"
                />
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#321E48] text-white flex items-center justify-center hover:bg-[#43637E] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send size={16} className="stroke-[2.5]" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};