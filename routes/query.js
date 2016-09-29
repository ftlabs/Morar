const debug = require('debug')('Morar:routes:query');
const express = require('express');
const router = express.Router();
const authS3O = require('s3o-middleware');

const requireToken = require('../bin/lib/require-token');
const restrictEndpoint = require('../bin/lib/restricted-endpoint');
const database = require('../bin/lib/database');
const scrub = require('../bin/lib/clean-results');

router.get('/', [requireToken, restrictEndpoint], function(req, res, next) {

	const queryParams = req.query;
	delete queryParams.token;

	const d = {};
	const e = {};
	const f = Object.keys(queryParams).map( (p, idx) => {
		d[`#${idx}`] = p;
		e[`:${idx}`] = queryParams[p];
		return `contains(#${idx}, :${idx})`;
	}).join(' AND ');

	debug(d);
	debug(e);
	debug(f);

	database.scan({
			TableName : process.env.AWS_DATA_TABLE_NAME,
			Limit : 50,
			ExpressionAttributeNames: d,
			ExpressionAttributeValues: e,
			FilterExpression : f,
		})
		.then(data => {

			debug(data);
			data.Items.forEach(i => {

				if(i.hasFile){
					i.objectURL = `${process.env.SERVICE_URL}/retrieve/object/${i.uuid}`;
				}

			});

			const results = scrub(data.Items);

			res.json(results);

		})
		.catch(err => {
			debug("Err\n", err);
		})
	;

	debug(queryParams);

});

module.exports = router;
