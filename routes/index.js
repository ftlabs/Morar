const debug = require('debug')('Morar:routes:index');
const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
	res.render('home', {
		serviceName : "Morar"
	})
});

router.get('/__gtg', function(req, res){

	res.end();

});

module.exports = router;
