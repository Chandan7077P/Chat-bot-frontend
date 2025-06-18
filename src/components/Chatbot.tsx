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
          <div className="mb-4">{faqData.welcome}</div>
          <div className="flex flex-col gap-2">
            {Object.keys(faqData.queries).map((key) => (
              <button
                key={key}
                className="chatbot-query-button px-3 py-2 rounded"
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
                  className="chatbot-subquery-button px-3 py-2 rounded"
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
      {/* Bot Floating Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-full shadow-lg z-50 transition-transform duration-300 ease-in-out"
        onClick={toggleBot}
      >
        💬
      </button>

      {/* Chatbot Container */}
      {isOpen && (
        <div className="chatbot-container fixed bottom-20 right-6 w-80 max-w-[90vw] h-[500px] shadow-2xl rounded-xl flex flex-col border z-50 animate-slide-up">
          {/* Header */}
          <div className="chatbot-header flex justify-between items-center p-3 rounded-t-xl">
            <button onClick={goBack} className="text-white text-lg">⬅️</button>
            <div className="font-bold">Highland FAQ Bot</div>
            <button onClick={toggleBot} className="text-white text-lg">❌</button>
          </div>

          {/* Main Chat Content */}
          <div className="p-4 overflow-y-auto text-sm flex-1">{renderView()}</div>

          {/* Footer Home Button */}
          <div className="p-2 border-t text-center bg-gray-50">
            <button className="chatbot-button px-4 py-2 rounded" onClick={goHome}>
              🏠 Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}
