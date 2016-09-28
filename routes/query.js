const debug = require('debug')('Morar:routes:index');
const express = require('express');
const router = express.Router();

const requireToken = require('../bin/lib/require-token');
const restrictEndpoint = require('../bin/lib/restricted-endpoint');

router.use(requireToken);
router.use(restrictEndpoint);

router.get('/', function(req, res, next) {
	res.render('message', {
		serviceName : "Morar",
		messageTitle : "Declaration of intent for endpoint",
		messageContent : "This endpoint will return items from our database"
	});
});

module.exports = router;
