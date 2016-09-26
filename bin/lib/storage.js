const AWS = require('aws-sdk');
const S3 = new AWS.S3();
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

function putItemIntoStorage(item, key){

	return new Promise(function(resolve, reject){

		S3.putObject({
			Bucket : process.env.AWS_DATA_BUCKET,
			Key : key,
			Body : item
		}, function(err){
			if(err){
				reject(err);
			} else {
				resolve(item);
			}
		});

	});

}

function getItemFromStorage(name){
	return false;
}

function checkIfItemExistsInStorage(itemUUID){

	return new Promise(function(resolve, reject){

		S3.headObject({
			Bucket : process.env.AWS_DATA_BUCKET,
			Key : `${itemUUID}`
		}, function (err, metadata) { 

			if (err && err.code === 'NotFound') {
				resolve(false);
			} else if(err){
				reject(err);
			} else {
				resolve(true);
			}
		});

	});

}

module.exports = {
	write : putItemIntoStorage,
	read : getItemFromStorage,
	check : checkIfItemExistsInStorage
};