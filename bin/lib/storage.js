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

module.exports = {
	write : putItemIntoStorage,
	read : getItemFromStorage
};