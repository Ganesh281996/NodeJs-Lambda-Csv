var request = require('request');
var jwt = require('jsonwebtoken');

var token = jwt.sign({name : 'ganesh'},'itssecret');
console.log('TOKEN = ',token);

exports.requestToApi = function(jsonData , callback){

    var apiCall = {
        uri : 'http://18.234.198.46:8080/create',
        method : 'POST',
        json : true,
        headers : {
            token : token
        },
        body : jsonData
    };
    console.log('APICALL OBJECT = ',apiCall);

    request(apiCall,function(err){
        if(err) callback(err);
    });
};