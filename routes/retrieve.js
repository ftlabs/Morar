const debug = require('debug')('Morar:routes:retrieve');
const express = require('express');
const router = express.Router();

const database = require('../bin/lib/database');
const storage = require('../bin/lib/storage');

router.get('/', function(req, res){

	res.send("You have not specified an item UUID for retrieval");

});

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
				
				const item = data.Item;
				delete item.createdBy;
				delete item.dateCreated;
				delete item.uuid;

				const response = {
					data : item
				};

				storage.check(itemUUID)
					.then(itemExists => {

						if(itemExists){
							response.objectURL = `/object/${itemUUID}`;
						}

						res.json(response);

					})
					.catch(err => {
						debug(err);
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

	res.send("OK");

});

module.exports = router;