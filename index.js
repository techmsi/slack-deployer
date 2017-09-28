// Load Environment Variables
require('dotenv').config();
const express = require('express');
const app = express();
const request = require('request');

const apikey = process.env.WU_ACCESS; // WU API key; will be set in Heroku

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use port is set in the environment variable, or 9001 if it isn’t set.
app.set('port', (process.env.PORT || 9001));

// for testing that the app is running
app.get('/', function (req, res) {
  res.send('Running!!');
});

// app.post is triggered when a POST request is sent to the URL ‘/post’
app.post('/post', function (req, res) {
  // take a message from Slack slash command
  console.log("req.body.text ", req.body.text);
  var cityName = req.body.text || 'New York';
  var ENDPOINT = `http://api.openweathermap.org/data/2.5/weather?appid=${apikey}&q=${cityName}`;

  request(ENDPOINT, function (error, response, body) {
    console.log("Going to ENDPOINT ", ENDPOINT);
    
    if (!error && response.statusCode === 200) {
      const data = JSON.parse(body);
      const { name: location, weather: { main: weatherCondition, icon }, main: { temp: temperature } } = data;

      const body = {
        response_type: 'in_channel',
        attachments: [
          {
            'text': `
              Location: ${location}
              Temperature: ${temperature}
              Condition: ${weatherCondition}
              `,
            'image_url': icon
          }
        ]
      };
      res.send(body);
    }
  });
});

// tells Node which port to listen on
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
