var http = require('http');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var todos = [];
var root = __dirname;

http.createServer(function (req, res) {
    console.log(req.url, req.method);

    if (req.url != '/') return notFound(res);

    switch (req.method) {
        case 'GET':
            show(res);
            break;

        case 'POST':
            add(req, res);
            break;

        case 'DELETE':
            remove(req, res);
            break;

        default:
            badRequest(res);
    }
}).listen(8000, function () {
    console.log("Server is running on localhost:8000");
});

function show(res) {
    var html = '',
        todosHtml = '';

    fs.readFile(path.join(root, 'index.html'), function (error, data) {
        if (error) {
            console.log(error);
            return badRequest(res);
        }

        todosHtml = todos.map(function (todo, index) {
            return '<li>' + todo + '<button value="' + index + '">Delete</button></li>';
        }).join('');

        html = data.toString().replace('{{todos}}', todosHtml);

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', Buffer.byteLength(html));
        res.end(html);
    });
}

function add(req, res) {
    parseRequestData(req, function (data) {
        if (data.todo) {
            todos.push(data.todo);
        }

        show(res);
    });
}

function remove(req, res) {
    parseRequestData(req, function (data) {
        if (!data.index)        return badRequest(res);
        if (!todos[data.index]) return notFound(res);

        todos.splice(data.index, 1);
        res.end('ok');
    });
}

function parseRequestData(req, callback) {
    var data = '';
    req.setEncoding('utf8');

    req.on('data', function (chunk) {
        data += chunk;
    });

    req.on('end', function () {
        callback(qs.parse(data));
    });
}

function badRequest(res, error) {
    error = error || 'Bad Request';

    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 400;
    res.end(error);
}

function notFound(res) {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 404;
    res.end('Not Found!');
}
