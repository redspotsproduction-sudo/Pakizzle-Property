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

  const isMobileThread = isMobile && activeConversationId !== null;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col overflow-hidden relative w-full select-none",
        isDragging && "cursor-col-resize",
        isDashboardView ? "h-full bg-apple-surface" : "h-[100dvh] bg-apple-bg",
        !isDashboardView && (isMobileThread ? "pt-0" : "pt-[var(--header-h)]")
      )}
      style={{
        height: isDashboardView ? '100%' : '100dvh',
      }}
    >
      {/* Global Header: Only shown on full route when NOT in mobile immersive thread */}
      {!isDashboardView && !isMobileThread && <Header />}

      <main className="flex-1 flex overflow-hidden h-full min-h-0 w-full">
        <div className="w-full flex h-full overflow-hidden relative min-h-0">
          {/* Chat List:
              - Below 768: visible only if no active conversation
              - 768 to 1023: visible as two panes (list + thread)
              - 1024+: visible in 360px resizable column
          */}
          <div 
            className={cn(
              "h-full border-r shrink-0 relative flex flex-col min-w-0 overflow-hidden",
              !isDragging && "transition-all duration-300",
              "border-apple-border",
              activeConversationId ? "hidden md:flex" : "flex w-full md:flex"
            )}
            style={!isMobile ? { width: `${Math.max(320, Math.min(400, chatListWidth))}px` } : undefined}
          >
            <ChatList isDashboardView={isDashboardView} />

            {/* Resize Handle - Only on desktop (>= 1024px) */}
            <div
              onMouseDown={handleMouseDown}
              className={cn(
                "hidden lg:flex absolute top-0 right-[-4px] w-[8px] h-full cursor-col-resize z-30 group hover:bg-apple-blue/20 transition-colors duration-200 items-center justify-center",
                isDragging && "bg-apple-blue/30"
              )}
              aria-label="Resize chat list pane"
            >
              <div className={cn(
                "w-[1.5px] h-full transition-colors",
                isDragging ? "bg-apple-blue" : "bg-transparent group-hover:bg-apple-blue/40"
              )} />
            </div>
          </div>

          {/* Chat Thread Window:
              - Below 768: visible only if active conversation exists
              - 768+: always visible
          */}
          <div className={cn(
            "flex-1 h-full min-w-0 flex flex-col overflow-hidden min-h-0",
            !isDragging && "transition-all duration-300",
            isDashboardView ? "bg-apple-surface" : "bg-apple-bg",
            !activeConversationId ? "hidden md:flex" : "flex"
          )}>
            <ChatWindow isDashboardView={isDashboardView} />
          </div>
        </div>
      </main>
    </div>
  );
}
