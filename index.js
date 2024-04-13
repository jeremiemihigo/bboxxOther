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
const modelDemande = require("./Models/Demande")
const asyncLab = require("async")

app.get("/updte", (req, res)=>{
  try {
    asyncLab.waterfall([
      function(done){
        modelDemande.aggregate([{$group : {_id : "$codeAgent"}}, {$lookup:{from:"agents", localField:"_id", foreignField:"codeAgent", as:"agent"}}, {$unwind:"$agent"}]).then(response=>{
          done(null, response)
        })
      },
      function(agent, done){
        for(let i=0; i<agent.length; i++){
          modelDemande.updateMany({codeAgent : agent[i]._id}, {$set : {idShop : agent[i].agent.idShop}}).then(result=>{
            console.log(result)
          })
        }
      }
    ])
  } catch (error) {
    console.log(error)
  }
})
//Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// // Socket.IO