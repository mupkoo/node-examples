module.exports.send404 = function (res) {
    res.writeHead(404, {
        'Content-Type': 'text/plain'
    });

    res.end('404: File Not Found');
};

module.exports.send500 = function (res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('500: Internal server error');
};
