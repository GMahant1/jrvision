const sendSMS = require('./twilioBase');

const recipientPhone = '+19087212178'; // Replace with the recipient's phone number
const message = 'Hey its Gaurav. This is your Twilio account number !';

sendSMS(recipientPhone, message)
  .then(response => console.log('SMS sent:', response))
  .catch(error => console.error('SMS failed:', error));
