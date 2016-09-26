'use strict';

const debug = require('debug')('Morar:bin:lib:authentication');
const uuid = require('uuid').v4;
const database = require('../bin/lib/database');

function checkKeyIsValid(key){

	return database.read(key, process.env.AWS_KEYS_TABLE)
		.then(function(item){

			const response = {
				isValid : item !== undefined
			};

			if(item !== undefined){
				response.item = item;
			}

			return response;

		})
	;

}

function createKey(userDetails){

	const requiredFields = process.env.REQUIRED_KEY_CREATION_FIELDS || [];

	if(requiredFields.length === 0){
		debug('No required fields provided');
	}
	
	const entry = {
		key : uuid(),
		disabled : false
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
		return database.write(entry, process.env.AWS_KEYS_TABLE);
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