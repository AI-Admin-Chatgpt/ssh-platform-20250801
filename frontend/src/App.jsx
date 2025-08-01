import React, { useState } from 'react';
import { useStore } from './store';
import './App.css';

const API_URL = 'https://gemc-backend-svc-788103249888.us-east4.run.app/generate';

function App() {
  const { messages, addMessage, updateLastMessage, isLoading, setLoading } = useStore();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    addMessage('user', prompt);
    setPrompt('');
    setLoading(true);

    addMessage('model', '');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        updateLastMessage(chunk);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      updateLastMessage('\n\n--- Error fetching response ---');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</pre>
          </div>
        ))}
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt here"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;