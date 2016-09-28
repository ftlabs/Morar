const debug = require('debug')('Morar:bin:lib:restricted-endpoint');

const allowedUsers = process.env.ALLOWED_USERS.split(',');

function reject(res){
	res.status(403);
	res.send("Sorry, this endpoint is restricted");
}

module.exports = function(req, res, next){

	debug(`CheckedToken:`, req.checkedToken);

	if(req.checkedToken === undefined){
		reject(res);
	} else {
		
		const thisUser = req.checkedToken.info.owner;
		debug(`${thisUser} tried to access a restricted endpoint`);

		if(thisUser === undefined){
			reject(res);
		} else {

			// Javascript Doorman
			const theUserIsOnTheList = allowedUsers.indexOf(thisUser) > -1;

			if(theUserIsOnTheList){
				next();
			} else {
				reject(res);
			}

		}

	}


}