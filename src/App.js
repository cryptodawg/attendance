// src/App.js
import React, { useEffect } from 'react';
import Calendar from './Calendar';

function App() {

  useEffect(() => {
    document.title = "In-Office Planner";
  }, []);
  

  return (
    <div className="App">
      <main>
        <Calendar />
      </main>
    </div>
  );
}

export default App;
