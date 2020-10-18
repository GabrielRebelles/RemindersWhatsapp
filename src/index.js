require("dotenv").config()
const express = require('express');
const app = express(); 
const path= require('path');

require('./database');
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use((req,res,next)=>{
    //middleware para eliminar el Powered:Express y el cache
    res.removeHeader('X-Powered-By')
    res.set({"Cache-Control":"no-store"})
    next()
})


//routes
app.use('/api',require('./api/routes'))
app.use('/info',(req,res,next)=>{
    res.send(`Server en ${server.address().address+server.address().port}`)
})


//statics
app.use('/',express.static(path.join(__dirname,'public')));


//err 404
app.use((req,res,next)=>{res.redirect('/')})


//server init
const server = app.listen(PORT,()=>{
    console.log(`Server en ${server.address().address+server.address().port}`)
})