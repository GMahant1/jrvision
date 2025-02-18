const getAccessToken = require('./Auth'); // Import getAccessToken from auth.js
require('dotenv').config();
const axios = require("axios");

// Load environment variables
const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

const createPatient = async (createPatientData) => {
  try {
    // Get the auth token
    const token = await getAccessToken();

    // Define endpoint
    const endpoint = 'https://api.pm.nextech.com/api/Patient/';

    // Make the POST request to create an appointment
    const response = await axios.post(endpoint, createPatientData, {
      headers: {
        "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
        "nx-practice-id": NX_PRACTICE_ID,
        "Content-Type": "application/json",
      },
    });

    console.log("Paitent created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating patient:", error.response?.data || error.message);
    throw error;
  }
};

// Example usage:
const newPatient = {
  "resourceType": "Patient",
    "name": [
        {
            "use": "official",
            "family": "AAAAAA",
            "given": [
                "AAAAAA"
            ]
        }
    ],
    "telecom": [
        {
            "system": "phone",
            "value": "(780)802-7373",
            "use": "home"
        },
        {
            "system": "email",
            "value": "gmail@internal.com"
        }
    ],
    "birthDate": "2008-08-28",
    "address": [
        {   "use": "home",
            "postalCode": "10016"
        }
    ]
};

// Call the function to create the appointment
createPatient(newPatient)
  .then(response => console.log("Created Patient:", response))
  .catch(err => console.error(err));

module.exports = createPatient;
