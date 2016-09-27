# Morar
A home for all currently discarded FT metadata

## Acquiring an access token

To store and retrieve data with Morar, you must first request an access token. You can do this by heading to the `/token/generate`. This path is behind S3O. Once authenticated, a token will be generated and displayed. This token must be included as a query paramater on all `/store` and `/retrieve` endpoints.

## Storing data in Morar

_These examples are using cURL_

_The `/store` endpoints will work with both **POST** and **PUT** HTTP verbs_

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

## Retrieving data in Morar

Currently, Morar is not searchable, but individual items are retrievable using the UUID that is returned when each object is stored.