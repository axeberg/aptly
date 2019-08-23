// Dependencies
import express from 'express';
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const chalk = require('chalk');
const compression = require('compression');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const expressStatusMonitor = require('express-status-monitor');
const bodyParser = require('body-parser');

// Environment variables
require('dotenv').config();

// Route handlers
const authApi = require('./api/v1/auth');

// Create server
const app: express.Application = express();

// Express config
app.set('port', process.env.PORT || 1138);
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);

// Error handler
app.use(errorHandler());

// API Routes
app.use('/api/v1/auth', authApi);

const server = app.listen(app.get('port'), () => {
  console.log(
    '%s The App is running at http://localhost:%d in %s mode',
    chalk.green('✓'),
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C (or CMD-C) to stop\n');
});

const io = require('socket.io')(server);

app.use(expressStatusMonitor({ websocker: io, port: app.get('port') }));