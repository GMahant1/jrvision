const getAccessToken = require('./Auth'); // Import getAccessToken from auth.js
require('dotenv').config();
const axios = require("axios");

// Load environment variables
const APPOINTMENT_ENDPOINT = process.env.APPOINTMENT_ENDPOINT;
const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

const createAppointment = async (appointmentData) => {
  try {
    // Get the auth token
    const token = await getAccessToken();

    // Make the POST request to create an appointment
    const response = await axios.post(APPOINTMENT_ENDPOINT, appointmentData, {
      headers: {
        "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
        "nx-practice-id": NX_PRACTICE_ID,
        "Content-Type": "application/json",
      },
    });

    console.log("Appointment created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating appointment:", error.response?.data || error.message);
    throw error;
  }
};

// Example usage:
const newAppointment = {
  "resourceType": "Appointment",
  "extension": [
    {
      "url": "https://select.nextech-api.com/api/structuredefinition/appointment-type",
      "valueReference": {
        "reference": "appointment-type/25",
        "display": "Skin Care Established"
      }
    },
    {
      "url": "https://select.nextech-api.com/api/structuredefinition/appointment-purpose",
      "valueReference": {
        "reference": "appointment-purpose/202",
        "display": "Glycolic Peel"
      }
    },
    {
      "url": "https://select.nextech-api.com/api/structuredefinition/appointment-schedule",
      "valueString": "hold"
    }
  ],
  "status": "proposed",
  "start": "2025-02-01T18:00:00-05:00",
  "end": "2025-02-01T18:30:00-05:00",
  "comment": "COMMENT GOES HERE",
  "participant": [
    {
      "actor": {
        "reference": "Location/1",
        "display": "Singh Vision"
      },
      "status": "accepted"
    },
    {
      "actor": {
        "reference": "Practitioner/1",
        "display": "Jorawer Singh"
      },
      "status": "accepted"
    },
    {
      "actor": {
        "reference": "Patient/555",
        "display": "LEBRON JAMES"
      },
      "status": "accepted"
    }
  ],
  "contained": [
    {
      "resourceType": "Patient",
      "name": [
        {
          "text": "LEBRON JAMES",
          "family": "JAMES",
          "given": [
            "LEBRON",
            "R"
          ]
        }
      ],
      "address": [
        {
          "use": "home",
          "postalCode": "77014"
        }
      ],
      "telecom": [
        {
          "system": "email",
          "value": "LEBRONJAMES@ISTHERETYPECHECKINGORANYTEXTWORKS.com"
        },
        {
          "system": "phone",
          "use": "home",
          "value": "TYPE CHECKING OR ANYTHING GOES"
        }
      ],
      "birthDate": "1968-02-04",
    }
  ]

};

// Call the function to create the appointment
// createAppointment(newAppointment)
//   .then(response => console.log("Created Appointment:", response))
//   .catch(err => console.error(err));

module.exports = createAppointment;
