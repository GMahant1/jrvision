const getAccessToken = require('./Auth'); // Import getAccessToken from auth.js
require('dotenv').config();
const axios = require("axios");

const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

const patientExist = async (firstName, lastName, birthDate) => {
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

    return response.data.total === 1;
  } catch (error) {
    console.error("Error fetching data with token:", error);
    throw error;
  }
};

// Call the function to get the access token
// patientExist(firstName, lastName, birthDate);

module.exports = patientExist;