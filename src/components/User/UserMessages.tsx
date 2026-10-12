import React from "react";
import ChatContainer from "../Chat/ChatContainer";

export default function UserMessages() {
  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-130px)] min-h-[550px] overflow-hidden rounded-2xl md:rounded-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.01)] bg-white dark:bg-[var(--surface-dark)] relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -z-10" />
      
      <div className="h-full">
        {/* We reuse the ChatContainer but its layout will be constrained by this parent */}
        <ChatContainer isDashboardView={true} />
      </div>
    </div>
  );
}
