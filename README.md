# Morar
So, what is Morar?

Morar is 

- (the deepest freshwater body in the British Isles)[https://en.wikipedia.org/wiki/Loch_Morar], 
- a reaction to the realisation that we are letting some data disappear after it is used 'in the moment', but before it is properly recorded for posterity and subsequent re-use. 

With this service, we have the following goals:

1. highlight that this data loss is real
2. highlight that this data has real value+potential, if only it was captured
3. get the data leaks plugged and dealt with at source
4. ensure we capture the data in the meanwhile for when (3) comes to pass so we can retrospectively flesh out the 'dealt with' solution with as much legacy data as possible

Morar is all about (1)+(2)+(4) in order to cause (3).

Morar provides a simple, lightweight means for capturing snapshots of the data that would otherwise be lost. The data can be retrieved in batch, with a bit of effort and being polite to Labs team, for that glorious moment when (3) comes to pass and the leak is being 'dealt with'. Morar is not a service to be used as a back-end data store for live projects.

## Acquiring an access token

To store and retrieve data with Morar, you must first request an access token. You can do this by heading to the `/token/generate` path. This path is behind [S3O](http://s3o.ft.com/). Once authenticated, a token will be generated and displayed. This token must be included as a query paramater on all `/store` and `/retrieve` endpoints.

## Storing data in Morar

_These examples are using cURL_

_The `/store` endpoints will work with both **POST** and **PUT** HTTP verbs_

_Don't want to construct your own requests? There's a [Node.js client](https://github.com/ftlabs/morar-client) for that_

### Storing some simple metadata
Here, each query parameter (with the exception of 'token') will be stored as a key-value pair, and will be returned as a JSON object when accessed through the `/retrieve` endpoints.

The intended use for these values is that they will be used to describe an object/file that is being passed as part of the request body, but this is not required.

`curl -X POST 'https://morar.ft.com/store/?1=2&a=b&Orangensaft=Gut&token=[YOUR_ACCESS_TOKEN]'
`

If successful, the server will return a response code of **200** and a JSON object with the unique ID of the newly stored object that you can use to retrieve the item later, as well as a status message.

`{"status":"ok","id":"a9ce3734-4ec2-4bf8-9dc1-11c985a21ac6"}`

### Storing larger amounts of metadata and other 

You can store larger entities, such as a base64 encoded image or a large JSON object, by passing them in the body of a PUT/POST request to the same endpoint, like so:

**With query parameters**

`curl -X POST --data "data=['looking', 'through', 'a', 'glass', 'onion']" 'https://morar.ft.com/store/?1=2&a=b&Orangensaft=Gut&token=[YOUR_ACCESS_TOKEN]'`

**Without query parameters**

`curl -X POST --data "data=['looking', 'through', 'a', 'glass', 'onion']" 'https://morar.ft.com/store/?token=[YOUR_ACCESS_TOKEN]'`

The query paramaters will again be stored as key-value pairs, the value of the data paramater in the body will be stored exactly as it is passed. 

When accessed through the retrieve endpoint, the value of the data key in the request body will be returned as a file.

**Binary files**

You can also store binary files for later retrieval. When storing a file, you _must_ pass a query parameter with the key of `name` and a value, otherwise the object will not be stored.

`curl -X POST -F "f=@./photo.jpeg" 'https://morar.ft.com/store/?name=The%20Team&token=[YOUR_ACCESS_TOKEN]'`

**Reserved Keys**

The following strings cannot be used as query values in a storage request to Morar. Any request containing the following keys as query paramaters will be rejected:

* uuid
* dateCreated
* createdBy
* hasFile

This only applies to query paramaters for the `/store` endpoint, these keys can still be used in a request body.

## Retrieving data in Morar

Using the `/retrieve` endpoint, single objects can be retrieved using the UUID that was returned when that piece of data was stored.

A valid token is required to retrieve a piece of information, but does not have to be the same token that was used to create it.

### Retreiving data by UUID

```
// GET request
curl 'https://morar.ft.com/retrieve/[OBJECT_UUID]?token=[YOUR_ACCESS_TOKEN]'
```

Which will return a JSON object with the following structure:

```
{
	data : {
		name : 'Demo Object',
		glass : 'onion',
		yellow : 'submarine',
		hey : 'bulldog'
	},
	objectURL : "http://morar.ft.com/retrieve/object/[OBJECT_UUID]"
}
```

The data in the returned object will contain the key-value pairs that you passed as query parameters when you first created the object. 

The `objectURL` value will only be present in the response if you also passed data as a binary file or as part of the request body. To access this data, you can follow the URL download the file. 

### Retreiving file object associated with meta data

If a piece of data stored in Morar also has a file associated with it, it can be retrieved with the `/retrieve/object/` endpoint:

```
// GET request
curl 'https://morar.ft.com/retrieve/object/[OBJECT_UUID]?token=[YOUR_ACCESS_TOKEN]'
```

As with the `retrieve` endpoint, a valid token is required in order to access the object.

_Please note:_ all data passed to Morar as a binary file or request body is treated equally, we're not concerned with the types of the files that are being passed to the service. As such, when the object is retrieved from storage, we return an octet-stream. You may need to add a file extension to the file name for your system to recognise the file as a certain type.

## Querying data in Morar

It is possible to query and filter all of the data stored in Morar, but this functionality is limited to a select few. If you wish to use the following endpoints, please contact FT Labs for a chat about your needs/hopes/dreams.

### Querying stored information

The database of information stored in Morar can be accessed through the `/query` endpoint.

The following request will return every item stored in Morar that has been put there by john.doe. 

```
// GET request
curl 'https://morar.ft.com/query/?token=[YOUR_ACCESS_TOKEN]&createdBy=john.doe'
```

To further filter the results, extra query paramters can be added to the request, which will act like an AND operator, allowing you to narrow down your returned options.

```
// GET request
curl 'https://morar.ft.com/query/?token=[YOUR_ACCESS_TOKEN]&createdBy=john.doe&dataType=JSON'
```

For a successful query, a JSON object with the following structure will be returned:

```
{
	items : [
		{
			data : {
				name : 'Demo Object',
				glass : 'onion',
				yellow : 'submarine',
				hey : 'bulldog'
			},
			objectURL : "http://morar.ft.com/retrieve/object/[OBJECT_UUID]"
		},
		{
			data : {
				john : 'Lennon',
				paul : 'McCartney',
				george : 'Harrison',
				ringo : 'Starr'
			},
			objectURL : "http://morar.ft.com/retrieve/object/[OBJECT_UUID]"
		}

	]

}
```

Note that the objects in the items array have the same structure as the items that are returned for individual items.

If there are no results for the query, the items array will be empty.

```
	{
		items : []
	}
```

## Building Morar

### in dev

```
$ git clone git@github.com:ftlabs/Morar.git
$ cd Morar
$ npm i
$ # populate the .env file with ENV params
$ echo "
DEBUG=Morar:*
NODE_ENV=development
AWS_ACCESS_KEY_ID=YOUR_KEY_SEE_LASTPASS
AWS_SECRET_ACCESS_KEY=YOUR_KEY_SEE_LASTPASS
AWS_DATA_TABLE_NAME=YOUR_TABLE_NAME_SEE_LASTPASS
AWS_DATA_BUCKET=YOUR_BUCKET_NAME_SEE_LASTPASS
AWS_KEYS_TABLE=YOUR_TABLE_NAME_SEE_LASTPASS
REQUIRED_KEY_CREATION_FIELDS=owner
SERVICE_URL=http://localhost:3000
ALLOWED_USERS=YOUR_AD_USERNAMES_CSV
" > .env
$ npm run start

