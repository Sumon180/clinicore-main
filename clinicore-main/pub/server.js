const env = require(`./env/${process.env.ENV}.js`);
const mainRouter = require("./routes/webhook");
const startListeningSocket = require("./util/socket");

const express = require("express");
const app = express();
const server = require("http").createServer(app);

app.use(express.urlencoded());
app.use(express.json());

app.use(env["API"], mainRouter);


server.listen(env["PORT"], function () {
    console.log("Server at port " + env["PORT"]);
});

startListeningSocket();