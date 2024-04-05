const { AddCategorie } = require("../Controllers/Video/AddVideo");

const router = require("express").Router();

router.post("/formation", AddCategorie)


module.exports = router;