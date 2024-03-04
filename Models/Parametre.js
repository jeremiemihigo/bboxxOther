const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    customer : {type:String, required:false},
    customer_cu : {type:String, required:false, default :""},
    id : {type:String, required:true},
    nomClient : {type:String, required:false},
    shop : {type:String, required:false},
    region : {type:String, required:false},
})
const model = mongoose.model("Parametre", schema)
module.exports = model