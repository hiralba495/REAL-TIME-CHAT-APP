import React, { useState, useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:8080';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const message = reader.result;
          setMessages((prev) => {
            if (
              prev.length > 0 &&
              prev[prev.length - 1].text === message &&
              prev[prev.length - 1].fromSelf
            ) {
              return prev;
            }
            return [...prev, { text: message, fromSelf: false }];
          });
        };
        reader.readAsText(event.data);
      } else {
        const message = event.data;
        setMessages((prev) => {
          if (
            prev.length > 0 &&
            prev[prev.length - 1].text === message &&
            prev[prev.length - 1].fromSelf
          ) {
            return prev;
          }
          return [...prev, { text: message, fromSelf: false }];
        });
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === '') return;
    ws.current.send(input);
    setMessages((prev) => [...prev, { text: input, fromSelf: true }]);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      <header className=" p-4 shadow-md bg-indigo-600">
        <h1 className="text-2xl font-bold tracking-wide text-center  text-white">Real-Time Chat App</h1>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.fromSelf ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-xl px-5 py-3 max-w-xs break-words shadow-lg transform transition duration-300 ease-in-out hover:scale-105 text-white ${
                  msg.fromSelf ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' : 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 bg-indigo-400 border-t border-gray-300">
        <div className="max-w-3xl mx-auto flex space-x-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            aria-label="Message input"
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition duration-300"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
