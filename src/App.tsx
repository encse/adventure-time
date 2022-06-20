import React from 'react';
import './App.css';
import { gameLoop } from './game/loop';
import { TermIo } from './io/io';

function App() {
  
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

export default App;
