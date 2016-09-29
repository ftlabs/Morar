const thingsToRemove = [
	"createdBy",
	"dateCreated",
	"uuid",
	"hasFile"
];

module.exports = function(items){
	
	if(Array.isArray(items)){

		const cleanedItems = items.map(i => {
			const editedClone = Object.assign({}, i);

			thingsToRemove.forEach(t => {
				delete editedClone[t];
			});

			return editedClone;

		});

		return cleanedItems;

	} else {

		const cleanedItem = Object.assign({}, items);

		thingsToRemove.forEach(t => {
			delete cleanedItem[t];
		});

		return cleanedItem;

	}


}