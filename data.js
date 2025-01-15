// dataFetch.js

const getAccessToken = require('./auth'); // Import getAccessToken from auth.js
require('dotenv').config();
const axios = require("axios");

// Load environment variables
const API_ENDPOINT = process.env.API_ENDPOINT;
const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

const fetchDataWithAuthToken = async () => {
  try {
    // Get the auth token
    const token = await getAccessToken();
    
    // Make the GET request with the token
    const response = await axios.get(API_ENDPOINT, {
      headers: {
        "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
        "nx-practice-id": NX_PRACTICE_ID,
      },
    });

    console.log("Fetched data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data with token:", error);
    throw error;
  }
};

// Call the function to get the access token
fetchDataWithAuthToken();