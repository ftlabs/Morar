const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();

router.put('/', function(req, res, next) {



	res.send("OK");

});

module.exports = router;