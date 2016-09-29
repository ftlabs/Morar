const debug = require('debug')('Morar:routes:retrieve');
const express = require('express');
const router = express.Router();

const database = require('../bin/lib/database');
const storage = require('../bin/lib/storage');
const requireToken = require('../bin/lib/require-token');
const scrub = require('../bin/lib/clean-results');

router.get('/', function(req, res){

	res.send("You have not specified an item UUID for retrieval");

});

router.use(requireToken);

router.get('/:itemUUID', function(req, res) {

	debug(req.params.itemUUID);
	
	const itemUUID = req.params.itemUUID;

	database.read({ uuid : itemUUID }, process.env.AWS_DATA_TABLE_NAME)
		.then(data => {
			debug(data);
			if(data.Item === undefined){

				res.status(404);
				res.send("No item with that UUID exists in our database");

			} else {
				
				const item = scrub(data.Item);

				const response = {
					data : item
				};

				storage.check(itemUUID)
					.then(itemExists => {

						if(itemExists){
							response.objectURL = `${process.env.SERVICE_URL}/retrieve/object/${itemUUID}`;
						}

						res.json(response);

					})
					.catch(err => {
						res.status(500);
						res.send(`An error occurred whilst checking our database`);
					})
				;

			}

		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.send(`An error occurred whilst checking our database`);
		})
	;

});

router.get('/object/:itemUUID', function(req, res){

	const itemUUID = req.params.itemUUID;

	storage.read(itemUUID)
		.then(data => {
			debug(data);
			res.setHeader('Content-Type', 'application/octet-stream');
			res.end(data.Body, 'binary');
		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.send("An error occurred whilst retrieving that item");
		})
	;

});

module.exports = router;