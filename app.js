global.__baseDir = __dirname;
var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const config = require(__baseDir + '/config');

var client_history = require('./routes/clienthistory')
// const MongoClient = require('mongodb').MongoClient; / * If you would like to dump fetched recordset to nosql local db */

const BigQuery = require('@google-cloud/bigquery');

var app = express();
app.use(cors());  /* Important to include  else preflight request from browser will fail and cors error will be there */
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


global.bigquery = new BigQuery({
  projectId: config.projectId,
});

/** Database connection 
// if you would like to integrate nosql db as i said ;)

MongoClient.connect(config.URL, function (err, client) {
  if (err) {
    console.log(err);
  } else {
    global.db = client.db(config.n_bigdata);
  }
});

*/


app.use('/userevents', client_history);  // A sample route which demonstrate restful query and json output of fetched records 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
