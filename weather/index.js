const request = require('request');
const { sendMessageToSlack } = slack = require('../slack/');

function getWeatherMessage (data) {
  const ASSET_URL = `http://openweathermap.org/img/w`;

  const { name: location, weather, main: { temp: temperature } } = data;
  const { main: weatherCondition, icon } = weather[0];

  const text = `Location: ${location}\nTemperature: ${temperature}\nCondition: ${weatherCondition}`;

  return {
    replace_original: false,
    response_type: 'in_channel',
    attachments: [
      {
        text,
        image_url: `${ASSET_URL}/${icon}.png`
      }
    ]
  };
}

function getWeather (url, responseURL) {
  request(url, function (error, response, body) {
    console.log('\n' + url + '\n');

    if (!error && response.statusCode === 200) {
      const data = JSON.parse(response.body);
      const message = getWeatherMessage(data);

      sendMessageToSlack(responseURL, message);
    }
  });
}

module.exports = { getWeather, getWeatherMessage };
