const debug = require('debug')('Morar:bin:lib:require-token');
const keys = require('./keys');

module.exports = function(req, res, next){
	const token = req.query.token;

	if(token === undefined || token === ""){
		debug(req.query);
		res.status(422);
		res.send(`An access token needs to be passed as a query parameter with the key 'token'`);
	} else {

		keys.check(token)
			.then(checkedToken => {
				debug(checkedToken);
				if(checkedToken.isValid){
					req.checkedToken = checkedToken;
					next();
				} else {
					res.status(403);
					res.send("The token passed was not valid");
				}

			})
			.catch(err => {
				debug(err);
				res.send("An error occurred as we checked your token");
			})
		;

	}

}