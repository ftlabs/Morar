const debug = require('debug')('Morar:bin:lib:require-token');
const keys = require('./keys');

module.exports = function(req, res, next){

	const token = req.query.token;

	if(token === undefined){
		debug(req.query);
		res.status(422);
		res.send(`An access token needs to be passed as a query parameter with the key 'token'`);
	} else {

		keys.check(token)
			.then(checkedToken => {

				if(checkedToken.isValid){
					next();
				} else {
					res.status(403);
					res.send("The token passed was not valid");
				}

			})
		;

	}

}