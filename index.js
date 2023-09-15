const express = require('express');
require('dotenv').config({path: './.env'});

const app = express();

const config = require('./config/index');
const fileUploadRoutes = require('./routes/fileUpload.routes');

const port = config.PORT;

app.use(express.json());

fileUploadRoutes(app);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json({ error: 'Something went wrong!' });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
