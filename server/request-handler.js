var msgObj = require('./message.js')

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'x-parse-application-id, x-parse-rest-api-key, content-type, accept',
  'access-control-max-age': 10,
  'Content-Type': 'application/json'
};

var sendResponse = function (response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
}

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  if (request.method === 'OPTIONS') {
      statusCode = 200;
      sendResponse(response, null, statusCode)
  } else if (request.method === 'GET') {
    if (request.url === '/classes/messages' || request.url ===  '/classes/messages?order=-createdAt') {
      statusCode = 200;
      sendResponse(response, msgObj.messages, statusCode);
    }
  } else if (request.method === 'POST') {
      statusCode = 201;
      request.on('data', function(data) {
        var parsedBody = JSON.parse(data);
        msgObj.messages.results.push(parsedBody);
        sendResponse(response, parsedBody, statusCode);
      });
    }
  else {
    statusCode = 404;
    sendResponse(response, null, statusCode);
  }
};

exports.requestHandler = requestHandler;
