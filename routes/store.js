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

		let storageOperation = undefined

		if(requestFile !== undefined){

			const uploadedFileReadableStream = fs.createReadStream(requestFile.path, {
				flags: 'r',
				encoding: null,
				fd: null,
				mode: 0o666,
				autoClose: true
			});

			storageOperation = storage.write(uploadedFileReadableStream, entry.uuid)

		} else if (requestBody !== undefined){
			debug(requestBody);
			storageOperation = storage.write(requestBody, entry.uuid);
		} else {
			storageOperation = Promise.resolve(null);
		}

		storageOperation
			.then(function(){
				debug("Writing entry to database");
				return database.write(entry, process.env.AWS_DATA_TABLE_NAME);
			})
			.then(function(result){
				debug(result);
				res.send({
					status : "ok",
					id : entry.uuid
				});
			})
			.catch(err => {
				debug(err);
			})
		;

	}

}

router.post('/', m.single('f'), storeObjectInDatabase);
router.put('/', m.single('f'), storeObjectInDatabase);

module.exports = router;