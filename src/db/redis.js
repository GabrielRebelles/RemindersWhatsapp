const redis = require("redis");

const client= redis.createClient({
    host:process.env.RedisHost,
    port:process.env.RedisPort,
    password:process.env.RedisPassword,
})

async function getValue(key){
    return new Promise((res,rej)=>{
        client.get(key,(err,value)=>{
            if(!err&&value){
                res(value)
            }else{
                rej(err)
            }
        });
    }) 
}

async function insertValue(key,value){
    client.set(key, value);
}


module.exports={insertValue,getValue}