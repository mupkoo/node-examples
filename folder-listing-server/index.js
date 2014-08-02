// Modules
var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');
var mime = require('mime');
var moment = require('moment');
var errors = require('./libs/errors.js');

var staticRoot = path.join(__dirname, 'static');

// Preload the tempaltes
var templateCache = fs.readFileSync(path.join(__dirname, 'index.html'), { encoding: 'utf8' });
var rowTemplate = fs.readFileSync(path.join(__dirname, '_row.html'), { encoding: 'utf8' });

var server = http.createServer(function (req, res) {
    var absPath;
    var pathname = url.parse(req.url).pathname;

    if (pathname == '/') {
        parseFolder(res, '');
    } else {
        absPath = path.join(staticRoot, pathname);

        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.stat(absPath, function (err, stats) {
                    if (err) return errors.send500(res);

                    if (stats.isDirectory()) {
                        parseFolder(res, pathname);
                    } else {
                        sendFile(res, pathname);
                    }
                });
            } else {
                errors.send404(res);
            }
        });
    }
});

function parseFolder(res, folder) {
    var absPath = path.join(staticRoot, folder);

    fs.readdir(absPath, function (err, files) {
        if (err) {
            errors.send404(res);
        } else {
            parseFiles(res, folder, files);
        }
    });
}

function parseFiles(res, folder, files) {
    var absPath = path.join(staticRoot, folder);
    var data = { files: [], folders: [] };
    var counter = 0;
    var filesLength = files.length;
    var temp, filePath;

    if (folder !== '') {
        var segments = folder.split(path.sep);
        var link;

        segments.pop();
        link = segments.join(path.sep);

        data.folders.push({
            link: (link === '' ? '/' : link),
            name: '..',
            type: 'directory',
            modifiedAt: '',
            modifiedAgo: '--'
        });
    }

    files.forEach(function (file) {
        filePath = path.join(absPath, file);

        fs.stat(filePath, function (err, stats) {
            temp = {
                link: folder + '/' + file,
                name: file
            };

            if (stats.isDirectory()) {
                temp.type = 'directory';
                temp.modifiedAt = '';
                temp.modifiedAgo = '--';

                data.folders.push(temp);
            } else {
                temp.type = 'document';
                temp.modifiedAt = stats.mtime;
                temp.modifiedAgo = moment(stats.mtime).fromNow();

                data.files.push(temp);
            }

            // Render the folder if this is the last file
            counter++;
            if (filesLength <= counter) {
                renderFolder(res, folder, data);
            }
        });
    });
}

function renderFolder(res, folder, data) {
    var rows = '';

    data.folders.concat(data.files).forEach(function (record) {
        rows += renderRow(record);
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
        templateCache
            .replace('{{pageTitle}}', folder)
            .replace('{{folderName}}', folder)
            .replace('{{rows}}', rows)
    );
}

function renderRow(data) {
    return rowTemplate
        .replace('{{link}}', data.link)
        .replace('{{name}}', data.name)
        .replace('{{type}}', data.type)
        .replace('{{modifiedAt}}', data.modifiedAt)
        .replace('{{modifiedAgo}}', data.modifiedAgo);
}

function sendFile(res, file) {
    var absPath = path.join(staticRoot, file);

    fs.readFile(absPath, function (err, data) {
        if (err) return errors.send404(res);

        res.writeHead(200, { 'Content-Type': mime.lookup(file) });
        res.end(data);
    });
}

server.listen(8001, function () {
    console.log('Server is running on port 8001');
});
