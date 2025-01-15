const axios = require('axios');
const getAccessToken = require('./auth'); // Import the getAccessToken function
require('dotenv').config(); // Load environment variables

// Google Calendar API endpoint
const CALENDAR_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// List the next 10 upcoming events from the user's calendar
const listUpcomingEvents = async () => {
  try {
    // Get the access token using the existing auth mechanism
    const accessToken = await getAccessToken("google");

    // Set the query parameters for the API request
    const params = {
      timeMin: new Date().toISOString(), // Start time for events
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime',
    };

    // Make the API call to fetch calendar events
    const response = await axios.get(CALENDAR_EVENTS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Pass the access token
      },
      params, // Query parameters
    });

    const events = response.data.items;

    if (!events || events.length === 0) {
      console.log('No upcoming events found.');
      return;
    }

    // Log each event's summary and start time
    console.log('Upcoming Events:');
    events.forEach((event) => {
      const start = event.start.dateTime || event.start.date;
      console.log(`${event.summary} (${start})`);
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error.response?.data || error.message);
  }
};

// Call the function to list upcoming events
listUpcomingEvents();
