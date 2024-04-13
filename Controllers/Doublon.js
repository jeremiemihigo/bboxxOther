const { ObjectId } = require('mongodb')
const modelDoublon = require('../Models/Doublon')
const modelConversation = require('../Models/Reclamation')
const asyncLab = require('async')

module.exports = {
  Doublon: (req, res) => {
    try {
      if (!req.recherche.present) {
        const { message, idDemande, agentCo, _idDemande } = req.recherche
        modelConversation
          .create({
            message,
            codeAgent: agentCo,
            sender: 'co',
            code: new ObjectId(_idDemande),
          })
          .then((response) => {
            if (response) {
              return res.status(200).json(idDemande)
            }
          })
          .catch(function (err) {
            console.log(err)
          })
      } else {
        const {
          codeclient,
          precedent,
          present,
          agentCo,
          message,
          _idDemande,
        } = req.recherche
        asyncLab.waterfall(
          [
            function (done) {
              modelDoublon
                .create({
                  codeclient,
                  precedent,
                  present,
                })
                .then((response) => {
                  if (response) {
                    done(null, response)
                  }
                })
                .catch(function (err) {
                  console.log(err)
                })
            },
            function (result, done) {
              modelConversation
                .create({
                  message: message,
                  codeAgent: agentCo,
                  sender: 'co',
                  code: new ObjectId(_idDemande),
                })
                .then((response) => {
                  if (response) {
                    done(response)
                  }
                })
            },
          ],
          function (response) {
            if (response) {
              return res.status(200).json(present)
            } else {
            }
          },
        )
      }
    } catch (error) {
      console.log(error)
    }
  },
  ReadDoublon: (req, res) => {
    try {
      const match = { $match: req.body }
      modelDoublon.aggregate([
        match,
        {
          $lookup: {
            from: 'demandes',
            localField: 'precedent',
            foreignField: 'idDemande',
            as: 'precedent',
          },
        },
        { $unwind: '$precedent' },
        {
          $lookup: {
            from: 'demandes',
            localField: 'present',
            foreignField: 'idDemande',
            as: 'present',
          },
        },
        { $unwind: '$present' },
        //Look agent précédent
        {
          $lookup: {
            from: 'agents',
            localField: 'precedent.codeAgent',
            foreignField: 'codeAgent',
            as: 'agentPrecedent',
          },
        },
        { $unwind: '$agentPrecedent' },
        //Look agent present
        {
          $lookup: {
            from: 'agents',
            localField: 'present.codeAgent',
            foreignField: 'codeAgent',
            as: 'agentPresent',
          },
        },
        {
          $unwind: '$agentPresent',
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
}
