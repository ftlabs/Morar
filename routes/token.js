const debug = require('debug')('Morar:routes:token');
const express = require('express');
const router = express.Router();
const authS3O = require('s3o-middleware');
const keys = require('../bin/lib/keys');

router.use(authS3O);

router.get('/', function(req, res) {
	// res.send("OK");

	keys.create({ owner : req.cookies.s3o_username })
		.then(token => {
			debug(token);

			res.render('generate-token', {
				serviceName : process.env.SERVICE_NAME || "Morar",
				token
			});

		})
	;
});

router.post('/create', function(req, res){

	res.send("OK");

});

module.exports = router;
