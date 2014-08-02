# Node Example

Node example is a library with things I built, while I am testing
NodeJS and some of the community packages. You can start them easily
by running `node {apps_folder_name}`

## List of the example apps

* [/todos](#todos) - Simple Todos app
* [/folder-listing-server](#folder-listing-server) - Folder listing server

## Todos

Very simple implementation of a todos app, using plain node with in memory storage.
To start the app just run `node todos` and navigation to _localhost:8000_

## Folder Listing Server

Simple server that display acts like a folder browser. To start it, run
`node folder-listing-server {root-folder}` where the `{root-folder}` is
the root from where the files will be served. The argument is optional
and if it's not provided the root will be set to the _static_ folder in the
app.
