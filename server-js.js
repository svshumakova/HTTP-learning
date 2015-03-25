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
function calcSum(queryString){
    var sum = 0;
    for(var key in queryString){
        sum += +queryString[key];
    }
    return sum;
}
function setQueries(arr,obj){
    for (var n = 0; n < arr.length; n++) {
        var result = getKeyValue(arr[n], "=");
        obj[result.key] = result.value;
    }
}
function encodeMultipart(body, boundary){

}
function processData(data) {
    //your code goes here
    var httpObj = {};
    var parameters = data.toString().split('\r\n');
    var firstStringParams = parameters[0].split(' ');

    httpObj.method = firstStringParams[0];
    httpObj.path = firstStringParams[1];

    //Get queryString
    if (httpObj.method === 'GET') {
        var queryArr = getQueryString(httpObj.path).split('&');
        if(queryArr.length > 1){
            httpObj.queryStirng = {};
            setQueries(queryArr,httpObj.queryStirng);
        }
    }
    //Get headers
    httpObj.headers = {};
    for(var i = 1; i < parameters[i].length; i++){
        if(parameters[i] === ''){
            break;
        }
        var headerObj = getKeyValue(parameters[i], ": ");
        httpObj.headers[headerObj.key] = headerObj.value;
    }

    //Get body
    //httpObj.body = parameters[parameters.length-1];
    var message = 'test';

    if(httpObj.method === "GET" && httpObj.queryStirng){
        httpObj.body = parameters[parameters.length-1];
        message = calcSum(httpObj.queryStirng);
    }

    if(httpObj.method === "POST"){
        var contentTypeArr = data.headers['Content-Type'].split(' ');
        var contentType = contentTypeArr[0];
        if(contentType === "multipart/form-data" && contentTypeArr.length > 1 && httpObj.body){
            var boundary = contentTypeArr[1];
            httpObj.bodyQueryStirng = encodeMultipart(httpObj.body,boundary);
        }
        if(contentType === "application/x-www-form-urlencoded" && httpObj.body){
            httpObj.body = {};
            setQueries(httpObj.body.split('&'),httpObj.body);
            message = calcSum(httpObj.body);
        }
    }

    console.log(httpObj);
    console.log(data.toString());

    this.end(message.toString());
}

server.listen(8080, function () {
    console.log('Все очень запущено на порту 8080');
});