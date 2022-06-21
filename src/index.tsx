import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { gameLoop } from './game/loop';
import { TermIo } from './io/io';
import c from 'ansi-colors';

function App() {
    c.enabled = true;
    const onRefChange = React.useCallback((node:HTMLElement | null) => {
        if (node != null) { 
            gameLoop(new TermIo(node));
        }
      }, []); 
    
    return (
        <div className="App" ref={onRefChange}>
        </div>
    );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);