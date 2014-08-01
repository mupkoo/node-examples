var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');
var errors = require('./libs/errors.js');
var templateCache = fs.readFileSync(path.join(__dirname, 'index.html'), { encoding: 'utf8' });
var row = fs.readFileSync(path.join(__dirname, '_line.html'), { encoding: 'utf8' });
var staticRoot = path.join(__dirname, 'static');

var server = http.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname;

    if (pathname == '/') {
        renderDirectory(res, '/');
    } else {
        pathname = path.join(staticRoot, pathname);

        fs.exists(pathname, function (exists) {
            fs.stat(pathname, function (err, stats) {
                if (err) return errors.send500(res);


            });
        });
    }
});

function renderDirectory(res, dir) {
    var html = templateCache
        .replace('{{pageTitle}}', dir)
        .replace('{{folderName}}', dir)
        .replace('{{files}}', row.replace('{{name}}', 'Yesss'));

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

server.listen(8001, function () {
    console.log('Server is running on port 8001');
});
