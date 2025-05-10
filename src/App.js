import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/navbar'; 
import Footer from './components/common/footer';
import Home from './pages/home';
import "../src/App.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App flex flex-col min-h-screen transition-colors duration-200">
          <Navbar />
          <main className="flex-grow dark:bg-[var(--primarygrey)]">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};
  export default App;