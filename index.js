require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoConnection = require('./config/db');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('./src/helper/error-handler');
const server = http.createServer(app);
const clientUrl = process.env.APP_URL;
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: ['http://localhost:5173', clientUrl],
};
mongoConnection();
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.redirect(clientUrl);
});
app.use(express.static(__dirname + '/public'));

//routes
app.use(require('./src/routes/index.routes'));
require('./src/cron');

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server started on ports ${port}`);
});
