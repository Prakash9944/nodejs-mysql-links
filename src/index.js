// var apm = require('/Users/apple/development/git/atatus/atatus-nodejs').start({
//   // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
//   // serviceName: '',
//     notifyHost: 'localhost',
//     notifyPort: '8091',
//   // // Use if APM Server requires a token
//   // secretToken: '',

//   // // Set custom APM Server URL (default: http://localhost:8200)
//   // serverUrl: '',
//   // logLevel: '',
//   // asyncHooks: false
//   appName: 'mysql sample app',
//   licenseKey: 'lic_apm_0dc7f9851bc44b08ad915eca1ed05b51'
// });
// require('newrelic');

// var atatus = require("atatus-nodejs");
// atatus.start({
//     licenseKey: "lic_apm_6e49699e38c8498f9a29a05b1adc0182",
//     appName: "node mongo 3.6",
// });

const tracer = require('dd-trace').init()

DD_ENV="stageing"
DD_LOGS_INJECTION=true

// Load env vars
require('dotenv').config()

// Require logger agents
const { stLogger, stHttpLoggerMiddleware } = require('sematext-agent-express')


const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');

const { database } = require('./keys');

// Intializations
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

// Middlewares
app.use(stHttpLoggerMiddleware)
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(session({
  secret: 'faztmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', (req, res, next) => {
  stLogger.info('Hello World.')
  stLogger.debug('Hello debug.')
  stLogger.warn('Some warning.')
  stLogger.error('Some error.')
  res.status(200).send('Hello World.')
})
// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
});
