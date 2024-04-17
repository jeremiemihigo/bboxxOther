const express = require('express')
const router = express.Router()
const { Zone, ReadZone, AffecterZone } = require('../Controllers/Zone')
const { protect, protectReponse } = require('../MiddleWare/protect')
const { protectTech } = require('../MiddleWare/protectTech')
const {
  AddAgent,
  ReadAgent,
  BloquerAgent,
  UpdateAgent,
  InsertManyAgent,
} = require('../Controllers/Agent')
const {
  login,
  resetPassword,
  LoginAgentAdmin,
  UpdatePassword,
  UpdatePasswordAdmin,
} = require('../Controllers/Login')
const {
  demande,
  DemandeAttente,
  ToutesDemande,
  ToutesDemandeAgent,
  lectureDemandeBd,
  lectureDemandeMobile,
  ToutesDemandeAttente,
  deleteDemande,
  updateDemandeAgent,
} = require('../Controllers/Demande')
const {
  Parametre,
  ReadParametre,
  ReadPeriodeActive,
  deleteParams,
  rechercheClient,
  updateClient,
} = require('../Controllers/Parametre')

const multer = require('multer')
const {
  reponse,
  OneReponse,
  updateReponse,
  ReponseDemandeLot,
  reponseChangeStatus,
} = require('../Controllers/Reponse')
const { Rapport, StatZone } = require('../Controllers/Rapport')
const {
  Reclamation,
  ReadMessage,
  DeleteReclamation,
  demandeIncorrect,
} = require('../Controllers/Reclamation')
const {
  readPeriodeGroup,
  demandePourChaquePeriode,
  // searchPaquet,
  chercherUneDemande,
} = require('../Controllers/Statistique')

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images/')
  },
  filename: (req, file, cb) => {
    const image = file.originalname.split('.')

    cb(null, `${Date.now()}.${image[1]}`)
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)

    if (ext !== '.jpg' || ext !== '.png') {
      return cb(res.status(400).end('only jpg, png are allowed'), false)
    }
    cb(null, true)
  },
})
var upload = multer({ storage: storage })
//Read
const { ReadUser, readUserAdmin } = require('../Controllers/Read')
const { Doublon, ReadDoublon, NonConformes } = require('../Controllers/Doublon')

router.get('/zone', ReadZone)
router.get('/agent', ReadAgent)
router.get('/user', ReadUser)
router.get('/userAdmin', readUserAdmin)
router.get('/message/:codeAgent', ReadMessage)

router.get('/parametreRead', ReadParametre)
router.put('/parametre', updateClient, ReadParametre)
router.get('/customer/:codeclient', rechercheClient)
router.get('/touteDemande', ToutesDemande)
router.get('/toutesDemandeAttente', protect, ToutesDemandeAttente)
//Rapport visite ménage
router.post('/rapport', protect, Rapport)
router.get('/oneReponse/:id', OneReponse)
//Create

router.post('/paramatre', Parametre)
router.post('/postzone', Zone)
router.post('/postAgent', AddAgent, ReadAgent)
router.post('/reponsedemande', protectReponse, reponse, Doublon)
router.post('/reclamation', Reclamation, ReadMessage)
//Update
router.put('/zone', AffecterZone)
router.put('/reponse', updateReponse)
router.put('/bloquer', BloquerAgent, ReadAgent)
router.put('/reset', resetPassword, ReadAgent)
router.delete('/deleteReclamation/:id', DeleteReclamation)
router.put('/agent', UpdateAgent, ReadAgent)
router.post('/manyAgent', InsertManyAgent)
router.put('/userId', UpdatePassword)
router.put('/userAdmin', UpdatePasswordAdmin)
//Mobiles
router.get('/demandeReponse/:id', ToutesDemandeAgent)
router.get('/readDemande', DemandeAttente)
// router.post('/demande',  demande)
router.post('/demande', upload.single('file'), demande)

router.post('/demandeImage', upload.single('file'))
router.post('/demandeAgentAll', protect, lectureDemandeBd)

router.post('/login', login)
router.post('/loginUserAdmin', LoginAgentAdmin)

//Lien après presentation du systeme
router.get('/demandeAll/:lot/:codeAgent', lectureDemandeMobile)
router.get('/paquet', protectTech, readPeriodeGroup)
// router.get('/lot', searchPaquet)
router.get('/periodeActive', ReadPeriodeActive)
router.get('/demandePourChaquePeriode', demandePourChaquePeriode)
router.get('/statZone', StatZone)
router.delete('/deleteParams', deleteParams)

router.delete('/demande/:id', deleteDemande)
router.get('/reponseAll', ReponseDemandeLot)

//Raison
const {
  AddRaison,
  ReadRaison,
  Ajuster,
  UpdateRaison,
} = require('../Controllers/Raison')
const {
  AddAdminAgent,
  ResetPasswords,
  ReadAgentAdmin,
  BloquerAgentAdmin,
  AddTache,
} = require('../Controllers/AgentAdmin')
const {
  AddShop,
  ReadShop,
  UpdateOneField,
  AddResponsable,
} = require('../Controllers/Shop')
const { AddAction } = require('../Controllers/Action')
const {
  Permission,
  AddDepartement,
  ReadPermission,
  ReadDepartement,
} = require('../Controllers/Permission')
router.post('/ajuster', Ajuster)
router.post('/raison', AddRaison)
router.get('/raison', ReadRaison)
router.put('/raison', UpdateRaison)

//Shop
router.post('/shop', AddShop, ReadShop)
router.get('/shop', ReadShop)
router.put('/shop', UpdateOneField)
router.put('/responsableTicket', protect, AddResponsable, ReadShop)

//Agent
router.post('/addAdminAgent', AddAdminAgent)
router.put('/resetPasswordAgentAdmin', protect, ResetPasswords)
router.get('/readAgentAdmin', protect, ReadAgentAdmin)
router.put('/bloquerAgentAdmin', protect, BloquerAgentAdmin)
router.put('/updateDemande', upload.single('file'), updateDemandeAgent)
router.get('/idDemande/:id', protect, chercherUneDemande)

//Actions
router.post('/action', AddAction)
router.get('/demandeIncorrect', protect, demandeIncorrect)
router.get("/doublon", ReadDoublon)
router.post("/conformite", NonConformes)
//================================================================Departement et permission================================================================================================
router.post('/permission', Permission)
router.post('/departement', AddDepartement)
router.get('/permission', ReadPermission)
router.get('/departement', ReadDepartement)
router.put("/addTache", AddTache)

router.get("/changeStatus", reponseChangeStatus)
module.exports = router
