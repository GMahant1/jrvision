// auth.js

// Import required modules
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env

// Retrieve sensitive info from the .env file
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TOKEN_ENDPOINT = process.env.TOKEN_ENDPOINT;

// Create the function to fetch the access token
const getAccessToken = async () => {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    resource: "3676d991-6539-461e-b2cc-d38a1fe63f30", // Example resource, replace with actual
  });

  try {
    // Make the POST request to get the access token
    const response = await axios.post(TOKEN_ENDPOINT, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    // Log the response from the API
    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
  }
};

// Call the function to get the access token
getAccessToken();
