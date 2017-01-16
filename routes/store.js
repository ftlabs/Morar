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

const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE) || 104857600;

const router = express.Router();

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
	
	if( Object.keys(requestQueryParams).length === 0 || ( requestQueryParams.name === undefined || requestQueryParams.name === '' ) ){

		res.status(422);
		res.json({
			status : 'error',
			message : `You must pass a query parameter with the key 'name' to store this data`
		});

		return
	}

	if( Number(req.headers['content-length']) > MAX_UPLOAD_SIZE ){
		res.status(422);
		res.json({
			status : 'error',
			reason : `The file was too big for upload. The maximum allowed upload size is ${MAX_UPLOAD_SIZE} bytes.`
		});
		return
	}

	let requestSize = 0;
	let chunks = [];

	req.on('data', data => {
		
		debug(data);

		chunks.push(data);		

		requestSize += data.length;
		debug(`Got ${data.length} bytes. Total: ${requestSize}`);

	});

	req.on('end', function(){

		let storageOperation = undefined

		if(chunks.length > 0){

			const file = Buffer.concat(chunks);

			console.log(`Buffer is ${file.length} bytes.`);

			entry.hasFile = true;

			storageOperation = storage.write(file, entry.uuid);

		} else {
			storageOperation = Promise.resolve(null);
		}

		storageOperation
			.then(function(){
				debug(`Writing entry (${entry.uuid}) to database`);
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

				const errID = uuid();
				debug(`ErrorID: ${errID}`);
				debug(err);

				res.status(500);
				res.json({
					status : 'error',
					reason : 'An error occurred when saving your entity',
					errorID : errID
				});
			})
		;

	});

}

router.use(requireToken);
router.use(validKeys);
router.post('/', storeObjectInDatabase);
router.put('/', storeObjectInDatabase);

module.exports = router;