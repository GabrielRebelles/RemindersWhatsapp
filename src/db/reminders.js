const mongoose = require('mongoose');
const {Schema}=mongoose;


//definimos las propiedades de los datos
const RemindersSchema=new Schema({
    user:{type: String, required: true},
    phone:{type: Number, required: true},
    time:{type: Number, required: true},
    description:{type: String, required: true},
})


module.exports=mongoose.model('Reminders', RemindersSchema)