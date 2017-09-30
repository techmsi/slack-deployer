const request = require('request');

function _sendErrorMessage (error, responseURL) {
  console.log('Error ', error);

  const errorMessage = {
    text: `Sorry, there was a problem with your response.`,
    replace_original: false
  };

  sendMessageToSlack(responseURL, errorMessage);
}

function sendMessageToSlack (responseURL, JSONmessage) {
  const postOptions = {
    uri: responseURL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: JSONmessage
  };

  request(postOptions, (error, response, body) => {
    if (error) {
      _sendErrorMessage(error, responseURL);
    }
  });
}

module.exports = { sendMessageToSlack };
