const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const getAccessToken = require('./Auth');
const axios = require("axios");
const userExist = require('./userExist');
const createAppointment = require('./createAppointment');
const userData  = require('./userData');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const calendarId = process.env.JR_MAIN_CALENDAR_ID;
const APPOINTMENT_ENDPOINT = process.env.APPOINTMENT_ENDPOINT;
const NX_PRACTICE_ID = process.env.NX_PRACTICE_ID;

/** Load or request authorization */
async function authorize() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch {
    const client = await authenticate({ scopes: SCOPES, keyfilePath: CREDENTIALS_PATH });
    await fs.writeFile(TOKEN_PATH, JSON.stringify(client.credentials));
    return client;
  }
}

/** Extract patient info from event description */
function extractPatientInfo(text) {
  const nameMatch = text.match(/<b>Booked by<\/b>\s*(?:\n)?([\w'-]+)\s+([\w'-]+)/);
  const dobMatch = text.match(/<br><b>Date of Birth;.*?<\/b>\s*(\d{8}|\d{2}\/\d{2}\/\d{4})/);

  if (!nameMatch || !dobMatch) throw new Error("Could not extract patient information.");

  const firstName = nameMatch[1], lastName = nameMatch[2];
  const rawDOB = dobMatch[1];

  const formattedDOB = rawDOB.includes("/") ? rawDOB : `${rawDOB.substring(0, 2)}/${rawDOB.substring(2, 4)}/${rawDOB.substring(4)}`;

  return { firstName, lastName, dob: formattedDOB };
}

/** Process patient info & create appointment if necessary */
async function processPatientInfo(auth, eventId) {
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const { data: { description } } = await calendar.events.get({ calendarId, eventId });
    const patientInfo = extractPatientInfo(description);
    const userPlus = await userData(patientInfo.firstName, patientInfo.lastName, patientInfo.dob);
    console.log('userPlus: ', userPlus.entry[0].resource);

    console.log("Extracted Patient Info:", patientInfo);

    if (await userExist(patientInfo.firstName, patientInfo.lastName, patientInfo.dob)) {
      // console.log("User exists. Creating appointment...");

      const appointmentData = {
        resourceType: "Appointment",
        extension: [
          { url: "https://select.nextech-api.com/api/structuredefinition/appointment-type", valueReference: { reference: "appointment-type/25", display: "Skin Care Established" } },
          { url: "https://select.nextech-api.com/api/structuredefinition/appointment-purpose", valueReference: { reference: "appointment-purpose/202", display: "Glycolic Peel" } },
          { url: "https://select.nextech-api.com/api/structuredefinition/appointment-schedule", valueString: "hold" }
        ],
        status: "pending",
        start: "2025-08-28T13:00:00-05:00",
        end: "2025-08-28T14:30:00-05:00",
        comment: "New - NPV for Jorawer Singh",
        participant: [
          { actor: { reference: "Location/1", display: "Singh Vision" }, status: "accepted" },
          { actor: { reference: "Practitioner/1", display: "Jorawer Singh" }, status: "accepted" },
          { actor: { reference: `Patient/${patientInfo.firstName}_${patientInfo.lastName}`, display: `${patientInfo.firstName} ${patientInfo.lastName}` }, status: "accepted" }
        ],
        contained: [
          {
            resourceType: "Patient",
            name: [{ use: 'official', text: `${patientInfo.firstName} ${patientInfo.lastName}`, family: patientInfo.lastName, given: [patientInfo.firstName] }],
            birthDate: patientInfo.dob.split('/').reverse().join('-') // Converts MM/DD/YYYY → YYYY-MM-DD
          }
        ]
      };

      // await createAppointment(appointmentData);
      console.log("Appointment Created: EXIST", appointmentData);
    } else {
      const appointmentData = {
        resourceType: "Appointment",
        extension: [
          { url: "https://select.nextech-api.com/api/structuredefinition/appointment-type", valueReference: { reference: "appointment-type/25", display: "Skin Care Established" } },
          { url: "https://select.nextech-api.com/api/structuredefinition/appointment-purpose", valueReference: { reference: "appointment-purpose/202", display: "Glycolic Peel" } },
          { url: "https://select.nextech-api.com/api/structuredefinition/appointment-schedule", valueString: "hold" }
        ],
        status: "pending",
        start: "2025-08-28T13:00:00-05:00",
        end: "2025-08-28T14:30:00-05:00",
        comment: "New - NPV for Jorawer Singh",
        participant: [
          { actor: { reference: "Location/1", display: "Singh Vision" }, status: "accepted" },
          { actor: { reference: "Practitioner/1", display: "Jorawer Singh" }, status: "accepted" },
          { actor: { reference: `Patient/${patientInfo.firstName}_${patientInfo.lastName}`, display: `${patientInfo.firstName} ${patientInfo.lastName}` }, status: "accepted" }
        ],
        contained: [
          {
            resourceType: "Patient",
            name: [{ text: `${patientInfo.firstName} ${patientInfo.lastName}`, family: patientInfo.lastName, given: [patientInfo.firstName] }],
            birthDate: patientInfo.dob.split('/').reverse().join('-') // Converts MM/DD/YYYY → YYYY-MM-DD
          }
        ]
      };

      // await createAppointment(appointmentData);
      console.log("Appointment Created: No Exist", appointmentData);
    }
  } catch (error) {
    console.error(`Error processing event ${eventId}:`, error.message);
  }
}

// Run the script
authorize().then(auth => processPatientInfo(auth, 'cdunfilnjr8r81vng868jqdc2s')).catch(console.error);
