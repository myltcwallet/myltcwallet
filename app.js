var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var  fs = require('fs');
var mongoose = require('mongoose');
var uuid = require('node-uuid');







var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } }
  mongoose.connect('mongodb://localhost/wallet', options);
}
connect();

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect();
});



var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})





var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());



app.use(express.static(path.join(__dirname, 'public')));




app.get('/uuid-generator', function(req, res) {
  res.json({uuids:[uuid.v4(),uuid.v4()]});
});

app.get('/ping', function(req, res) {
  res.end("ok");
});




var multiaddrs = require('./app/controllers/multiaddrs');
app.post('/multiaddr',multiaddrs.multiaddr);



var wallets = require('./app/controllers/wallets');

app.get('/wallet/new',wallets.create);

app.get('/wallet/login',wallets.guid);

app.get('/wallet/:guid',wallets.guid);

app.get('/wallet',wallets.guid);

app.post('/wallet',wallets.wallet);


app.post('/pushtx',wallets.pushtx);



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.send(500);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500);
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  //debug('Express server listening on port ' + server.address().port);
});


//module.exports = app;
