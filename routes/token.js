const debug = require('debug')('Morar:routes:token');
const express = require('express');
const router = express.Router();
const authS3O = require('s3o-middleware');
const keys = require('../bin/lib/keys');

const serviceName = process.env.SERVICE_NAME || "Morar";

router.use(authS3O);

router.get('/generate', function(req, res) {

	keys.create({ owner : req.cookies.s3o_username })
		.then(token => {
			debug(token);

			res.render('generate-token', {
				serviceName,
				token
			});

		})
	;
});

router.get('/revoke', function(req, res){

	res.render('revoke-token', {
		serviceName
	});

});

router.post('/revoke', function(req, res){
	debug(req.body);

	const tokenToRevoke = req.body.token;

	if(tokenToRevoke === undefined){
		res.status(500);
		res.send("You did not pass a token to be revoked");
	} 

	keys.check(tokenToRevoke)
		.then(checkedToken => {
			
			if(checkedToken.isValid){

				keys.disable(tokenToRevoke)
					.then(function(){
						
						res.render('message', {
							messageTitle: "Token revocation",
							messageContent : `The token ${tokenToRevoke} has been successfully revoked`
						});

					})
					.catch(err => {
						debug(err);
						res.status(500);
						res.send("An error occurred when we tried to revoke this key");
					});
				;

			} else {
				res.status(500);
				res.send("The token passed for revocation is not valid");
			}

		})
	;

});

module.exports = router;
