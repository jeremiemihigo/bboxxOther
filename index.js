"use strict";

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/Connection");
const app = express();
app.use(cors());
const bodyParser = require("body-parser");
require("dotenv").config();
connectDB();
const { PeriodeDemande } = require("./Controllers/Parametre");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;


const bboxx = require("./Routes/Route");
const conge = require("./Routes/Conge")
app.use(PeriodeDemande);
app.use("/bboxx/support", bboxx);
app.use("/admin/conge", conge);
app.use("/bboxx/image", express.static(path.resolve(__dirname, "Images")));

// Middleware
app.get("/message", (req, res) => {
  return res.status(200).json([
    {
      numero: "+243979527648",
      message: "premier message au premier numero",
    },
    {
      numero: "+243971828749",
      message: "deuxieme message au deuxieme numero",
    },
    {
      numero: "+243992736928",
      message: "troisieme message",
    },
    {
      numero: "+243979527648",
      message:
        "Bonjour Monsieur votre eleve a reussit avec la mention S, veuillez passer à la direction pour plus de précision",
    },
  ]);
});


//Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// // Socket.IO