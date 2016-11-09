const debug = require('debug')('Morar:routes:query');
const express = require('express');
const router = express.Router();
const authS3O = require('s3o-middleware');

const requireToken = require('../bin/lib/require-token');
const restrictEndpoint = require('../bin/lib/restricted-endpoint');
const database = require('../bin/lib/database');
const scrub = require('../bin/lib/clean-results');

router.get('/', [requireToken, restrictEndpoint], function(req, res) {

	let queryParams = req.query;
	delete queryParams.token;
	// debug('queryParams without token =', queryParams);

	// handle empty query by displaying (~6hrs old) table size
	if (Object.keys(queryParams).length == 0 ) {
		database.describe(process.env.AWS_DATA_TABLE_NAME)
			.then(data => {
				res.json({
					description : {
						TableSizeBytes : data['Table']['TableSizeBytes'],
						ItemCount      : data['Table']['ItemCount'],
						caveats        : [
						'using the describeTable method, we have info on the table size that is possibly up to 6hrs old'
						]
					},
					instructions : [
					'If you want to list some actual items, you need to filter by specifying some key/value pairs in the url, such as &createdBy=john.doe .',
					'You can use any of the keys you specified when uploading the data into the store.'
					]
				});
			})
			.catch(err => {
				debug("get: empty query: Err\n", err);
				res.status(500);
				res.json({
					status : 'error',
					reason : 'An error occurred whilst describing the table'
				});
			})
		;
	} else { // some query params were specified

		const d = {};
		const e = {};
		const f = Object.keys(queryParams).map( (p, idx) => {
			d[`#${idx}`] = p;
			e[`:${idx}`] = queryParams[p];
			return `contains(#${idx}, :${idx})`;
		}).join(' AND ');

		// debug('d=' + d);
		// debug('e=' + e);
		// debug('f=' + f);

		database.scan({
				TableName : process.env.AWS_DATA_TABLE_NAME,
				Limit : 50,
				ExpressionAttributeNames  : d,
				ExpressionAttributeValues : e,
				FilterExpression          : f,
			})
			.then(data => {

				debug(data);

				const responseItems = data.Items.map(i => {
					
					const o = {};
					
					if(i.hasFile){
						o.objectURL = `${process.env.SERVICE_URL}/retrieve/object/${i.uuid}`;
					}

					o.data = scrub(i);

					return o;

				});

				res.json({
					items : responseItems
				});

			})
			.catch(err => {
				debug("get: non-empty query: Err\n", err);
				res.status(500);
				res.json({
					status : 'error',
					reason : 'An error occurred whilst querying the database'
				});
			})
		;
	};
});

module.exports = router;
