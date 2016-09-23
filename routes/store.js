const debug = require('debug')('Morar:routes:store');

const fs = require('fs');
const express = require('express');
const multer = require('multer');
const uuid = require('uuid').v4;

const database = require('../bin/lib/database');
const storage = require('../bin/lib/storage');

const router = express.Router();
const m = multer({ dest: process.env.TMP_FOLDER || '/tmp' })

function storeObjectInDatabase(req, res){

	const requestQueryParams = req.query;
	const requestBody = req.body.data;
	const requestFile = req.file;

	debug(requestQueryParams, requestBody, requestFile);

	const entry = {
		uuid : uuid(),
		dateCreated : new Date() * 1,
		createdBy : "TEST_DATA"
	};

	Object.keys(requestQueryParams).forEach(key => {

		if(entry[key] === undefined){
			entry[key] = requestQueryParams[key];
		}

	});
	
	if( Object.keys(requestQueryParams).length === 0 ){

		res.status(500);
		res.json({
			message : "You did not pass any metadata to be stored"
		});

	} else {

		const writeOperations = [];

		writeOperations.push(database.write(entry, process.env.AWS_DATA_TABLE_NAME));

		debug(storage);

		if(requestBody !== undefined && requestFile === undefined){
			debug('Request has content in the body. Writing to S3');
			writeOperations.push(storage.write(requestBody, entry.uuid));
		} else if(requestFile !== undefined){
			debug('Request has a file. Writing to S3');
			const uploadFileReadableStream = fs.createReadStream(requestFile.path, {
				flags: 'r',
				encoding: null,
				fd: null,
				mode: 0o666,
				autoClose: true
			});
			writeOperations.push(storage.write(uploadFileReadableStream, entry.uuid));
		}

		Promise.all(writeOperations)
			.then(function(){
				res.send("OK");
			})
			.catch(err => {
				debug(err);
				res.status(500);
				res.end();
			})
		;

	}

}

router.post('/', m.single('f'), storeObjectInDatabase);
router.put('/', m.single('f'), storeObjectInDatabase);

module.exports = router;