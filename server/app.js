// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const routes = require('./routes/routes');
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
}));
app.use(cookieParser());
app.use(express.json());
// app.use('/api', routes);
app.use(express.urlencoded({extended: true}));
app.use(express.static("uploads"));
app.use("/api/post", routes);

//database connection
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}).then(() => console.log("Connected to the database!")).catch((err) => console.log(err));

//start server 
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
