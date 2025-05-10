import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import logoColored from '../../assets/images/logoColored.svg';
import { ThemeContext } from "../../context/ThemeContext";
import logoWhite from "../../assets/images/logoWhite.svg";

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);

  const popularDestinations = [
    { name: 'New York', path: '/flights/new-york' },
    { name: 'London', path: '/flights/london' },
    { name: 'Tokyo', path: '/flights/tokyo' },
    { name: 'Paris', path: '/flights/paris' },
    { name: 'Dubai', path: '/flights/dubai' },
    { name: 'Sydney', path: '/flights/sydney' },
    { name: 'Rome', path: '/flights/rome' },
    { name: 'Singapore', path: '/flights/singapore' },
  ];

  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`duration-300 ${
      darkMode 
        ? 'bg-[var(--primarydark)] text-slate-300 border-slate-700' 
        : 'bg-slate-100 text-slate-800 border-slate-300'
    } px-8 md:px-16 py-10 border-t`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 duration-300">
          <div className="mb-6 md:mb-0 md:w-1/3 duration-300">
            <Link to="/">
              <img 
                src={darkMode ? logoWhite : logoColored} 
                alt="FlyEasy Logo" 
                className="w-32 mb-4" 
              />
            </Link>
            <p className={`duration-300 text-left ${darkMode ? 'text-slate-400' : 'text-slate-600'} max-w-xs`}>
              Find and compare flights with ease. FlyEasy helps you discover the best deals on airfare worldwide.
            </p>
          </div>
          <div className="md:w-2/3">
            <h3 className={`text-lg font-semibold mb-4 duration-300 text-left ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Popular Destinations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-left">
              {popularDestinations.map((destination) => (
                <Link 
                  key={destination.name} 
                  to={destination.path}
                  className={`duration-300 ${
                    darkMode 
                      ? 'text-slate-400 hover:text-blue-400' 
                      : 'text-slate-600 hover:text-blue-600'
                  } transition duration-200`}
                >
                  {destination.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={`pt-6 border-t duration-300 ${darkMode ? 'border-slate-800' : 'border-slate-200'} text-center md:text-left`}>
          <p className={`duration-300 ${darkMode ? 'text-slate-500' : 'text-slate-500'} text-sm`}>
            &copy; {currentYear} FlyEasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;