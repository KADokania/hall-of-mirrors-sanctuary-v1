import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Threshold } from "./components/Threshold";
import { SpiralJourney } from "./components/SpiralJourney";
import { Archive } from "./components/Archive";
import { SessionDetail } from "./components/SessionDetail";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Threshold />} />
          <Route path="/spiral" element={<SpiralJourney />} />
          <Route path="/spiral/:bloomId" element={<SpiralJourney />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/session/:sessionId" element={<SessionDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;