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

type Message = {
  sender: 'bot' | 'user';
  text: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [view, setView] = useState<View>({ type: 'welcome' });
  const [history, setHistory] = useState<View[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchWelcome = async () => {
      setIsTyping(true);
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

        setMessages([{ sender: 'bot', text: welcomeJson.message }]);
      } catch (err) {
        console.error('Failed to load FAQ data:', err);
      }
      setIsTyping(false);
    };

    fetchWelcome();
  }, []);

  const toggleBot = () => {
    const open = !isOpen;
    setIsOpen(open);
    if (open) {
      setView({ type: 'welcome' });
      setHistory([]);
      setMessages([]);
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
    setMessages([]);
  };

  const handleQueryClick = (key: string) => {
    if (!faqData) return;

    setHistory((prev) => [...prev, view]);
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: key },
      { sender: 'bot', text: faqData.queries[key].message },
    ]);
    setView({ type: 'query', key });
  };

  const handleSubQueryClick = (key: string, sub: string) => {
    if (!faqData) return;

    setHistory((prev) => [...prev, view]);
    const response = faqData.queries[key].sub?.[sub] ?? '';
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: sub },
      { sender: 'bot', text: response },
    ]);
    setView({ type: 'sub', key, sub });
  };

  const renderView = () => {
    if (!faqData) return <div>Loading...</div>;

    const subButtons =
      view.type === 'query' && faqData.queries[view.key].sub ? (
        <div className="flex flex-col gap-2 mt-2">
          {Object.keys(faqData.queries[view.key].sub!).map((subKey) => (
            <button
              key={subKey}
              className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition"
              onClick={() => handleSubQueryClick(view.key, subKey)}
            >
              {subKey}
            </button>
          ))}
        </div>
      ) : null;

    return (
      <>
        <div className="space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {isTyping && (
          <div className="flex items-center space-x-2 mt-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <span className="text-xs text-gray-400 ml-2">Typing...</span>
          </div>
        )}

        {view.type === 'welcome' && faqData && (
          <div className="flex flex-col gap-2 mt-3">
            {Object.keys(faqData.queries).map((key) => (
              <button
                key={key}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                onClick={() => handleQueryClick(key)}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {subButtons}
      </>
    );
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-full shadow-lg z-50"
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
