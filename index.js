"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var fs = require("fs");
var path = require("path");
var express = require("express");
var MarkdownIt = require("markdown-it");
// let's add some changes.
function fooHandler(req, res) {
    res.setHeader('content-type', 'text/plain');
    return res.end('you have reached page foo');
}
function barHandler(req, res) {
    res.setHeader('content-type', 'text/plain');
    return res.end('you have reached page BAR');
}
function defaultHandler(req, res) {
    return fs.readFile(path.join(__dirname, 'read.js'), 'utf8', function (err, data) {
        res.setHeader('content-type', 'text/plain');
        if (err) {
            res.statusCode = 500;
            res.end('Error: ' + err.stack);
        }
        else {
            res.end(data);
        }
    });
}
var app = express();
function sayHelloMiddleware(req, res, next) {
    console.log('we are saying hello', req.url);
    next();
}
function errorMiddleware(err, req, res, next) {
    res.statusCode = 500;
    res.end('This is the default error handler' + err.stack);
}
function throwErrorIfReached(req, res) {
    throw new Error("I am reached");
}
function mapUrlToFilePath(url, folderName) {
    return path.join(__dirname, folderName, url);
}
function configurableStaticFileHandler(folderName) {
    return function staticFileHandler(req, res, next) {
        // 1 - identify which particular file that this request is asking for.
        // 2 - find that file, read it, and then serve out the result.
        // hello.html
        // /hello.html.
        // /hello.html => static/hello.html
        // /test.html => static/test.html
        // <url> => static/<url>
        var mappedPath = mapUrlToFilePath(req.url, folderName);
        var md = new MarkdownIt();
        // .md => md.render
        // .png => pass through (binary instead of utf8)
        // .html => pass through.
        fs.readFile(mappedPath, function (err, data) {
            if (err != null) {
                next(err);
            }
            else {
                console.log('mappedPath =', mappedPath, path.extname(mappedPath));
                switch (path.extname(mappedPath)) {
                    case '.md':
                        // convert this data over from html to markdown.
                        try {
                            return res.end(md.render(data.toString('utf8')));
                        }
                        catch (e) {
                            return next(e);
                        }
                    default:
                        return res.end(data);
                }
            }
        });
    };
}
app.use(sayHelloMiddleware);
app.get('/foo', fooHandler);
//app.post('/foo', fooHandler);
app.get('/bar', barHandler);
app.get('/xyz', function (rqe, res) {
    res.end('this is the XYZ handler');
});
app.get('/error', throwErrorIfReached);
app.use(express.static(path.join(__dirname, 'static')));
app.use(configurableStaticFileHandler('static'));
// called back.
// by using callback - Node.js handles IO asynchronously.
var server = http.createServer(app);
var PORT = 8000;
server.listen(PORT, function (err) {
    console.log('running server on ', PORT, err);
});
//# sourceMappingURL=index.js.map