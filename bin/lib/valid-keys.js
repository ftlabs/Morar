const forbiddenKeys = [
	'uuid',
	'dateCreated',
	'createdBy',
	'hasFile'
];

module.exports = function(req, res, next){

	const offendingKeys = [];

	Object.keys(req.query).forEach(key => {
		if(forbiddenKeys.indexOf(key) > -1){
			offendingKeys.push(key);
		}
	});

	if(offendingKeys.length > 0){

		res.status(420);
		res.send(`You are not able to pass '${offendingKeys.join(`' or '`)}' as a key for storage`);

	} else {
		next();
	}


};