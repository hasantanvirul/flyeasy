import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import logoColored from '../../assets/images/logoColored.svg';
import logoWhite from "../../assets/images/logoWhite.svg";
import { Moon, Sun } from "lucide-react";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <nav className={`w-screen px-16 py-4 flex flex-row justify-between items-center border-b duration-300 ${
      darkMode 
        ? "bg-[var(--primarydark)] text-white border-slate-800" 
        : "bg-white text-slate-800 border-slate-200"
    }`}>
      <div className="logo duration-300">
        <Link to="/dashboard">
          <img 
            src={darkMode ? logoWhite : logoColored} 
            alt="FlyEasy Logo" 
            className="w-20 md:w-24"
          />
        </Link>
      </div>
      <div className="rightMenu flex flex-row gap-4 justify-center items-center duration-300">
        <button 
          onClick={toggleDarkMode} 
          className={`p-2 rounded-full duration-300 ${
            darkMode 
              ? "text-white hover:bg-slate-200 hover:text-black" 
              : "text-slate-700 hover:bg-slate-600 hover:text-white"
          }`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>
        {/* <button 
          className={`rounded-lg py-2 px-3 transition-colors duration-300 ${
            darkMode 
              ? "bg-slate-600 hover:bg-slate-200 hover:text-black" 
              : "bg-slate-300 text-slate-700 hover:bg-slate-600 hover:text-white"
          }`}
        >
          Sign In
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;