const env = require(`./env/${process.env.ENV}.js`);
const { getGHlCred } = require("./util/helpers");
const subscribeQueue = require("./queue/index");
const mainRouter = require("./routes/index");
const mongoose = require("mongoose");

const express = require("express");
const app = express();
const server = require("http").createServer(app);

// app.use(express.urlencoded());
app.use(express.json());

mongoose.connect(env["mongoURL"], env["mongoOptions"]);

app.use(env["API"], mainRouter);

server.listen(env["PORT"], async function () {
  console.log("Server at port " + env["PORT"]);
  await getGHlCred(env.ghlClientId);
  subscribeQueue();
});
