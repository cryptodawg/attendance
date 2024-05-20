// src/App.js
import React, { useEffect } from 'react';
import Calendar from './Calendar';

function App() {

  useEffect(() => {
    document.title = "In-Office Planner";
  }, []);
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>In-Office Planner</h1>
      </header>
      <main>
        <Calendar />
      </main>
    </div>
  );
}

export default App;
