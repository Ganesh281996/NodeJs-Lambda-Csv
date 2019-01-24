const AWS = require('aws-sdk');
const csvJson = require('csvjson');
const apiCall = require('./apiCall');

const s3 = new AWS.S3();

exports.handler = function(event,context,callback){
    
    const newJsonData = [];

    const bucketDetails = {
        Bucket : event.Records[0].s3.bucket.name,
        Key : event.Records[0].s3.object.key
    };
    console.log('PARAMS = ',bucketDetails);

    new Promise(function(resolve,reject){
        s3.getObject(bucketDetails,function(err,data){
            if(err) reject(err);
            resolve(data.Body.toString());
        });
        s3.deleteObject(bucketDetails,function(err,data){
            if(err) throw err;
            console.log('DELETE OBJECT = ',data);
        });
    }).then(dataInString => {
        return csvJson.toObject(dataInString);
    }).then(dataInJson => {
        console.log('CSV DATA IN JSON = ',dataInJson);
        apiCall.requestToApi(dataInJson , function(err){
            if (err) throw err;
        });
        dataInJson.forEach(data => {
            data.status = true;
            newJsonData.push(data);
        });
        console.log('NEW JSON DATA = ',newJsonData);
        return newJsonData;
    }).then(newJsonData => {
        return csvJson.toCSV(newJsonData);
    }).then(newCsvData => {
        console.log('NEW CSV DATA = ',newCsvData);
        const newBucketDetails = {
            Bucket : "write-to-s3-nodejs-call-api",
            Key : 'newCSVfile.csv',
            Body : newCsvData
        };
        s3.putObject(newBucketDetails , function(err , data){
            if(err) throw err;
            console.log('UPLOAD OBJECT = ',data);
        });
    })
};