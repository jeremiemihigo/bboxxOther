const modelTicket = require('../../Models/Ticket/Ticket')

module.exports = {
  AddTicket: (req, res) => {
    try {
      const { codeAgent } = req.user
      const { idTypeDemandeTicket, commentaire, idPlainte } = req.body
      if (!idPlainte) {
        return res.status(201).json("Veuillez renseigner la plainte")
      }
      
    } catch (error) {
      console.log(error)
    }
  },
}
