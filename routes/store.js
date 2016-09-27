const debug = require('debug')('Morar:routes:store');

const fs = require('fs');
const express = require('express');
const multer = require('multer');
const uuid = require('uuid').v4;

const database = require('../bin/lib/database');
const storage = require('../bin/lib/storage');
const requireToken = require('../bin/lib/require-token');

const router = express.Router();
const m = multer({ dest: process.env.TMP_FOLDER || '/tmp' })

router.use(requireToken);

function storeObjectInDatabase(req, res){

	const requestQueryParams = req.query;
	const requestBody = req.body.data;
	const requestFile = req.file;

	delete requestQueryParams.token;
	
	debug(requestQueryParams, requestBody, requestFile);

	const entry = {
		uuid : uuid(),
		dateCreated : new Date() / 1000 | 0,
		createdBy : req.checkedToken.info.owner
	};

	Object.keys(requestQueryParams).forEach(key => {

		if(entry[key] === undefined){
			entry[key] = requestQueryParams[key];
		}

	});
	
	if( Object.keys(requestQueryParams).length === 0 && requestBody === undefined && requestFile === undefined){

		res.status(500);
		res.json({
			message : "You did not pass anything to be stored"
		});

	} else if( (requestQueryParams.name === undefined || requestQueryParams.name === "") && requestBody === undefined && requestFile !== undefined){
		
		res.status(500);
		res.json({
			message : "You must pass a query parameter with the key 'name' to upload a file"
		});

	} else {

		let storageOperation = undefined

		if(requestFile !== undefined){
			debug("There is a file to save");
			const uploadedFileReadableStream = fs.createReadStream(requestFile.path, {
				flags: 'r',
				encoding: null,
				fd: null,
				mode: 0o666,
				autoClose: true
			});

			storageOperation = storage.write(uploadedFileReadableStream, entry.uuid);

		} else if (requestBody !== undefined){
			debug("There is a request body to save", requestBody);
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

	};

}

router.post('/', m.single('f'), storeObjectInDatabase);
router.put('/', m.single('f'), storeObjectInDatabase);

module.exports = router;