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
    /// to do 
    //  response.data.entry(map).resouce.extension[0] 
    //  response.data.entry(map).resouce.extension[2] 
    //  response.data.entry(map).resouce.extension[3] 
    //  response.data.entry(map).resouce.extension[4] 
    //  response.data.entry(map).resouce.extension[5] 
    //  response.data.entry(map).resouce.extension[6] 
    //  response.data.entry(map).resouce.extension[8] 
    //  response.data.entry(map).resouce.identifier[0].value 
    //  response.data.entry(map).resouce.identifier[1].value 
    //  response.data.entry(map).resouce.name[0].family 
    //  response.data.entry(map).resouce.name[0].given 
    //  response.data.entry(map).resouce.telecom[0].*
    //  response.data.entry(map).resouce.gender
    //  response.data.entry(map).resouce.birthDate
    //  response.data.entry(map).resouce.address[0].*
    //  response.data.entry(map).resouce.maritalStatus.coding.OBJ
    //  response.data.entry(map).resouce.maritalStatus.text
    //  response.data.entry(map).resouce.communication[0].language.OBJ
    //  response.data.entry(map).resouce.communication[0].preferred.BOOL
    //  response.data.entry(map).resouce.generalPractitioner[0].reference, display



    console.log(name_and_id);
    // console.log(response.data.entry[0].resource);

    // console.log("Fetched data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data with token:", error);
    throw error;
  }
};

// Call the function to get the access token
fetchDataWithAuthToken();