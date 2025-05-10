export const fetchAirportSuggestions = async (query) => {
    const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/auto-complete?query=${query}`;
    
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'd9f4b8263fmsh440d31c9f8ad664p154aa3jsn72b04cbfdabe',
        'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com'
      }
    };
  
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result?.data || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  