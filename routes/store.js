const debug = require('debug')('Morar:routes:store');

const fs = require('fs');
const express = require('express');
const uuid = require('uuid').v4;
const shortID = require('shortid').generate;

const database = require('../bin/lib/database');
const storage = require('../bin/lib/storage');
const requireToken = require('../bin/lib/require-token');
const validKeys = require('../bin/lib/valid-keys');
const tmpPath = process.env.TMP_PATH || '/tmp';

const router = express.Router();

router.use(requireToken);

function storeObjectInDatabase(req, res){

	const requestQueryParams = req.query;

	delete requestQueryParams.token;
	
	debug(requestQueryParams);

	const entry = {
		uuid : uuid(),
		dateCreated : new Date() / 1000 | 0,
		createdBy : req.checkedToken.info.owner,
		hasFile : false
	};

	Object.keys(requestQueryParams).forEach(key => {

		if(entry[key] === undefined){
			entry[key] = requestQueryParams[key];
		}

	});
	
	if( Object.keys(requestQueryParams).length === 0 ){

		res.status(422);
		res.json({
			status : 'error',
			message : 'You did not pass anything to be stored'
		});

		return
	} 
	
	if( (requestQueryParams.name === undefined || requestQueryParams.name === '') ){

		res.status(422);
		res.json({
			status : 'error',
			message : `You must pass a query parameter with the key 'name' to store this object`
		});
		return;

	}

	const destination = `${tmpPath}/${entry.uuid}`;
	let requestSize = 0;
	let chunks = [];

	req.on('data', data => {

		chunks.push(data);		

		requestSize += data.length;
		debug(`Got ${data.length} bytes. Total: ${requestSize}`);

	});

	req.on('end', function(){

		debug(chunks);

		let storageOperation = undefined

		if(chunks.length > 0){
			debug(`There is a file to save: ${destination}`);

			const file = Buffer.concat(chunks);

			console.log(`Buffer is ${file.length} bytes.`);

			entry.hasFile = true;

			storageOperation = storage.write(file, entry.uuid);

		} else {
			storageOperation = Promise.resolve(null);
		}

		storageOperation
			.then(function(){
				debug('Writing entry to database');
				return database.write(entry, process.env.AWS_DATA_TABLE_NAME);
			})
			.then(function(result){
				debug(result);
				res.send({
					status : 'ok',
					id : entry.uuid
				});
			})
			.catch(err => {
				debug(err);
				res.status(500);
				res.json({
					status : 'error',
					reason : 'An error occurred when saving your entity'
				});
			})
		;

	});

}

router.use(validKeys);
router.post('/', storeObjectInDatabase);
router.put('/', storeObjectInDatabase);

module.exports = router;