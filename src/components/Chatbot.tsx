'use client';

import { useState, useEffect } from 'react';
import '../styles/globals.css';

const BACKEND_URL = 'https://chat-bot-backend-7t89.onrender.com';

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

type View =
  | { type: 'welcome' }
  | { type: 'query'; key: string }
  | { type: 'sub'; key: string; sub: string };

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [view, setView] = useState<View>({ type: 'welcome' });
  const [history, setHistory] = useState<View[]>([]);

  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/welcome`);
        const welcomeJson: { message: string; queries: string[] } = await res.json();

        const queriesData: FAQData['queries'] = {};

        for (const key of welcomeJson.queries) {
          const resQuery = await fetch(`${BACKEND_URL}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
          });
          const queryJson: { message: string; sub?: { [subKey: string]: string } } = await resQuery.json();
          queriesData[key] = queryJson;
        }

        setFaqData({
          welcome: welcomeJson.message,
          queries: queriesData,
        });
      } catch (err) {
        console.error('Failed to load FAQ data:', err);
      }
    };

    fetchWelcome();
  }, []);

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

  const handleQueryClick = (key: string) => {
    setHistory((prev) => [...prev, view]);
    setView({ type: 'query', key });
  };

  const handleSubQueryClick = (key: string, sub: string) => {
    setHistory((prev) => [...prev, view]);
    setView({ type: 'sub', key, sub });
  };

  const renderView = () => {
    if (!faqData) return <div>Loading...</div>;

    if (view.type === 'welcome') {
      return (
        <>
          <div className="mb-4 text-left px-2">{faqData.welcome}</div>
          <div className="flex flex-col gap-2 px-2 text-left">
            {Object.keys(faqData.queries).map((key) => (
              <button
                key={key}
                className="text-left bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded px-3 py-2 hover:opacity-90 transition"
                onClick={() => handleQueryClick(key)}
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
          <div className="mb-4 text-left px-2">
            <strong>{view.key}</strong>
            <br />
            {q.message}
          </div>
          {q.sub && (
            <div className="flex flex-col gap-2 px-2 text-left">
              {Object.keys(q.sub).map((subKey) => (
                <button
                  key={subKey}
                  className="text-left bg-gradient-to-r from-green-400 to-green-600 text-white rounded px-3 py-2 hover:opacity-90 transition"
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
        <div className="text-left px-2">
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
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white text-2xl rounded-full shadow-lg z-50 transition-transform duration-300 ease-in-out"
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

          <div className="p-2 overflow-y-auto text-sm flex-1">{renderView()}</div>

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
