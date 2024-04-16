const modelPermission = require('../Models/Permission')
const { generateNumber } = require('../Static/Static_Function')
const modelDepartement = require('../Models/Departement')

module.exports = {
  Permission: (req, res) => {
    try {
      const { title, departement } = req.body
      if (!title || !departement) {
        return res.status(404).json('Veuillez renseigner les champs')
      }
      const id = generateNumber(5)
      modelPermission
        .create({ title, departement, id })
        .then((result) => {
          if (result) {
            return res.status(200).json(result)
          } else {
          }
        })
        .catch(function (err) {
          return res.status(404).json('Error : ' + err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  AddDepartement: (req, res) => {
    try {
      const { departement } = req.body
      if (!departement) {
        return res.status(201).json('Veuillez renseigner les champs')
      }
      const id = generateNumber(6)
      modelDepartement
        .create({ departement, idDepartement: id })
        .then((result) => {
          if (result) {
            return res.status(200).json(result)
          } else {
          }
        })
        .catch(function (err) {
          return res.status(404).json('Error : ' + err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  ReadDepartement: (req, res) => {
    try {
      modelDepartement
        .find({}, { _id: 0 })
        .lean()
        .then((result) => {
          if (result.length > 0) {
            return res.status(200).json(result.reverse())
          } else {
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  },
  ReadPermission: (req, res) => {
    try {
      modelDepartement
        .aggregate([
          {
            $lookup: {
              from: 'permissions',
              localField: 'idDepartement',
              foreignField: 'departement',
              as: 'department',
            },
          },
        ])
        .then((result) => {
          if (result.length > 0) {
            return res.status(200).json(result.reverse())
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
