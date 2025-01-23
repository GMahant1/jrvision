const getAccessToken = require('./Auth'); // Import getAccessToken from auth.js
require('dotenv').config();
const axios = require("axios");

// Load environment variables
const APPOINTMENT_ENDPOINT = process.env.APPOINTMENT_ENDPOINT;
const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

const fetchAppointment = async () => {
  try {
    // Get the auth token
    const token = await getAccessToken();
    
    // Make the GET request with the token
    const response = await axios.get(APPOINTMENT_ENDPOINT, {
      headers: {
        "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
        "nx-practice-id": NX_PRACTICE_ID,
      },
    });

    const appointment_list = [];

    if (response.data) {
      response.data.entry.map((x) => {
        appointment_list.push({
          id: x.resource.id,
          status: x.resource.status,
          description: x.resource.description,
          start: x.resource.start,
          end: x.resource.end,
          participant: [x.resource.participant[0].actor.display, x.resource.participant[1].actor.reference, x.resource.participant[2].actor.display],
          extra: x.resource.extension
        });
      });
    }
    const count = response.data.total;
    // APPOINTMENT_ENDPOINT=https://api.pm.nextech.com/api/Appointment?date=lt2025-02-01&date=gt2025-01-24
    // console.log(response.data.entry[0].resource);
    // console.log(appointment_list);
    return appointment_list;
  } catch (error) {
    console.error("Error fetching data with token:", error);
    throw error;
  }
};

// Call the function to get the access token
fetchAppointment();

module.exports = fetchAppointment;