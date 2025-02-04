const getAccessToken = require('./Auth'); // Import getAccessToken from auth.js
require('dotenv').config();
const axios = require("axios");

// Load environment variables
const firstName = 'Young';
const lastName = 'Pitcher';
const birthDate = '1954-09-20';
const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

const fetchPatient = async (firstName, lastName, birthDate) => {
  try {
    // Get the auth token
    const token = await getAccessToken();

    // Build Query
    const endpoint = `https://api.pm.nextech.com/api/Patient?family=${lastName}&given=${firstName}&birthdate=eq${birthDate}`;

    // Make the GET request with the token
    const response = await axios.get(endpoint, {
      headers: {
        "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
        "nx-practice-id": NX_PRACTICE_ID,
      },
    });

    console.log(response.data.total);

    // console.log("Fetched data:", response.data);
    return response.data.total;
  } catch (error) {
    console.error("Error fetching data with token:", error);
    throw error;
  }
};

// Call the function to get the access token
fetchPatient(firstName, lastName, birthDate);

module.exports = fetchPatient;