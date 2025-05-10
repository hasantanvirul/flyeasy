import React from 'react';
import { Link } from 'react-router-dom';
import logoColored from '../../assets/images/logoColored.svg';

const Footer = () => {
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
    <footer className="bg-slate-100 px-8 md:px-16 py-10">
      <div className="container mx-auto">
 
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div className="mb-6 md:mb-0 md:w-1/3">
            <Link to="/">
              <img src={logoColored} alt="FlyEasy Logo" className="w-32 mb-4" />
            </Link>
            <p className="text-slate-600 max-w-xs">
              Find and compare flights with ease. FlyEasy helps you discover the best deals on airfare worldwide.
            </p>
          </div>
          <div className="md:w-2/3">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Popular Destinations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {popularDestinations.map((destination) => (
                <Link 
                  key={destination.name} 
                  to={destination.path}
                  className="text-slate-500 hover:text-slate-700 transition duration-300"
                >
                  {destination.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-200 text-center md:text-left">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} FlyEasy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;