'use strict';

var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function (options) {
    options = options || {};
    var srcDir = path.join(__dirname, options.dir || 'public');
    var dest = options.dest || 'c' // 业务模块构建后所在的根目录
    var filesObj = {};
    var rootPath = path.join(srcDir, dest, options.name, options.version)

    console.log('[In-memory Cache] Load all files under ' + rootPath);

    // 递归获取指定目录下所有文件内容
    function inMemoryFiles (dir, filesObj) {
        var files = fs.readdirSync(dir);
        files.forEach(function (file) {
            var filePath = path.join(dir, file),
                ext = path.extname(file),
                stat = fs.statSync(filePath);
            if (stat.isFile() && (ext == '.js' || ext == '.css') ) {
                filesObj[filePath] = fs.readFileSync(filePath, 'utf-8');
            } else if (stat.isDirectory()) {
                inMemoryFiles(filePath, filesObj);
            }
        });
    }

    try {
        inMemoryFiles(rootPath, filesObj);
    } catch (e) {
        console.error('[In-memory Cache] Load file error :' + e);    
    }
    // 封装获取文件的接口，判断使用缓存还是进行文件IO
    function getFile (path, encoding, callback) {
        var inMemoryFile = filesObj[path];
        if (inMemoryFile) {
            callback(null, inMemoryFile);
        } else {
            fs.readFile(path, encoding, function (err, content) {
                if (!err && content) {
                    filesObj[path] = content;
                }
                callback(err, content);            
            });
        }
    }

    /**
     *  Get all resource form the combo request
     */
    function comb (files, success, fail) {
        var root = srcDir;
        async.map(files, function (file, callback) {
            var filePath = path.join(root, dest, file);
            if (file.match(/\.\./)) {
                // 防止读静态资源目录以外的文件
                callback.call(null, null, '');
            } else {
                getFile(filePath, 'utf-8', function (err, content) {
                    if (err && !err.mod) err.mod = 'combo.readFile';
                    callback.call(err || null, err, content);
                });
            }

        }, function (err, files) {
            if (err && !err.mod) {
                err.mod = 'combo.async';
                fail(err);
            } else {
                success(files);
            }
        });
    }

    return function (req, res, next) {
        var i = req.originalUrl.indexOf('??'),
            j = req.originalUrl.indexOf('&');

        var files = ~j ? req.originalUrl.slice(i + 2, j).split(',') :
                req.originalUrl.slice(i + 2).split(',');

        comb(files, function (resources) {
            ext = path.extname(files[0]);
            ext && res.type(ext.slice(1));
            res.send(resources.join('\n'));
        }, function (err) {
            err = err || {};
            console.error('Comb service error ' + err.message, err.stack);
            res.send(500, 'Comb service error')
        });
    }
}