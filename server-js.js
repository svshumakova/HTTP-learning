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

/*function parseFirstString(dataString) {
    return dataString.split(' ');
}*/

function getQueryString(dataString) {
    var strArray = dataString.split("?");
    return strArray.length > 1 ? strArray[1] : '';
}

function getKeyValue(dataString, delimiter) {
    var result = dataString.split(delimiter);
    var key = result[0];
    var value = result[1];
    return {'key': key, 'value': value};
}

function processData(data) {
    //your code goes here
    var httpObj = {};
    var parameters = data.toString().split('\r\n');
    var firstStringParams = parameters[0].split(' ');
    var method = firstStringParams[0];
    var url = firstStringParams[1];

    httpObj.method = method;
    httpObj.path = url;

    //var urlParts = url.split("?")[0];

    if (method === 'GET') {
        var queryArr = getQueryString(url).split('&');
        if(queryArr.length > 1){
            httpObj.queryStirng = {};
            for (var n = 0; n < queryArr.length; n++) {
                var result = getKeyValue(queryArr[n], "=");
                httpObj.queryStirng[result.key] = result.value;
            }
        }

    }

    httpObj.headers = {};
    var body = {};
    //var parsingPart = 'header';

    for(var i = 1; i < parameters[i]; i++){
        if(parameters[i] === ''){
            break;
        }
        var headerObj = getKeyValue(parameters[i], ": ");
        httpObj.headers[headerObj[key]] = headerObj.value;
    }
    /*for (var i = 1; i < parameters.length; i++) {
        var result = getKeyValue(parameters[i], ": ");
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
    }*/

    /*console.log(parameters); */
    console.log(httpObj);
    console.log(data.toString());

    var message = 'test';

    /*if ((urlParts === '/sum-get') || (urlParts === '/sum-get.html')) {
        message = parseInt(queryParams.a) + parseInt(queryParams.b);
    }

    if ((urlParts === '/sum-post') || (urlParts === '/sum-post.html')) {
        message = parseInt(queryParams.a) + parseInt(queryParams.b);
    }*/

    this.end(message.toString());
}

server.listen(8080, function () {
    console.log('Все очень запущено на порту 8080');
});