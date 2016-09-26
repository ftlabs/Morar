const debug = require('debug')('Morar:routes:store');

const fs = require('fs');
const express = require('express');
const multer = require('multer');
const uuid = require('uuid').v4;

const database = require('../bin/lib/database');
const storage = require('../bin/lib/storage');
const keys = require('../bin/lib/keys');

const router = express.Router();
const m = multer({ dest: process.env.TMP_FOLDER || '/tmp' })

function storeObjectInDatabase(req, res){

	const requestQueryParams = req.query;
	const requestBody = req.body.data;
	const requestFile = req.file;

	const token = requestQueryParams.token;
	delete requestQueryParams.token;
	
	if(token === undefined){
		res.status(422);
		res.send(`An access token needs to be passed as a query parameter with the key 'token'`);
		return;
	}
	
	debug(requestQueryParams, requestBody, requestFile);

	keys.check(token)
		.then(checkedToken => {

			debug(checkedToken);

			if(checkedToken.isValid){

				const entry = {
					uuid : uuid(),
					dateCreated : new Date() / 1000 | 0,
					createdBy : checkedToken.info.owner
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

				}

			} else {
				res.status(401);
				res.send("The token passed is not valid");
			}

		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.send(`An error occurred whilst storing your metadata`);
		})
	;



}

router.post('/', m.single('f'), storeObjectInDatabase);
router.put('/', m.single('f'), storeObjectInDatabase);

module.exports = router;