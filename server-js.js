var server = require('net').createServer(function (socket) {
    socket.on('data', processData.bind(socket));
    socket.on('error', processError.bind(socket));
});


function processError() {
    console.log('error');
}

function parseData(data) {
    //your code goes here
}

/*function getMethod(dataString) {
 var firstSpace = dataString.indexOf(' ');
 return dataString.substring(0, firstSpace);
 }

 function getUrl(dataString) {
 var firstSpace = dataString.indexOf(' ');
 var secondSpace = dataString.indexOf(' ');
 return dataString.substring(firstSpace + 1, dataString.length);
 }*/

function parseFirstString(dataString) {
    return dataString.split(' ');
}

function getQueryString(dataString) {
    console.log('url', dataString);
    var delimiter = dataString.indexOf('?');
    return dataString.substring(delimiter + 1, dataString.length);
}

function getKeyAndValue(dataString, delimiter) {
    var result = dataString.split(delimiter);
    var key = result[0];
    var value = result[1];
    return {'key': key, 'value': value};
}

function processData(data) {
    //your code goes here

    var parameters = data.toString().split('\r\n');

    var firstStringParams = parseFirstString(parameters[0]);

    var method = firstStringParams[0];
    var url = firstStringParams[1];
    var protocol = firstStringParams[2];

    var urlPage = url.split("?")[0];

    var query;

    if (method === 'GET') {
        query = getQueryString(url).split("&");
    }
    else {
        query = getQueryString(body).split("&");
    }

    var queryParams = {};

    for (n = 0; n < query.length; n++) {
        var result = getKeyAndValue(query[n], "=");
        queryParams[result.key] = result.value;
        //queryParams[getKey(query[n], "=")] = getValue(query[n], "=");
    }


    var i = 1;
    var headers = {};
    var body = {};
    var parsingPart = 'header';

    for (var i = 0; i < parameters.length; i++) {
        var result = getKeyAndValue(parameters[i], ": ");
        if (parameters[i] === '') {
            parsingPart = 'body';
            continue;
        }
        if (parsingPart === 'header') {
            headers[result.key] = result.value;
        }
        else {
            body[result.key] = result.value;
        }
    }

    console.log(parameters);
    console.log(data.toString());

    var message = 'test';

    if ((urlPage === '/sum-get') || (urlPage === '/sum-get.html')) {
        message = parseInt(queryParams.a) + parseInt(queryParams.b);
    }

    if ((urlPage === '/sum-post') || (urlPage === '/sum-post.html')) {
        message = parseInt(queryParams.a) + parseInt(queryParams.b);
    }

    this.end(message.toString());
}

server.listen(8080, function () {
    console.log('Все очень запущено на порту 8080');
});