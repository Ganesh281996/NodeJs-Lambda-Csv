var AWS = require('aws-sdk');
var csvJson = require('csvjson');
var apiCall = require('./apiCall');

var s3 = new AWS.S3();

exports.handler = function(event,context,callback){
    
    var newJsonData = [];

    var bucketDetails = {
        // Bucket : event.Records[0].s3.bucket.name,
        // Key : event.Records[0].s3.object.key
        Bucket : 'read-from-s3-nodejs-call-api',
        Key : 'someCSV.csv'
    };
    console.log('PARAMS = ',bucketDetails);

    s3.getObject(bucketDetails,function(err,data){
        if(err) throw err;
        var jsonData = csvJson.toObject(data.Body.toString());
        console.log('CSV DATA IN JSON = ',jsonData);
        apiCall.requestToApi(jsonData , function(err){
            if (err) throw err;
        });
        jsonData.forEach(function(data){
            data.status = true;
            newJsonData.push(data);
        });
        console.log('NEW JSON DATA = ',newJsonData);

        s3.deleteObject(bucketDetails,function(err,data){
            if(err) console.log('ERROR DELETE OBJECT = ',err);
            console.log(data);
        });
    
        var newCsvData = csvJson.toCSV(newJsonData);
        console.log('NEW CSV DATA = ',newCsvData);
    
        var newBucketDetails = {
            Bucket : "write-to-s3-nodejs-call-api",
            Key : 'newCSVfile.csv',
            Body : newCsvData
        };
    
        s3.putObject(newBucketDetails,function(err,data){
            if(err) throw err;
            console.log(data);
        });
    });
};