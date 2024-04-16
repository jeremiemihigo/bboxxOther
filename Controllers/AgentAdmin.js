const ModelAgentAdmin = require('../Models/AgentAdmin')
const ModelAgentCorbeille = require('../Models/Corbeille/Corbeille')
const asyncLab = require('async')
const bcrypt = require('bcrypt')

module.exports = {
  //Corbeille done
  AddAdminAgent: (req, res) => {
    try {
      const { nom,codeAgent, code, departement } = req.body
       //Agent admin qui fait l'operation
      if (!nom || !code || !departement) {
        return res.status(404).json('Veuillez renseigner les champs')
      }
      asyncLab.waterfall(
        [
          function (done) {
            ModelAgentAdmin.findOne({ codeAgent: code })
              .then((agent) => {
                if (agent) {
                  return res
                    .status(404)
                    .json('ce code existe deja')
                } else {
                  done(null, agent)
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (agent, done) {
            ModelAgentAdmin.create({
              nom,
              password: '1234',
              departement,
             
              codeAgent: code,
              id: new Date(),
            })
              .then((result) => {
                if (result) {
                  done(null, result)
                }
              })
              .catch(function (err) {
              
                if (err) {
                  return res.status(404).json('Error')
                }
              })
          },
          function (result, done) {
            ModelAgentCorbeille.create({
              codeAgent: result.codeAgent,
              doBy: codeAgent,
              operation: 'ajouter',
            })
              .then((response) => {
                done(result)
              })
              .catch(function (err) {
                if (err) {
                  return res.status(404).json('Error')
                }
              })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json(result)
          } else {
            return res.status(404).json("Erreur d'enregistrement")
          }
        },
      )
    } catch (error) {
      return res.status(404).json('Error')
    }
  },
  //Corbeille done
  ResetPasswords: (req, res) => {
    const { id } = req.body

    const { codeAgent } = req.user //Agent admin qui fait l'operation
    if (!id) {
      return res.status(201).json('Error')
    }
    asyncLab.waterfall(
      [
        function (done) {
          bcrypt.hash('1234', 10, function (err, bcrypePassword) {
            ModelAgentAdmin.findByIdAndUpdate(
              id,
              { $set: { password: bcrypePassword, first: true } },
              { new: true },
            )
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                  return res.status(201).json('Erreur')
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          })
        },
        function (response, done) {
          ModelAgentCorbeille.create({
            codeAgent,
            doBy,
            operation: 'reinitialiser',
          })
            .then((response) => {
              done(response)
            })
            .catch(function (err) {
              console.log(err)
            })
        },
      ],
      function (result) {
        if (result) {
          return res.status(200).json('Réinitialisation effectuée')
        } else {
          return res.status(200).json('Erreur')
        }
      },
    )
  },
  ReadAgentAdmin: (req, res) => {
    try {
      ModelAgentAdmin.aggregate([
        {
          $lookup: {
            from: 'permissions',
            localField: 'taches',
            foreignField: 'id',
            as: 'tache',
          },
        },
        {
          $lookup: {
            from: 'departements',
            localField: 'departement',
            foreignField: 'idDepartement',
            as: 'departements',
          },
        },
      ])

        .then((agents) => {
          if (agents.length > 0) {
            return res.status(200).json(agents.reverse())
          } else {
            return res.status(200).json([])
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  BloquerAgentAdmin: (req, res) => {
    try {
      const { id } = req.body
      const { codeAgent } = req.user //Agent admin qui fait l'operation
      if (!codeAgent || !id) {
        return res.status(404).json('Erreur')
      }
      asyncLab.waterfall(
        [
          function (done) {
            ModelAgentAdmin.findByIdAndUpdate(
              id,
              { $set: { active: false, first: true } },
              { new: true },
            )
              .then((response) => {
                if (response) {
                  done(null, response)
                } else {
                  return res.status(201).json('Erreur')
                }
              })
              .catch(function (err) {
                console.log(err)
              })
          },
          function (response, done) {
            ModelAgentCorbeille.create({
              codeAgent: response._id,
              doBy: codeAgent,
              operation: 'bloquer',
            })
              .then((response) => {
                done(response)
              })
              .catch(function (err) {
                console.log(err)
              })
          },
        ],
        function (result) {
          if (result) {
            return res.status(200).json(result)
          } else {
            return res.status(200).json('Erreur')
          }
        },
      )
    } catch (error) {
      console.log(error)
    }
  },
  AddTache: (req, res) => {
    try {
      const { codeAgent, tache } = req.body
      ModelAgentAdmin.findOneAndUpdate(
        { codeAgent },
        { $addToSet: { taches: tache } },
        { new: true },
      )
        .then((result) => {
          if (result) {
            return res.status(200).json(result)
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
}
