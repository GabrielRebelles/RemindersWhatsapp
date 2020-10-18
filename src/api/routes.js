const express = require("express");
const router = express.Router();
const auth=require("./auth")
const dbRedis=require("../db/redis")


const wa = require('@open-wa/wa-automate');
let clientWA 
let timeOutIDs=[]
init()


//ahora el modelo esta almacenado en esta constante
const Task=require('../db/reminders');
const Users=require('../db/users');


router.get("/",secure, getTasks);
router.get("/:id",secure, getTasks);
router.post('/',secure,insertTask)
router.put('/:id',secure, updateTask)
router.delete('/:id',secure,deleteTask)
router.post('/login/',login)
router.post('/register/',register)
router.post('/validatelogin/',secure,(req,res,next)=>{
    res.status(200).json({username:req.body.userjwt})
})


async function getTasks(req, res){
    let task
    if(req.params.id){
        task= await Task.find({_id:req.params.id,user:req.body.userjwt})
    }else{
        task= await Task.find({user:req.body.userjwt})
    }
    res.json(task)
}
async function insertTask(req, res){
    let {phone,time,description,userjwt}=req.body;    
    
    if(!isNaN(phone)&&!isNaN(time)&&description.length>0){
        const task = new Task({phone,time,description,user:userjwt})
        await task.save();     

        createCron(time,phone,description)
        res.json({err:false,message:"Recordatorio creado",reminder:task})
    }else{
        res.json({err:true,message:"Datos ingresados invalidos"})
    }  
}
async function updateTask(req, res){
    Task.findOne({_id:req.params.id})
    .then(async(task)=>{
        if(task.user==req.body.userjwt){        
            if(req.body.user)delete req.body.user;
            const newTask=req.body;
            await Task.findByIdAndUpdate(req.params.id,newTask)
            //limpia la task queue de timeOuts
            //luego consulta a la db y crea los timeOuts nuevos:
            deleteAllTimeOuts()
            res.json({message:'Recordatorio actualizado'})
        }else{
            res.json({message:'Usuario no autorizado'})
        }
    })
    .catch(()=>{
        res.json({err:true,message:'Recordatorio no encontrado'})
    })  
}
async function deleteTask(req, res){
    Task.findOne({_id:req.params.id})
    .then(async (task)=>{        
        if(task.user==req.body.userjwt){        
            await Task.findByIdAndRemove(req.params.id)
            deleteAllTimeOuts()
            res.json({err:false,message:'Recordatorio eliminado'})
        }else{
            res.json({err:true,message:'Usuario no autorizado'})
        }
    })
    .catch(()=>{
        res.json({err:true,message:'Recordatorio no encontrado'})
    })    
}


//Auth:

async function login(req,res) {
    const {username,password}=req.body;

    let user = await Users.findOne({username})
    if (user!=null && user.password===password){
        //genero el token:
        const token=await auth.sign({user:user.username})
        res.status(200).send({
            err:false,
            token:token
        })
    }else{
        res.status(401).send({
            err:true,
            message: 'Usuario o contraseña incorrecta'
        })
    }
}
async function register(req,res){
    const {username,password}=req.body;
    let userExist = await Users.findOne({username})
    if(!userExist){
        const user = new Users({username,password})
        await user.save();     
        res.json({err:false,message:"Usuario creado con exito!"});
    }else{
        res.json({err:true,message:"Usuario existente, elija otro."})
    }
}
function secure(req, res, next) {
    auth.logeado(req)
    .then(() => {
        //si las credenciales son correctas pasa al siguien middleware
        next();
    })
    .catch(() => {
        //si no son correctas envia un 401
        res.status(401).send({
            message: "No autorizado",
        });
    });
}


//Whatsapp:
async function sendWA(number,message){
    
    number=number+"@c.us";

    clientWA = clientWA || await wa.create()
    let idGroup

    await dbRedis.getValue(number)
        .then((data)=>{
            idGroup=data
        })
        .catch(async()=>{
            let group = await clientWA.createGroup("Recordatorios",number)
            if (group.gid!=undefined) {
                idGroup=group.gid._serialized
                await dbRedis.insertValue(number,idGroup)
                clientWA.setGroupIcon(idGroup,require("./utils/groupIcon"))
            }
        })
        
    setTimeout(async ()=>{
        return await clientWA.sendText(idGroup, message);
    },2000)
    return true
}


//Cron

async function createCron(time,phone,description) {
    let newTime = time-new Date().getTime()
    let idTime
    if (newTime>=0) {
        idTime=setTimeout(async ()=>{
            sendWA(phone,description)
            await Task.findOneAndDelete({time,phone,description})
            console.log(`Se envio la tarea "${description}" a "${phone}"`);
        },newTime)
        timeOutIDs.push(idTime)
    }else{
        await Task.findOneAndDelete({time,phone,description})
    }
}
async function deleteAllTimeOuts(){
    timeOutIDs.forEach((element)=>{
        clearTimeout(element)
    })
    init()
}


//Init

async function init(){
    clientWA = clientWA || await wa.create()

    reminders= await Task.find()
    reminders.forEach(element => {        
        createCron(element.time,element.phone,element.description)
    });

}


module.exports = router;
