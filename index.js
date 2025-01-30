const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
require('dotenv').config();
const fetchAppointment = require('./Appointment');
const fetchPatient = require('./Patient');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const calendarId = process.env.JR_MAIN_CALENDAR_ID

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  const res = await calendar.events.list({
    calendarId: calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  console.log('Upcoming 10 events:');
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}, ID: ${event.id}`);
  });
}

/**
 * Deletes a specfic event for a calendar the user has access to.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function deleteEvent(auth, calendarId, eventId) {
  const calendar = google.calendar({version: 'v3', auth});
  try {
    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
    });
    console.log(`Event with ID ${eventId} deleted successfully.`);
  } catch (err) {
    console.error('Error deleting event: ', err);
  }
}

/**
 * Lists all calendars the user has access to.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listCalendars(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  const res = await calendar.calendarList.list();
  const calendars = res.data.items;
  if (!calendars || calendars.length === 0) {
    console.log('No calendars found.');
    return;
  }
  console.log('Calendars:');
  calendars.forEach((calendar) => {
    console.log(`- ${calendar.summary} (ID: ${calendar.id})`);
  });
}

/**
 * Creates an event on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function createEvent(auth) {
  const calendar = google.calendar({version: 'v3', auth});

  const event = {
    summary: 'Not Sure What to Put Here or What you Will SEe',
    location: '12703 Apollo Dr, Dale City, VA 22193, USA',
    description: 'Follow-up - F/u diabetic eye exam for Jorawer Singh',
    start: {
      dateTime: '2026-11-24T15:00:00-05:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2026-11-24T15:30:00-05:00',
      timeZone: 'America/Los_Angeles',
    },
    recurrence: [
      'RRULE:FREQ=DAILY;COUNT=2',
    ],
    attendees: [
      {email: 'PLEASE@example.com'},
      {email: 'WORK@example.com'},
    ],
    reminders: {
      useDefault: false,
      overrides: [
        {method: 'email', minutes: 24 * 60},
        {method: 'popup', minutes: 10},
      ],
    },
  };

  try {
    const res = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });
    console.log('Event created: %s', res.data.htmlLink);
  } catch (err) {
    console.error('Error creating event: ', err);
  }
}

// new test function for mass input 
async function createEventsFromAppointments(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  const appointment_list = await fetchAppointment();

  for (const appointment of appointment_list) {
    // console.log(appointment);
    // break;
    const appointmentTypeObject = appointment.extra.find(item => item.url === 'appointment-type');
    const event = {
      summary: `${appointment.participant[0]} - ${appointmentTypeObject.valueReference.display}` ?? 'ERROR',
      location: '12703 Apollo Dr, Dale City, VA 22193, USA',
      description: appointment.description || 'No Description Provided',
      start: {
        dateTime: appointment.start, // Must be ISO 8601 format
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: appointment.end, // Must be ISO 8601 format
        timeZone: 'America/New_York',
      },
      // attendees: appointment.attendees?.map(email => ({email})) || [],
      reminders: {
        useDefault: false,
        overrides: [
          {method: 'email', minutes: 24 * 60},
          {method: 'popup', minutes: 10},
        ],
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: calendarId,
        resource: event,
      });
      console.log(`Event created: ${response.data.htmlLink}`);
    } catch (error) {
      console.error(`Error creating event for ${appointment.id || 'Untitled Event'}:`, error);
    }
  }
}

// Choose the function to run after authorization.
authorize()
  .then(async (auth) => {
    // await listCalendars(auth);

    await listEvents(auth);

    // await createEvent(auth);

    // deleteEvent(auth, calendarId, 'gchdeq1djmsvcpn8ab8r25070o');

    // await createEventsFromAppointments(auth);
  })
  .catch(console.error);
