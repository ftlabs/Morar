const debug = require('debug')('Morar:routes:retrieve');
const express = require('express');
const router = express.Router();

const database = require('../bin/lib/database');
const storage = require('../bin/lib/storage');
const requireToken = require('../bin/lib/require-token');
const scrub = require('../bin/lib/clean-results');

router.get('/', function(req, res){

	res.status(422);
	res.json({
		status : 'error',
		reason : 'You have not specified an item UUID for retrieval'
	});

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
				res.json({
					status : 'error',
					reason : 'No item with that UUID exists in our database'
				});

			} else {

				const response = {};
				
				if(data.Item.hasFile){
					response.objectURL = `${process.env.SERVICE_URL}/retrieve/object/${itemUUID}`;
				}

				response.data = scrub(data.Item);

				res.json(response);

			}

		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.send(`An error occurred whilst checking our database`);
			res.json({
				status : 'error',
				reason : `An error occurred whilst checking our database`
			});
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
			res.status({
				status : 'error',
				reason : 'An error occurred whilst retrieving that item'
			});
		})
	;

});

module.exports = router;