import React from 'react';
import './App.css';
import {main} from './foo';

function App() {
  
    const onRefChange = React.useCallback((node:HTMLElement | null) => {
        if (node != null) { 
            main(node);
        }
      }, []); 
    
    return (
        <div className="App" ref={onRefChange}>
        </div>
    );
}

export default App;
