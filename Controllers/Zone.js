const modelZone = require("../Models/Zone");
const { isEmpty, generateString } = require("../Static/Static_Function");
const asyncLab = require("async");
const modelAgent = require("../Models/Agent");

module.exports = {
  Zone: (req, res) => {
    try {
      const { denomination } = req.body;
      console.log(req.body);
      if (isEmpty(denomination)) {
        return res.status(400).json("Veuillez renseigner la dénomination");
      }
      asyncLab.waterfall([
        function (done) {
          modelZone
            .findOne({ denomination: denomination.trim().toUpperCase() })
            .then((response) => {
              if (response) {
                return res.status(400).json("Opération déjà effectuée");
              } else {
                done(null, false);
              }
            })
            .catch(function (err) {
              return res.status(400).json("Erreur");
            });
        },
        function (zone, done) {
          modelZone
            .create({ denomination, id: new Date(), idZone: generateString(4) })
            .then((response) => {
              if (response) {
                return res.status(200).json(response);
              } else {
                return res.status(400).json("Erreur d'enregistrement");
              }
            })
            .catch(function (err) {
              return res.status(400).json("Erreur");
            });
        },
      ]);
    } catch (error) {
      return res.status(400).jon("Erreur");
    }
  },
  ReadZone: (req, res) => {
    try {
      modelZone
        .aggregate([
          {
            $lookup: {
              from: "agents",
              pipeline: [{ $match: { fonction: "tech" } }],
              as: "techListe",
            },
          },
          {
            $lookup: {
              from: "agents",
              pipeline: [{ $match: { fonction: "agent" } }],
              as: "agentListe",
            },
          },
        ])
        .then((response) => {
          return res.status(200).json(response.reverse());
        })
        .catch(function (err) {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  },
  AffecterZone: (req, res) => {
    try {
      const { _id, zones } = req.body;
      if (!_id || !zones) {
        return res.status(400).json("Veuillez selectionner l'agent");
      }
      asyncLab.waterfall([
        function (done) {
          modelAgent
            .findByIdAndUpdate(
              _id,
              {
                $addToSet: {
                  zones,
                },
              },
              { new: true }
            )
            .then((response) => {
              if (response) {
                done(null, response);
              } else {
                return res.status(400).json("Erreur");
              }
            })
            .catch(function (err) {
              return res.status(400).json("Erreur");
            });
        },
        function (response, done) {
          modelAgent
            .aggregate([
              { $match: { _id: response._id } },
              {
                $lookup: {
                  from: "zones",
                  localField: "zones",
                  foreignField: "idZone",
                  as: "zone",
                },
              },
              {
                $project: {
                  zones: 0,
                },
              },
            ])
            .then((z) => {
              return res.status(200).json(z);
            })
            .catch(function (err) {
              return res.status(400).json("Erreur");
            });
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  },
};
