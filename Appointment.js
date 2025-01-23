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
          description: x.resource.description,
          start: x.resource.start,
          end: x.resource.end,
          participant: [x.resource.participant[0].actor.reference, x.resource.participant[1].actor.reference, x.resource.participant[2].actor.display],
          example: [x.resource.extension[0], x.resource.extension[1], x.resource.extension[2]]
          // participant: x.resource.participant[0].actor.reference,
        });
      });
    }

    // console.log(appointment_list[0]);
    // console.log(response.data.entry);

    //console.log("Fetched data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data with token:", error);
    throw error;
  }
};

// Call the function to get the access token
fetchAppointment();

module.exports = fetchAppointment;