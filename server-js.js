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
function isObjEmpty(obj){
    var isEmpty = true;
    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            isEmpty = false;
        }
    }
    return isEmpty;
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
    var conteinFiles = false;
    var files = [];
    for(var i = 0; i < tempArr.length; i++){
        var dataStr = tempArr[i].slice("\r\nContent-Disposition: form-data; ".length);
        var name = getText(dataStr, 'name=\"', '\"')
        var conteinFiles = dataStr.indexOf('filename=\"') !== -1;
        if(!conteinFiles){
            var val = dataStr.split("\r\n")[2];
            queriesObj[name] = val;
        }else{
            var file = {};
            file.fileName = getText(dataStr,'filename=\"','\"');
            file.contentType = getText(dataStr,'Content-Type: ', '\r');
            var contentDivider = '\r\n\r\n';
            var contentStartIndex = dataStr.indexOf(contentDivider) +  contentDivider.length;
            file.fileContent = dataStr.substring(contentStartIndex, dataStr.length - 2);
            files.push(file);
        }
    }
    if(conteinFiles && files.length > 0){
        queriesObj.files = files;
    }
    return queriesObj;

}
function getBody(dataStr){
    var bodyDivider = "\n\r\n";
    var bodyIndex = dataStr.indexOf(bodyDivider) + bodyDivider.length;
    var body = dataStr.toString().slice(bodyIndex);
    return body;
}
function processData(data) {
    //your code goes here
    var httpObj = {};
    var dataStr = data.toString();
    var httpParams = dataStr.split('\r\n');
    var firstStringParams = httpParams[0].split(' ');

    httpObj.method = firstStringParams[0];
    httpObj.path = firstStringParams[1];

    //Get headers
    httpObj.headers = {};
    for(var i = 1; i < httpParams.length; i++){
        if(httpParams[i] === ''){
            break;
        }
        var headerObj = getKeyValue(httpParams[i], ": ");
        httpObj.headers[headerObj.key] = headerObj.value;
    }

    var message = "test";
    //Get Data
    httpObj.data={};
    if (httpObj.method === 'GET') {
        var queryArr = getQueryString(httpObj.path).split('&');
        if(queryArr.length > 1){
            setQueries(queryArr,httpObj.data);
        }
    }

    if(httpObj.method === "POST"){
        var bodyDivider = "\n\r\n";
        var bodyIndex = dataStr.indexOf(bodyDivider) + bodyDivider.length;
        var body = dataStr.slice(bodyIndex);
        var body = getBody(dataStr);
        if(httpObj.headers['Content-Type']){
            var contentTypeArr = httpObj.headers['Content-Type'].split('; ');
            var contentType = contentTypeArr[0];
        }
        if(contentType === "multipart/form-data" && contentTypeArr.length > 1){
            var boundary = contentTypeArr[1].slice(9);
            httpObj.data = encodeMultipart(body,boundary);
            var fs = require('fs');
            if(httpObj.data.files){
                httpObj.data.files.forEach(function(el){
                    fs.writeFile(el.fileName, el.fileContent, function (err) {
                        if (err){
                            console.log(err);
                            throw err;
                        }
                        console.log('It\'s saved!');
                    });
                });
            }
        }
        if(contentType === "application/x-www-form-urlencoded"){
            setQueries(body.split('&'),httpObj.data);
        }
    }

    var message = "test";
    if(!isObjEmpty(httpObj.data)){
        message = calcSum(httpObj.data);
    }

    console.log(httpObj);
    //console.log(data);
    console.log(dataStr);
    this.end(message.toString());
}

server.listen(8080, function () {
    console.log('Все очень запущено на порту 8080');
});