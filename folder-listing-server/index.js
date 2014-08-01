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
    var dirToRead = path.join(staticRoot, dir);
    var html = templateCache.replace('{{pageTitle}}', dir).replace('{{folderName}}', dir);
    var rowsHtml = '';

    fs.readdir(dirToRead, function (err, files) {
        if (err) return send500();

        var filesLength = files.length;
        var totalIterations = 0;

        files.forEach(function (file) {
            var filePath = path.join(dirToRead, file);
            fs.stat(filePath, function (err, stats) {
                totalIterations++;

                if (stats.isDirectory()) {
                    rowsHtml += renderRow({
                        link: file,
                        name: file,
                        type: 'directory',
                        modifiedAt: '--'
                    });
                } else {
                    rowsHtml += renderRow({
                        link: file,
                        name: file,
                        type: 'document',
                        modifiedAt: stats.mtime
                    });
                }

                if (filesLength <= totalIterations) {
                    html = html.replace('{{files}}', rowsHtml);

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(html);
                }
            });
        });
    });
}

function renderRow(data) {
    return row.replace('{{link}}', data.link)
        .replace('{{name}}', data.name)
        .replace('{{type}}', data.type)
        .replace('{{modifiedAt}}', data.modifiedAt);
}

server.listen(8001, function () {
    console.log('Server is running on port 8001');
});
