const { publicCORS } = require(`../env/${process.env.ENV}.js`);
const cors = require("cors");
const { migrateContact, migrateInvoice } = require('../controllers/migration');

const express = require("express");
const router = express.Router();


router.get("/health", cors(publicCORS), (req, res) => {
    res.status(200).send({message: "I am good. How are you?"})
});

router.get( "/migration/contact", migrateContact);

router.get( "/migration/invoice", migrateInvoice);

module.exports = router;
