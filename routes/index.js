const debug = require('debug')('Morar:routes:index');
const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
	res.render('home', {
		serviceName : "Morar"
	})
});

module.exports = router;
