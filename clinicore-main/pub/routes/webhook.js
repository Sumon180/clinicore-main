const { webhookCORS } = require(`../env/${process.env.ENV}.js`);
const cors = require("cors");

const express = require("express");
const router = express.Router();

const { handleWebhook } = require("../controllers/webhook.js");

router.post("/webhook/appointment/:task", cors(webhookCORS), handleWebhook);

router.get("/health/:id", (req, res) => res.status(200).send({ response: req.params.id }));


module.exports = router;
