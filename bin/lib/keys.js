'use strict';

const debug = require('debug')('Morar:bin:lib:keys');
const uuid = require('uuid').v4;
const database = require('./database');

function checkKeyIsValid(key){

	return database.read(key, process.env.AWS_KEYS_TABLE)
		.then(function(result){

			const response = {};
			const item = result.Item;

			if(item.token !== undefined && item.disabled === false){
				response.isValid = true;
			} else {
				response.isValid = false;
			}

			return response;

		})
	;

}

function createKey(userDetails){

	const requiredFields = process.env.REQUIRED_KEY_CREATION_FIELDS.split(',') || [];

	if(requiredFields.length === 0){
		debug('No required fields provided');
	}
	
	const entry = {
		token : uuid().replace(/-/g, ""),
		disabled : false,
		creationTime : Date.now() / 1000 | 0
	};

	let allRequirementsMet = true;
	const omittedFields = [];

	requiredFields.forEach(field => {

		if(userDetails[field] === undefined){
			allRequirementsMet = false;
			return;
		}

	});

	if(allRequirementsMet){

		Object.keys(userDetails).forEach(key => {

			if(entry[key] !== undefined){
				return Promise.reject(`You are not able to assign the "${key}" a value`);		
			} else {
				entry[key] = userDetails[key];
			}

		});

		return database.write(entry, process.env.AWS_KEYS_TABLE)
			.then(function(){
				return entry.token;
			})
			.catch(err => {
				debug(err);
			})
		;
	} else {
		return Promise.reject(`Required fields for key creation were not met: ${omittedFields.join(', ')}`);
	}

}

function disableAlreadyCreatedKey(){

	return new Promise( (resolve, reject) => {

	});

}

module.exports = {
	check : checkKeyIsValid,
	create : createKey,
	disable : disableAlreadyCreatedKey
};