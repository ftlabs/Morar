const thingsToRemove = [
	"createdBy",
	"dateCreated",
	"uuid",
	"hasFile"
];

module.exports = function(items){

	if(Array.isArray(items)){

		const cleanedItems = items.map(i => {

			thingsToRemove.forEach(t => {

				delete i[t];
			});

			return i;

		});

		return cleanedItems;

	} else {

		const cleanedItem = items;

		thingsToRemove.forEach(t => {
			delete cleanedItem[t];
		});

		return cleanedItem;

	}


}