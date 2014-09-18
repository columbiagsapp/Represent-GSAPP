
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 2704);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// database
var config = require('./config'),
    mongoose = require('mongoose');

// load models
console.log('load ./models/image'.magenta);

// Bootstrap db connection
console.log('config.db:' + config.db);
var db = mongoose.connect(config.db);


//ROUTES
app.get('/', routes.index);

app.get('/landing', routes.landing);

app.get('/stats', routes.stats);

app.get('/fetch', routes.fetch);

app.get('/grid', routes.grid);

app.get('/edit', routes.edit);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
