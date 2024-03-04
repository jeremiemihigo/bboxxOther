const modelAgent = require("../Models/Agent");
const { isEmpty } = require("../Static/Static_Function");
const asyncLab = require("async");

module.exports = {
  AddAgent: (req, res) => {
    try {
      const { nom, codeAgent, fonction, telephone } = req.body.values;
      const { idZone } = req.body.zoneSelect;

      if (isEmpty(nom) || isEmpty(codeAgent) || isEmpty(fonction)) {
        return res.status(400).json("Veuillez renseigner les champs");
      }
      asyncLab.waterfall(
        [
          function (done) {
            modelAgent
              .findOne({ codeAgent: codeAgent.trim() })
              .then((agent) => {
                if (agent) {
                  return res.status(400).json("L'agent existe déjà");
                } else {
                  done(null, false);
                }
              })
              .catch(function (err) {
                return res.status(400).json("Erreur");
              });
          },
          function (agent, done) {
            if (!agent) {
              modelAgent
                .create({
                  nom,
                  password: 1234,
                  codeAgent,
                  codeZone: idZone,
                  fonction,
                  telephone,
                  id: new Date(),
                })
                .then((response) => {
                  if (response) {
                    done(null, response);
                  } else {
                    return res.status(400).json("Erreur d'enregistrement");
                  }
                })
                .catch(function (err) {
                  return res.status(400).json("Erreur");
                });
            } else {
              return res.status(400).json("L'agent existe déjà");
            }
          },
          function (agent, done) {
            modelAgent
              .aggregate([
                { $match: { _id: agent._id } },
                {
                  $lookup: {
                    from: "zones",
                    localField: "codeZone",
                    foreignField: "idZone",
                    as: "region",
                  },
                },
                {
                  $sort: { nom: 1 },
                },
              ])
              .then((response) => {
                if (response) {
                  done(response);
                }
              });
          },
        ],
        function (result) {
          if (result.length > 0) {
            return res.status(200).json(result[0]);
          } else {
            return res.status(400).json("Erreur");
          }
        }
      );
    } catch (error) {
      return res.status(400).json("Erreur d'enregistrement");
    }
  },
  ReadAgent: (req, res) => {
    try {
      modelAgent
        .aggregate([
          {
            $lookup: {
              from: "zones",
              localField: "codeZone",
              foreignField: "idZone",
              as: "region",
            },
          },
          {
            $sort: { nom: 1 },
          },
        ])
        .then((response) => {
          return res.status(200).json(response.reverse());
        });
    } catch (error) {
      console.log(error);
    }
  },
  BloquerAgent: (req, res) => {
    try {
      const { id, value } = req.body;
      modelAgent
        .findByIdAndUpdate(id, { active: value }, { new: true })
        .then((result) => {
          if (result) {
            return res.status(200).json(result);
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  },
  UpdateAgent: (req, res) => {
    try {
      const { values, zoneSelect } = req.body;
      const { _id, nom, codeAgent, fonction, telephone } = values;
      const { idZone } = zoneSelect;
      asyncLab.waterfall(
        [
          function (done) {
            modelAgent
              .findByIdAndUpdate(
                _id,
                {
                  $set: {
                    nom,
                    codeAgent,
                    fonction,
                    telephone,
                    codeZone: idZone && idZone,
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
                return res.status(400).json("Error");
              });
          },
          function (result, done) {
            modelAgent
              .aggregate([
                { $match: { _id: result._id } },
                {
                  $lookup: {
                    from: "zones",
                    localField: "codeZone",
                    foreignField: "idZone",
                    as: "region",
                  },
                },
                {
                  $sort: { nom: 1 },
                },
              ])
              .then((response) => {
                if (response) {
                  done(response);
                }
              });
          },
        ],
        function (result) {
          if (result.length > 0) {
            return res.status(200).json(result[0]);
          } else {
            return res.status(400).json("Erreur");
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  },
  InsertManyAgent : (req, res)=>{
    try {
      const { data } = req.body
      modelAgent
        .insertMany(data)
        .then((response) => {
          if (response) {
            return res.status(200).json(true)
          } else {
            return res.status(200).json(false)
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
}
}