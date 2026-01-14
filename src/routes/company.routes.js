const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");

// Define routes
router.get("/company-data", companyController.getCompanyData);

module.exports = router;
