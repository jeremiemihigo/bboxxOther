const express = require("express");
const {Contrat, ReadContrat} = require("../Controllers/Admin/Conge/Contrat");
const { protect } = require("../MiddleWare/protect");
const { AddDepartement, AddFonction, ReadDepartement } = require("../Controllers/Admin/Conge/Departement");
const {AgentAdminInfo, ReadAdminInfo} = require("../Controllers/Admin/Conge/AgentAdminInfo");
const { AddConge, ReadConge } = require("../Controllers/Admin/Conge/Conge");
const { Validations } = require("../Controllers/Admin/Conge/Validation");
const router = express.Router();

router.post("/contrat", protect, Contrat, ReadContrat)
router.get("/contrat", protect, ReadContrat)

//Departement
router.post("/departement", protect, AddDepartement)
router.put("/fonction", protect, AddFonction, ReadDepartement)
router.get("/departement",protect, ReadDepartement)

//AgentAdmin Info
router.post("/agentAdminInfo", protect, AgentAdminInfo, ReadAdminInfo)
router.get("/agentAdminInfo", protect, ReadAdminInfo)

//Conge 
router.post("/conge", protect, AddConge, ReadConge)
router.get("/conge", protect, ReadConge)

//Validation
router.post("/validation", Validations, ReadConge)
module.exports = router;