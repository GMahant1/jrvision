// dataFetch.js

const getAccessToken = require('./nexTechAuth'); // Import getAccessToken from auth.js
require('dotenv').config();
const axios = require("axios");

// Load environment variables
const PATIENT_ENDPOINT = process.env.PATIENT_ENDPOINT;
const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

const fetchDataWithAuthToken = async () => {
  try {
    // Get the auth token
    const token = await getAccessToken();

    // Make the GET request with the token
    const response = await axios.get(PATIENT_ENDPOINT, {
      headers: {
        "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
        "nx-practice-id": NX_PRACTICE_ID,
      },
    });

    const name_and_id = [];

    if (response.data) {
      response.data.entry.map((x) => {
        name_and_id.push({
          name: x.resource.name[0].text,
          id: x.resource.id,
        });
      });
    }

    console.log(name_and_id);

    // console.log("Fetched data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data with token:", error);
    throw error;
  }
};

// Call the function to get the access token
fetchDataWithAuthToken();