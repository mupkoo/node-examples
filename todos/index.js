var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    qs = require('querystring'),
    todos = [],
    root = __dirname;

http.createServer(function (req, res) {
    console.log(req.url, req.method);

    if (req.url != '/') {
        return notFound(res);
    }

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
    console.log("Server is listening on port 8000");
});

function show(res) {
    var html = '';

    fs.readFile(path.join(root, 'index.html'), function (error, data) {
        if (error) {
            console.log(error);
            return badRequest(res);
        }

        html = data.toString().replace('{{todos}}', todos.map(function (todo, index) {
            return '<li>' + todo + '<button value="' + index + '">Delete</button></li>';
        }).join(''));

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
        if (typeof data.index === undefined) {
            return badRequest(res);
        }

        if (typeof todos[data.index] === undefined) {
            return notFound(res);
        }

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
    if (typeof error === undefined) error = 'Bad Request';

    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 400;
    res.end(error);
}

function notFound(res) {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 404;
    res.end('Not Found!');
}
