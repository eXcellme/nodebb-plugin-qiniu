'use strict';

var request = require('request'),
    winston = require('winston'),
    fs = require('fs'),
    db = module.parent.require('./database'),
    token = require('./token');

(function(qiniu) {
    var uploadArgs = {};
    db.getObject('nodebb-plugin-qiniu',function(err,obj){
        uploadArgs = obj;
    });
    qiniu.init = function(app, middleware, controllers) {
        app.get('/admin/plugins/qiniu', middleware.admin.buildHeader, renderAdmin);
        app.get('/api/admin/plugins/qiniu', renderAdmin);
        app.post('/api/admin/plugins/qiniu/save', save);
    };

    function renderAdmin(req, res, next) {
        db.getObjectFields('nodebb-plugin-qiniu',['accessKey','secretKey','bucketName','expireTime'],  function(err, policy) {
            if (err) {
                return next(err);
            }
            res.render('admin/plugins/qiniu', policy);
        });
    }

    function save(req, res, next) {
        if(req.body.uploadArgs !== null && req.body.uploadArgs !== undefined) {
            db.setObject('nodebb-plugin-qiniu', req.body.uploadArgs, function(err) {
                if (err) {
                    return next(err);
                }
                uploadArgs = req.body.uploadArgs;
            });
        }
    }

    qiniu.upload = function (image, callback) {
        if(!uploadArgs.accessKey || !uploadArgs.secretKey || !uploadArgs.bucketName) {
            return callback(new Error('wrong args for qiniu upload'));
        }
        if(!image || !image.path) {
            return callback(new Error('wrong image'));
        }
        uploadToqiniu(uploadArgs, image, function(err, data) {
            if(err) {
                return callback(err);
            }
            console.log('upload success,',data);
            callback(null, {
                // TODO
                url: 'http://'+uploadArgs.bucketName + '.qiniudn.com/'+data.key,
                name: image.name
            });
        });
    };

    function uploadToqiniu(uploadArgs, image, callback) {
        var qiniuToken = token.genToken(uploadArgs);
        var post = request.post('http://up.qiniu.com', function (err, req, body) {
            if(err) {
                return callback(err);
            }
            try {
                var response = JSON.parse(body);
                if(!response.error) { // correct response like [{"hash":...,"key":...}];otherwise like {error:'...'}
                    callback(null, response);
                } else {
                    callback(new Error(response));
                }
            } catch(e) {
                winston.error('Unable to parse qiniu json response. [' + body +']');
                callback(e);
            }
        });
        var upload = post.form();
        upload.append('type', 'file');
        upload.append('token',qiniuToken);
        upload.append('file', fs.createReadStream(image.path));
    }

    var admin = {};

    admin.menu = function(menu, callback) {
        menu.plugins.push({
            route: '/plugins/qiniu',
            icon: 'fa-picture-o',
            name: 'qiniu'
        });
        callback(null, menu);
    };
    qiniu.admin = admin;
}(module.exports));

