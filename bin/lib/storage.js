const AWS = require('aws-sdk');
const S3 = new AWS.S3();
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

function putItemIntoStorage(item){
	return true;
}

function getItemFromStorage(name){
	return false;
}

module.export = {
	put : putItemIntoStorage,
	get : getItemFromStorage
};