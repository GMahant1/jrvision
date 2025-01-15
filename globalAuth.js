require('dotenv').config(); // Load environment variables from .env

// Function to dynamically retrieve environment variables based on a prefix
const getEnvConfig = (prefix) => {
  return {
    CLIENT_ID: process.env[`${prefix.toUpperCase()}_CLIENT_ID`],
    CLIENT_SECRET: process.env[`${prefix.toUpperCase()}_CLIENT_SECRET`],
    TOKEN_ENDPOINT: process.env[`${prefix.toUpperCase()}_TOKEN_ENDPOINT`],
    RESOURCE: process.env[`${prefix.toUpperCase()}_RESOURCE`],
  };
};

// Create the function to fetch the access token
const getAccessToken = async (provider) => {
  // Load the environment variables dynamically based on the provider
  const { CLIENT_ID, CLIENT_SECRET, TOKEN_ENDPOINT, RESOURCE } = getEnvConfig(provider);

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    resource: RESOURCE, 
  });

  try {
    // Make the POST request to get the access token
    const response = await axios.post(TOKEN_ENDPOINT, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Log the response from the API
    console.log("Access Token:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

// Example usage
// const provider = "google"; // Change this to "nextech" or other prefixes
getAccessToken(provider);
