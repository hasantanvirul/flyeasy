import { useState, useContext, useEffect } from "react";
import { Search, ArrowLeftRight, Calendar, Users, Loader, Clock, Plane, ChevronDown, Filter, ArrowUpDown } from "lucide-react";
import { fetchAirportSuggestions, searchFlights } from "../utils/api/skyScrapper";
import { ThemeContext } from "../context/ThemeContext";

const Home = () => {
  const { darkMode } = useContext(ThemeContext);
  const [tripType, setTripType] = useState("roundTrip");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showCabinDropdown, setShowCabinDropdown] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);


  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [sortOption, setSortOption] = useState("price");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );

          if (response.ok) {
            const data = await response.json();
           
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county;

            if (city) {
              setFromLocation(city);
            } else {
              setFromLocation(
                `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              );
            }
          } else {
          
            setFromLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          setLocationError("Failed to get your location name");
          console.error("Error getting location:", error);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  
  const extractAirportCode = (locationString) => {
    const match = locationString.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : locationString;
  };

 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    setShowResults(true);
    setSelectedFlight(null); // Clear any previously selected flight
  
    try {
      // Validate required fields
      if (!fromLocation || !toLocation || !departureDate || (tripType === "roundTrip" && !returnDate)) {
        throw new Error("Missing required search parameters");
      }
  
      // Extract airport codes if they exist in the strings
      const fromCode = extractAirportCode(fromLocation);
      const toCode = extractAirportCode(toLocation);
  
      // Ensure dates are in the correct format
      const formattedDepartureDate = formatDate(departureDate);
      const formattedReturnDate = tripType === "roundTrip" ? formatDate(returnDate) : null;
  
      const searchParams = {
        fromCode,
        toCode,
        departureDate: formattedDepartureDate,
        returnDate: formattedReturnDate,
        adults: passengers,
        cabinClass: cabinClass.toLowerCase().replace(" ", "_"), // convert "Premium Economy" to "premium_economy"
        tripType
      };
  
      console.log("Searching flights with params:", searchParams);
      const results = await searchFlights(searchParams);
      setSearchResults(results);
      
      
      console.log(`Found ${results.length} flights matching search criteria`);
      
    
      setTimeout(() => {
        window.scrollTo({
          top: document.querySelector('.home').scrollHeight / 2,
          behavior: 'smooth'
        });
      }, 100);
    } catch (error) {
      const errorMessage = handleSearchError(error);
      setSearchError(errorMessage);
      console.error("Flight search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchError = (error) => {
    console.error("Flight search error:", error);
    
   
    if (error.message?.includes("Missing required search parameters")) {
      return "Please fill in all required fields (From, To, and Departure date).";
    } else if (error.message?.includes("Network")) {
      return "Network error. Please check your internet connection and try again.";
    } else if (error.response && error.response.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    } else if (error.message?.includes("API key")) {
      return "API authentication error. Please try again later.";
    }
    
    return error.message || "Failed to search flights. Please try again.";
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };


  const formatPrice = (price, currency = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };
  

  const sortFlights = (flights) => {
    if (!flights) return [];
    
    switch (sortOption) {
      case "price":
        return [...flights].sort((a, b) => a.price.total - b.price.total);
      case "duration":
        return [...flights].sort((a, b) => a.duration - b.duration);
      case "departure":
        return [...flights].sort((a, b) => {
          const timeA = a.departure?.time || "00:00";
          const timeB = b.departure?.time || "00:00";
          return timeA.localeCompare(timeB);
        });
      case "arrival":
        return [...flights].sort((a, b) => {
          const timeA = a.arrival?.time || "00:00";
          const timeB = b.arrival?.time || "00:00";
          return timeA.localeCompare(timeB);
        });
      default:
        return flights;
    }
  };

  // Format time from 24h to 12h format
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    getCurrentLocation();
    
    // Initialize with today's date and tomorrow for return
    const today = new Date();
    setDepartureDate(today.toISOString().split('T')[0]);
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setReturnDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (fromLocation.length > 1) {
        fetchAirportSuggestions(fromLocation).then(setFromSuggestions);
      } else {
        setFromSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fromLocation]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (toLocation.length > 1) {
        fetchAirportSuggestions(toLocation).then(setToSuggestions);
      } else {
        setToSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [toLocation]);

  return (
    <div
      className={`home w-full flex flex-col items-center justify-start px-4 py-8 duration-300 pb-20 ${
        darkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800"
          : "bg-gradient-to-b from-blue-50 to-white"
      }`}
    >
      <div className="hometop md:h-[200px] w-full"></div>
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1
            className={`text-4xl font-bold mb-2 duration-300 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            FlyEasy
          </h1>
          <p
            className={`text-lg duration-300 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Find the best flights at the best prices
          </p>
        </div>

        <div
          className={`rounded-lg shadow-xl p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <form onSubmit={handleSearchSubmit}>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTripType("roundTrip")}
                  className={`px-4 py-2 text-sm ${
                    tripType === "roundTrip"
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Round trip
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("oneWay")}
                  className={`px-4 py-2 text-sm ${
                    tripType === "oneWay"
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  One way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("multiCity")}
                  className={`px-4 py-2 text-sm ${
                    tripType === "multiCity"
                      ? "bg-blue-600 text-white"
                      : darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Multi-city
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  className={`flex items-center px-4 py-2 rounded-md text-sm ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={() =>
                    setShowPassengerDropdown(!showPassengerDropdown)
                  }
                >
                  <Users size={16} className="mr-2" />
                  {passengers} {passengers === 1 ? "passenger" : "passengers"}
                </button>
                {showPassengerDropdown && (
                  <div
                    className={`absolute top-full mt-1 w-56 rounded-md shadow-lg z-10 ${
                      darkMode
                        ? "bg-gray-700"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="p-3 flex items-center justify-between">
                      <span
                        className={darkMode ? "text-white" : "text-gray-700"}
                      >
                        Passengers
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`w-6 h-6 rounded ${
                            darkMode
                              ? "bg-gray-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                          onClick={() =>
                            setPassengers(Math.max(1, passengers - 1))
                          }
                        >
                          -
                        </button>
                        <span
                          className={darkMode ? "text-white" : "text-gray-700"}
                        >
                          {passengers}
                        </span>
                        <button
                          type="button"
                          className={`w-6 h-6 rounded ${
                            darkMode
                              ? "bg-gray-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                          onClick={() => setPassengers(passengers + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md text-sm ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => setShowCabinDropdown(!showCabinDropdown)}
                >
                  {cabinClass}
                </button>
                {showCabinDropdown && (
                  <div
                    className={`absolute top-full mt-1 w-48 rounded-md shadow-lg z-10 ${
                      darkMode
                        ? "bg-gray-700"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="py-1">
                      {["Economy", "Premium Economy", "Business", "First"].map(
                        (cabin) => (
                          <button
                            key={cabin}
                            type="button"
                            className={`block px-4 py-2 text-left w-full ${
                              darkMode
                                ? "text-white hover:bg-gray-600"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              setCabinClass(cabin);
                              setShowCabinDropdown(false);
                            }}
                          >
                            {cabin}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row w-full md:gap-6 text-left">
              <div className="flex flex-col md:flex-row md:space-x-4 mb-4 w-full">
                <div className="flex-1 mb-4 md:mb-0 relative">
                  <div
                    className={`rounded-md p-3 ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <label
                        className={`block text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        From
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isLoadingLocation}
                        className={`text-xs px-2 py-1 rounded ${
                          darkMode
                            ? "text-blue-300 hover:bg-gray-600"
                            : "text-blue-600 hover:bg-gray-200"
                        } ${isLoadingLocation ? "animate-pulse" : ""}
                      `}
                      >
                        {isLoadingLocation
                          ? "Getting location..."
                          : "Use my location"}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="City or airport"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className={`w-full ring-0 border-0 ${
                        darkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-100 text-black"
                      }`}
                    />
                    {fromSuggestions.length > 0 && (
                      <ul
                        className={`absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto rounded-md ${
                          darkMode ? "bg-gray-700" : "bg-white"
                        }`}
                      >
                        {fromSuggestions.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setFromLocation(
                                `${item.name} (${item.iata_code})`
                              );
                              setFromSuggestions([]);
                            }}
                            className={`px-4 py-2 cursor-pointer ${
                              darkMode 
                              ? "hover:bg-gray-600 text-white" 
                              : "hover:bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.name} ({item.iata_code}) - {item.city_name},{" "}
                            {item.country_name}
                          </li>
                        ))}
                      </ul>
                    )}
                    {locationError && (
                      <p className="text-red-500 text-xs mt-1">
                        {locationError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className={`p-2 rounded-full ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <ArrowLeftRight
                      size={20}
                      className={darkMode ? "text-white" : "text-gray-700"}
                    />
                  </button>
                </div>

                <div className="flex-1 relative">
                  <div
                    className={`rounded-md p-3 h-full ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <label
                      className={`block text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      To
                    </label>
                    <input
                      type="text"
                      placeholder="City or airport"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className={`w-full bg-transparent focus:outline-none ${
                        darkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    />
                    {toSuggestions.length > 0 && (
                      <ul
                        className={`absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto rounded-md ${
                          darkMode ? "bg-gray-700" : "bg-white"
                        }`}
                      >
                        {toSuggestions.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setToLocation(
                                `${item.name} (${item.iata_code})`
                              );
                              setToSuggestions([]);
                            }}
                            className={`px-4 py-2 cursor-pointer ${
                              darkMode 
                              ? "hover:bg-gray-600 text-white" 
                              : "hover:bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.name} ({item.iata_code}) - {item.city_name},{" "}
                            {item.country_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6 w-full">
              <div className="flex-1 mb-4 md:mb-0 ">
                <div
                  className={`rounded-md p-3  ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <label
                    className={`block text-xs mb-1 text-left ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Departure
                  </label>
                  <div className="flex items-center">
                    <Calendar
                      size={18}
                      className={`mr-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className={`w-full bg-transparent focus:outline-none ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {tripType === "roundTrip" && (
                <div className="flex-1 text-left">
                  <div
                    className={`rounded-md p-3 ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <label
                      className={`block text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Return
                    </label>
                    <div className="flex items-center">
                      <Calendar
                        size={18}
                        className={`mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className={`w-full bg-transparent focus:outline-none ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                        disabled={tripType !== "roundTrip"}
                        required={tripType === "roundTrip"}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSearching}
                className={`bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-medium flex items-center transition-colors ${
                  isSearching ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSearching ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} className="mr-2" />
                    Explore
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Flight Results Section */}
        {showResults && (
          <div className={`mt-8 ${darkMode ? "text-white" : "text-gray-800"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {isSearching
                  ? "Searching for flights..."
                  : searchResults
                  ? `Available Flights (${searchResults.length})`
                  : "No flights found"}
              </h2>
              
              {searchResults && searchResults.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    <Filter size={16} className="mr-2" />
                    Sort by: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                    <ChevronDown size={16} className="ml-2" />
                  </button>
                  
                  {showSortDropdown && (
                    <div
                      className={`absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg z-10 ${
                        darkMode ? "bg-gray-700" : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="py-1">
                        {["price", "duration", "departure", "arrival"].map(
                          (option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setSortOption(option);
                                setShowSortDropdown(false);
                              }}
                              className={`flex items-center justify-between px-4 py-2 text-left w-full ${
                                sortOption === option
                                  ? darkMode
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-100 text-blue-600"
                                  : darkMode
                                  ? "text-white hover:bg-gray-600"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                              {sortOption === option && (
                                <ArrowUpDown size={16} />
                              )}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {searchError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{searchError}</p>
              </div>
            )}

            {isSearching ? (
              <div className="flex justify-center items-center py-20">
                <Loader size={40} className="animate-spin text-blue-500" />
              </div>
            ) : (
              searchResults && searchResults.length > 0 && (
                <div className="space-y-4">
                  {sortFlights(searchResults).map((flight, index) => (
                    <div
                      key={index}
                      className={`rounded-lg shadow-md overflow-hidden ${
                        darkMode ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                darkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              <img 
                                src={flight.airline?.logo || "/api/placeholder/40/40"} 
                                alt={flight.airline?.name || "Airline"} 
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/40/40";
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{flight.airline?.name || "Airline"}</p>
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Flight {flight.flight_number || "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">
                              {formatPrice(flight.price?.total || 0, flight.price?.currency || "USD")}
                            </p>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              per passenger
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between mb-4">
                          <div className="flex flex-1 items-center">
                            <div className="text-center">
                              <p className="text-lg font-bold">{formatTime(flight.departure?.time || "00:00")}</p>
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {flight.departure?.airport?.code || "DEP"}
                              </p>
                            </div>

                            <div className="flex-1 px-4">
                              <div className="relative flex items-center justify-center">
                                <div className={`flex-1 h-0.5 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
                                <Plane size={20} className={`mx-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                                <div className={`flex-1 h-0.5 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>
                              </div>
                              <div className="text-center mt-1">
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {formatDuration(flight.duration || 0)}
                                </p>
                              </div>
                            </div>

                            <div className="text-center">
                              <p className="text-lg font-bold">{formatTime(flight.arrival?.time || "00:00")}</p>
                              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {flight.arrival?.airport?.code || "ARR"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center mt-4 md:mt-0 md:ml-6">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              cabinClass === "Economy" 
                                ? "bg-green-100 text-green-800" 
                                : cabinClass === "Premium Economy"
                                ? "bg-blue-100 text-blue-800"
                                : cabinClass === "Business"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {cabinClass}
                            </div>
                          </div>
                        </div>

                        <div className={`flex items-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          <Clock size={16} className="mr-1" />
                          <span>
                            {new Date(flight.departure?.date || "").toLocaleDateString()}
                          </span>
                          {flight.stops > 0 && (
                            <span className="ml-4">
                              {flight.stops} {flight.stops === 1 ? 'stop' : 'stops'}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setSelectedFlight(flight)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full text-sm font-medium transition-colors"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
        
        {/* Flight Detail Modal */}
        {selectedFlight && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div 
      className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Flight Details</h3>
          <button 
            onClick={() => setSelectedFlight(null)}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Airline Info */}
          <div className="flex items-center">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <img 
                src={selectedFlight.airline?.logo || "/api/placeholder/48/48"} 
                alt={selectedFlight.airline?.name || "Airline"} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.src = "/api/placeholder/48/48";
                }}
              />
            </div>
            <div>
              <p className="font-medium text-lg">{selectedFlight.airline?.name || "Airline"}</p>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Flight {selectedFlight.flight_number || "Unknown"}
              </p>
            </div>
          </div>
          
          {/* Price Info with breakdown */}
          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
            <div className="flex justify-between items-center mb-2">
              <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>Price per passenger</p>
              <p className="font-semibold text-blue-600">
                {formatPrice((selectedFlight.price?.total || 0), selectedFlight.price?.currency || "USD")}
              </p>
            </div>
            {passengers > 1 && (
              <div className="flex justify-between items-center mb-2">
                <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>Passengers</p>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {passengers} × {formatPrice((selectedFlight.price?.total || 0), selectedFlight.price?.currency || "USD")}
                </p>
              </div>
            )}
            <div className="border-t border-dashed mt-2 pt-2 flex justify-between items-center">
              <p className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Total price</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice((selectedFlight.price?.total || 0) * passengers, selectedFlight.price?.currency || "USD")}
              </p>
            </div>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {passengers} {passengers === 1 ? "passenger" : "passengers"}, {cabinClass}
            </p>
          </div>
          
          {/* Flight Route with more details */}
          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <div className="flex justify-between mb-6">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Departure</p>
                <p className="text-xl font-bold">{formatTime(selectedFlight.departure?.time || "00:00")}</p>
                <p>{new Date(selectedFlight.departure?.date || "").toLocaleDateString()}</p>
                <p className="font-medium">{selectedFlight.departure?.airport?.name || selectedFlight.departure?.airport?.code}</p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedFlight.departure?.airport?.code}</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formatDuration(selectedFlight.duration || 0)}
                </p>
                <div className="w-full flex items-center">
                  <div className={`flex-1 h-0.5 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                  <Plane size={20} className={`mx-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div className={`flex-1 h-0.5 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}></div>
                </div>
                <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {selectedFlight.stops > 0 ? `${selectedFlight.stops} ${selectedFlight.stops === 1 ? 'stop' : 'stops'}` : 'Direct'}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Arrival</p>
                <p className="text-xl font-bold">{formatTime(selectedFlight.arrival?.time || "00:00")}</p>
                <p>{new Date(selectedFlight.arrival?.date || "").toLocaleDateString()}</p>
                <p className="font-medium">{selectedFlight.arrival?.airport?.name || selectedFlight.arrival?.airport?.code}</p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedFlight.arrival?.airport?.code}</p>
              </div>
            </div>
            
            {/* Add cabin class and baggage info */}
            <div className={`mt-4 p-3 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Cabin</p>
                  <p className="font-medium">{selectedFlight.cabin_class?.replace('_', ' ').charAt(0).toUpperCase() + selectedFlight.cabin_class?.replace('_', ' ').slice(1) || cabinClass}</p>
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Baggage</p>
                  <p className="font-medium">Checked bag included</p>
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Cancellation</p>
                  <p className="font-medium">Refundable (Fee applies)</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button 
              onClick={() => window.alert('This is a demo application. Booking functionality is not implemented.')}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-full font-medium transition-colors w-full"
            >
              Book Now
            </button>
            <button 
              onClick={() => setSelectedFlight(null)}
              className={`py-3 px-8 rounded-full font-medium transition-colors w-full ${
                darkMode 
                ? "bg-gray-700 hover:bg-gray-600 text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        
      </div>
    </div>
  );
};

export default Home;