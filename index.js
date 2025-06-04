const os = require('os');
const express = require('express');
const cors = require('cors');
const { CommunicationIdentityClient } = require('@azure/communication-identity');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// CORS and ACS setup
app.use(cors());

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
const client = new CommunicationIdentityClient(connectionString);

app.get('/token', async (req, res) => {
  try {
    const user = await client.createUser();
    const tokenResponse = await client.getToken(user, ["voip"]);
    res.json({
      token: tokenResponse.token,
      userId: user.communicationUserId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating token');
  }
});

// Dynamically get hostname/IP
app.listen(port, () => {
  const interfaces = os.networkInterfaces();
  let hostAddress = 'localhost';

  for (let iface of Object.values(interfaces)) {
    for (let i of iface) {
      if (i.family === 'IPv4' && !i.internal) {
        hostAddress = i.address;
        break;
      }
    }
  }

  console.log(`✅ ACS backend server running at http://${hostAddress}:${port}`);
});
