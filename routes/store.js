const debug = require('debug')('Morar:routes:store');

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

const express = require('express');
const multer = require('multer');
const AWS_ES_CREDS = require('http-aws-es');
const elasticsearch = require('elasticsearch');

const router = express.Router();
const m = multer({ dest: process.env.TMP_FOLDER || '/tmp' })
const es = elasticsearch.Client({
	hosts: process.env.AWS_ES_ENDPOINT,
	log: 'trace',
	connectionClass: AWS_ES_CREDS,
	amazonES: {
		region: process.env.AWS_REGION || 'us-west-1',
		accessKey: process.env.AWS_ACCESS_KEY_ID,
		secretKey: process.env.AWS_SECRET_ACCESS_KEY
	}
});

router.get('/', function(req, res){


	res.send("OK");

});

router.put('/metadata', function(req, res){

	const requestQueryParams = req.query;
	debug(requestQueryParams);

	res.send("OK");

});

router.put('/object', function(req, res){

	const requestQueryParams = req.query;
	const requestBody = req.body.data;
	debug(requestQueryParams, requestBody);

	res.send("OK");

});

router.put('/file', m.single('f'), function(req, res){ 

	const requestFile = req.file;
	debug(requestFile);

	res.send("OK");
});

module.exports = router;