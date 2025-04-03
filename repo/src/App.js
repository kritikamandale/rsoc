import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import ReposPage from './pages/ReposPage';
import AnalysisPage from './pages/AnalysisPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/repos/:username" element={<ReposPage />} />
          <Route path="/analysis/:username/:repo" element={<AnalysisPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
