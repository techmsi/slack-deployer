// Load Environment Variables
require('dotenv').config();
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 5000));

// Tokens
const apikey = process.env.WU_ACCESS; // WU API key; will be set in Heroku
const slackToken = process.env.SLACK_VERIFICATION_TOKEN;

const ENDPOINT = `http://api.openweathermap.org/data/2.5/weather?appid=${apikey}`;
const buttonMessageJSON = require('./data/buttonMessage.json');

const { getWeather, getWeatherMessage } = weather = require('./weather/');
const { sendMessageToSlack } = slack = require('./slack/');

// Handle interactive message requests - user clicks a btn that returns cityId
const handleButtonRequests = (req, res) => {
  res.status(200).end(); // best practice to respond with 200 status

  // Process payload
  const { user, actions, response_url: responseURL } = JSON.parse(req.body.payload);
  const { value: cityId, name } = actions[0];
  const url = `${ENDPOINT}&id=${cityId}`;

  console.log(`${user.name} clicked: ${name} (${cityId})`);
  getWeather(url, responseURL);
};

const sendTextOnSlack = (req, res) => {
  res.status(200).end();

  const cityName = req.body.text || 'New York';
  const url = `${ENDPOINT}&q=${cityName}`;

  const { token, response_url: responseURL } = req.body;

  if (token !== slackToken) {
    res.status(403).end('Access forbidden');
  } else {
    getWeather(url, responseURL);
  }
};

// Send message with buttons after excuting `/weather-buttons`
const sendButtonsOnSlack = (req, res) => {
  res.status(200).end();

  const { token, response_url: responseURL } = req.body;

  if (token !== slackToken) {
    res.status(403).end('Access forbidden');
  } else {
    sendMessageToSlack(responseURL, buttonMessageJSON);
  }
};

// For testing that the app is running
app.get('/', function (req, res) {
  res.send('Running!!');
});

// Triggered POST route for slash command - `/weather-buttons`
app.post('/slash/weather-buttons', urlencodedParser, sendButtonsOnSlack);
app.post('/slash/weather', urlencodedParser, sendTextOnSlack);
// Receive and respond to button clicks
app.post('/slack/actions', urlencodedParser, handleButtonRequests);

// == Start server ==//
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
