"use client";

import { Suspense, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import WardElectionChat from "@/components/ward-election/WardElectionChat";

function FabInner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-[2px] sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <div
        className={
          open
            ? "fixed z-[70] inset-x-2 bottom-2 top-14 flex flex-col sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[420px] sm:h-[min(600px,calc(100dvh-3rem))]"
            : "fixed z-[70] bottom-6 right-6"
        }
      >
        {open && (
          <div className="relative flex flex-col h-full min-h-0 max-h-full shadow-2xl rounded-2xl overflow-hidden">
            <div className="shrink-0 flex justify-end p-1 bg-white border-b border-slate-100 sm:hidden">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-slate-500"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <WardElectionChat compact className="flex-1 min-h-0 h-full border-0 rounded-none sm:rounded-2xl sm:border" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hidden sm:flex absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-slate-800"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-indigo-700 text-white font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-indigo-800 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Ask AI</span>
          </button>
        )}
      </div>
    </>
  );
}

export default function WardElectionChatFab() {
  return (
    <Suspense fallback={null}>
      <FabInner />
    </Suspense>
  );
}
