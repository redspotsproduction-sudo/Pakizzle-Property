import React, { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import Header from '../Header';
import { useChat } from '../../context/ChatContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Check } from 'lucide-react';

interface ChatContainerProps {
  isDashboardView?: boolean;
}

export default function ChatContainer({ isDashboardView = false }: ChatContainerProps) {
  const { activeConversationId } = useChat();
  const [chatListWidth, setChatListWidth] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      // Set boundary values to prevent crushing the layouts
      if (newWidth >= 260 && newWidth <= 600) {
        setChatListWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    if (isDragging) {
      draggingRef.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col overflow-hidden relative w-full h-full",
        isDragging && "select-none cursor-col-resize",
        isDashboardView ? "bg-white dark:bg-[#161617]" : "bg-apple-bg"
      )}
    >
      {!isDashboardView && <Header />}
      <main className="flex-1 flex overflow-hidden h-full">
        <div className="w-full flex h-full overflow-hidden relative">
          {/* Chat List - Hidden on mobile if a chat is active */}
          <div 
            className={cn(
              "h-full border-r shrink-0 relative flex flex-col min-w-0",
              !isDragging && "transition-all duration-300",
              isDashboardView ? "border-black/[0.04] dark:border-white/[0.04]" : "border-apple-border",
              activeConversationId ? "hidden md:flex" : "flex w-full md:flex"
            )}
            style={!isMobile ? { width: `${chatListWidth}px` } : undefined}
          >
            <ChatList isDashboardView={isDashboardView} />

            {/* Resize Handle - Only on desktop */}
            {!isMobile && (
              <div
                onMouseDown={handleMouseDown}
                className={cn(
                  "absolute top-0 right-[-4px] w-[8px] h-full cursor-col-resize z-50 group hover:bg-apple-blue/20 transition-colors duration-200 flex items-center justify-center",
                  isDragging && "bg-apple-blue/30"
                )}
              >
                {/* Visual indicator line */}
                <div className={cn(
                  "w-[1.5px] h-full transition-colors",
                  isDragging 
                    ? "bg-apple-blue" 
                    : "bg-transparent group-hover:bg-apple-blue/40"
                )} />
              </div>
            )}
          </div>

          {/* Chat Window - Hidden on mobile if no chat is active */}
          <div className={cn(
            "flex-1 h-full min-w-0",
            !isDragging && "transition-all duration-300",
            isDashboardView ? "bg-white dark:bg-[#161617]" : "bg-apple-bg",
            !activeConversationId ? "hidden md:flex" : "flex"
          )}>
            <ChatWindow isDashboardView={isDashboardView} />
          </div>
        </div>
      </main>
    </div>
  );
}
