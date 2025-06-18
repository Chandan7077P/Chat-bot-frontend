'use client';

import { useState, useEffect } from 'react';
import '../styles/globals.css'; // Global styles if needed

const BACKEND_URL = 'https://chat-bot-backend-7t89.onrender.com'; // Your backend

type FAQData = {
  welcome: string;
  queries: {
    [key: string]: {
      message: string;
      sub?: {
        [subKey: string]: string;
      };
    };
  };
};

const faqData: FAQData = {
  welcome: 'Hi! How can I help you today?',
  queries: {
    'About Us': {
      message: 'We are a leading shrimp exporter...',
      sub: {
        Certifications: 'We are certified by FDA, BRC, etc.',
        Mission: 'To deliver the best quality seafood worldwide.',
      },
    },
    Products: {
      message: 'We offer premium shrimp products.',
      sub: {
        Vannamei: 'Vannamei shrimp is our most exported product.',
        'Black Tiger': 'Black Tiger shrimp is known for its quality.',
      },
    },
    Contact: {
      message: 'You can reach us at contact@highlandseafood.com',
    },
  },
};

type View =
  | { type: 'welcome' }
  | { type: 'query'; key: keyof FAQData['queries'] }
  | { type: 'sub'; key: keyof FAQData['queries']; sub: string };

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>({ type: 'welcome' });
  const [history, setHistory] = useState<View[]>([]);

  const toggleBot = () => {
    const open = !isOpen;
    setIsOpen(open);
    if (open) {
      setView({ type: 'welcome' });
      setHistory([]);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = [...history];
      const last = prev.pop()!;
      setHistory(prev);
      setView(last);
    }
  };

  const goHome = () => {
    setView({ type: 'welcome' });
    setHistory([]);
  };

  const handleQueryClick = (key: keyof FAQData['queries']) => {
    setHistory((prev) => [...prev, view]);
    setView({ type: 'query', key });
  };

  const handleSubQueryClick = (key: keyof FAQData['queries'], sub: string) => {
    setHistory((prev) => [...prev, view]);
    setView({ type: 'sub', key, sub });
  };

  const renderView = () => {
    if (view.type === 'welcome') {
      return (
        <>
          <div className="mb-4">{faqData.welcome}</div>
          <div className="flex flex-col gap-2">
            {Object.keys(faqData.queries).map((key) => (
              <button
                key={key}
                className="bg-blue-500 text-white rounded px-3 py-2 hover:bg-blue-600 transition"
                onClick={() =>
                  handleQueryClick(key as keyof typeof faqData.queries)
                }
              >
                {key}
              </button>
            ))}
          </div>
        </>
      );
    } else if (view.type === 'query') {
      const q = faqData.queries[view.key];
      return (
        <>
          <div className="mb-4">
            <strong>{view.key}</strong>
            <br />
            {q.message}
          </div>
          {q.sub && (
            <div className="flex flex-col gap-2">
              {Object.keys(q.sub).map((subKey) => (
                <button
                  key={subKey}
                  className="bg-green-500 text-white rounded px-3 py-2 hover:bg-green-600 transition"
                  onClick={() => handleSubQueryClick(view.key, subKey)}
                >
                  {subKey}
                </button>
              ))}
            </div>
          )}
        </>
      );
    } else if (view.type === 'sub') {
      const msg = faqData.queries[view.key].sub?.[view.sub];
      return (
        <div>
          <strong>{view.sub}</strong>
          <br />
          {msg}
        </div>
      );
    }
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-full shadow-lg z-50 transition-transform duration-300 ease-in-out"
        onClick={toggleBot}
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 max-w-[90vw] max-h-[500px] bg-white shadow-2xl rounded-xl flex flex-col border z-50 animate-slide-up">
          <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-xl">
            <button onClick={goBack} className="text-white text-lg">⬅️</button>
            <div className="font-bold">Highland FAQ Bot</div>
            <button onClick={toggleBot} className="text-white text-lg">❌</button>
          </div>

          <div className="p-4 overflow-y-auto text-sm flex-1">{renderView()}</div>

          <div className="p-2 border-t text-center bg-gray-50">
            <button
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              onClick={goHome}
            >
              🏠 Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}
