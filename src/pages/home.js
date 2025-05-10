import { useState, useContext, useEffect } from "react";
import { Search, ArrowLeftRight, Calendar, Users } from "lucide-react";
import { fetchAirportSuggestions } from "../utils/api/skyScrapper";
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

          // Attempt to get city name from coordinates using reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );

          if (response.ok) {
            const data = await response.json();
            // Extract city name from address components
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
            // If reverse geocoding fails, just use the coordinates
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log({
      tripType,
      passengers,
      cabinClass,
      fromLocation,
      toLocation,
      departureDate,
      returnDate,
    });
  };

  useEffect(() => {
    getCurrentLocation();
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
      className={` home w-full min-h-screen flex flex-col items-center justify-start px-4 py-16 duration-300 ${
        darkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800"
          : "bg-gradient-to-b from-blue-50 to-white"
      }`}
    >
      <div className="hometop md:h-[200px] w-full"></div>
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className={`text-4xl font-bold mb-2 duraiton-300 ${
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

            <div className="flex flex-col md:flex-row w-full md:gap-6 text-left ">
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
                        className={`absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto focus:ring-0 focus:border-0
                          
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
                            className="focus:ring-0"
                        
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

                <div className="flex-1 ">
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
                      className={`w-full bg-transparent text-lg focus:outline-none ${
                        darkMode
                          ? "text-white placeholder-gray-500"
                          : "text-gray-800 placeholder-gray-400"
                      }`}
                    />
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
                      className={`block text-xs mb-1 ${
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
                      />
                    </div>
                  </div>
                </div>

                {tripType === "roundTrip" && (
                  <div className="flex-1">
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
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-medium flex items-center transition-colors"
              >
                <Search size={18} className="mr-2" />
                Explore
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
