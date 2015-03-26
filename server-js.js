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
        console.log(key);
        var value = +queryString[key];
        if(isNumeric(value)){
            sum += value;
        }
    }
    return sum;
}
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function setQueries(arr,obj){
    for (var n = 0; n < arr.length; n++) {
        var result = getKeyValue(arr[n], "=");
        obj[result.key] = result.value;
    }
}
function getText(string, substr, endChar){
    var txtStart = string.indexOf(substr) + substr.length;
    var txtEnd = string.indexOf(endChar, txtStart);
    var text = string.substring(txtStart, txtEnd);
    return text;
}
function encodeMultipart(body,boundary){
    var queriesObj = {};
    var tempArr = body.split("--" + boundary);
    tempArr = tempArr.slice(1,tempArr.length-1);
    for(var i = 0; i < tempArr.length; i++){
        var dataStr = tempArr[i].slice("\r\nContent-Disposition: form-data; ".length);
        var name = getText(dataStr, 'name=\"', '\"')
        var isFile = dataStr.indexOf('filename=\"') !== -1;
        if(!isFile){
            var val = dataStr.split("\r\n")[2];
            queriesObj[name] = val;
        }else{
            queriesObj[name] = {};
            queriesObj[name].fileName = getText(dataStr,'filename=\"','\"');
            queriesObj[name].contentType = getText(dataStr,'Content-Type: ', '\r');
            var contentDivider = '\r\n\r\n';
            var contentStartIndex = dataStr.indexOf(contentDivider) +  contentDivider.length;
            queriesObj[name].fileContent = dataStr.substring(contentStartIndex, dataStr.length - 2);
        }
    }
    return queriesObj;

}
function processData(data) {
    //your code goes here
    var httpObj = {};
    var httpParams = data.toString().split('\r\n');
    var firstStringParams = httpParams[0].split(' ');

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
    for(var i = 1; i < httpParams.length; i++){
        if(httpParams[i] === ''){
            break;
        }
        var headerObj = getKeyValue(httpParams[i], ": ");
        httpObj.headers[headerObj.key] = headerObj.value;
    }

    //Get body
    if(httpObj.headers['Content-Type']){
        var contentTypeArr = httpObj.headers['Content-Type'].split('; ');
        var contentType = contentTypeArr[0];
    }
    var bodyDivider = "\n\r\n";
    var bodyIndex = data.toString().indexOf(bodyDivider) + bodyDivider.length;
    var body = data.toString().slice(bodyIndex);
    var message = 'test';

    if(httpObj.method === "GET"){
        httpObj.body = body.toString();
        if(httpObj.queryStirng){
            message = calcSum(httpObj.queryStirng);
        }
    }

    if(httpObj.method === "POST"){
        if(contentType === "multipart/form-data" && contentTypeArr.length > 1){
            var boundary = contentTypeArr[1].slice(9);
            httpObj.body = encodeMultipart(body,boundary);
            message = calcSum(httpObj.body);
        }
        if(contentType === "application/x-www-form-urlencoded"){
            httpObj.body = {};
            setQueries(body.split('&'),httpObj.body);
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