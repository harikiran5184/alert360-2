const express=require('express')
const mongoose=require('mongoose')
const nodemailer = require('nodemailer');
const axios=require('axios')
const cors=require('cors')
const cities=require('./cities-name-list.json')
const app=express()
app.use(cors())
app.use(express.json({limit:'30mb'}));
let check=mongoose.connect("mongodb+srv://hari:hari@cluster0.1socvoq.mongodb.net/",{dbName:"project"})
if(check){
    console.log("connected")
    
}
const profilePhoto=require('./models/profile');
const login = require('./models/login');

const transpo=nodemailer.createTransport({
    service:"gmail",
    host:'smtp.gmail.com',
    port:'587',
    secure:false,
    auth:{
      user:"vhkhari2017@gmail.com",
      pass:"ehcn iogy bbjw kzng"
  
    }
  })

app.get('/',(req,res)=>{
    res.json({"data":cities.data})
})
app.get('/search', (req, res) => {
    const s = req.query.data;
    const matchingCities = cities.data.filter(city => city.includes(s));

    res.json({ data:matchingCities });
});
app.post('/profilePhoto',async (req,res)=>{
    const {userName,phone,photo}=req.body
    console.log(userName)
    try{
        let check=await profilePhoto.find({phoneno:phone})
        if(check.length>0){
            const result=await profilePhoto.updateOne({phoneno:phone},{$set:{photo:photo}})
            console.log(result)
            res.json("updated")
        }
        else{
        let data=new profilePhoto({phoneno:phone,userName:userName,photo:photo})
        await data.save();
        res.json("Updated")
        }
    }
    catch(e){
        res.json("update failed")
    }
})
app.post('/getProfilePhoto',async (req,res)=>{
    const {phone}=req.body

    try{
        let check=await profilePhoto.find({phoneno:phone})
        if(check.length>0){
            res.json(check[0].photo)
        }
    }
    catch{

    }
})

app.post('/govAlert',async (req,res)=>{
    const {data}=req.body
    console.log(JSON.parse(data))
    const alertData=JSON.parse(data)
    const mailOptions = {
        to: "akil.paidi@gmail.com",
        from: 'vhkhari2017@gmail.com',
        subject: 'ALERT !!!!',
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Earthquake Alert</title>
<style>
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
        text-align: center;
    }
    .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
        color: #333;
    }
    p {
        color: #666;
        font-size: 18px;
    }
    .location {
        color: #ff5722;
        font-weight: bold;
    }
</style>
</head>
<body>
<div class="container">
    <p>from:${alertData.name}</p>
    <h1>${alertData.disaster.toUpperCase()} ALERT!</h1>
    <p>An ${alertData.disaster.toLowerCase()} has been reported with <h1>${alertData.predicted}</h1> at the following location:</p>
    <p class="location">Location:${alertData.location}</p>
    <p>Please take necessary precautions and stay safe.</p>
</div>
</body>
</html>

        `,
      };
      transpo.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error:', error);
        } else {
          if(info.response.match('OK'))
          res.json({status:true});
        else{
            res.json({status:false})
        }
        }
      });
})

app.post('/updateLocation',async (req,res)=>{
    const {data}=req.body
    const e=JSON.parse(data)
    console.log(e)
    // const location="kothavalasa"
    const datas=await login.updateOne({phoneno:e.phoneno},{$set:{location:e.location}})
    console.log(datas)
    if(datas.acknowledged)
    res.json({status:true})
else{
    res.json({status:false})
}
})
app.post('/updateEmail',async (req,res)=>{
    const {email,phoneno}=req.body
    console.log(email,phoneno)
    // const email="vhkhari2017@gmail.com"
    const data=await login.updateOne({phoneno:phoneno},{$set:{email:email}})
    console.log(data)
    if(data.acknowledged)
    res.json({status:true})
})
app.post('/getEmail',async(req,res)=>{
    const {phoneno}=req.body
    console.log(phoneno)
    const data=await login.findOne({phoneno:phoneno})
    try{
        console.log(data)
        res.json({status:true,email:data.email})
    }
    catch{
        res.json({status:false})
    }
})
app.post('/deviceIdUpdate',async(req,res)=>{
    const {data}=req.body
    const s=JSON.parse(data)
    console.log(s)
    const datas=await login.updateOne({phoneno:s.phoneno},{$set:{DID:s.DID}})
    console.log(datas)
    if(datas.acknowledged)
    res.json({status:true})
    else
    res.json({status:false})
})

app.post('/notifyNearBy',async (req,res)=>{
    const {data}=req.body
    const s=JSON.parse(data)
    const datas=await login.find({location:s.location})
    try{
    datas.forEach(element => {
        console.log(element.DID)
        notification(element.DID,s.body)
    })
    res.json({status:true})
    }
    catch{
        res.json({status:false})
    }
})

 async function notification(token,body){
    const message={
        to: token,
        title:"ALERT!!!",
        body:`There is a ${body.toUpperCase()},please be safe`,
        sound:"default"
    }
    await fetch('https://exp.host/--/api/v2/push/send',{
        method:"POST",
        headers:{
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json"},
        body:JSON.stringify(message)
    })
  }


  app.post('/otp',async (req,res)=>{
    const {email}=req.body
    console.log(email)
    const OTP=otpGenerator()
    try {
      const existingUser = await login.findOne({ email: email });
  
      if (existingUser) {
        return res.json({ otp: 1 });
      }
      else{
        const mailOptions = {
          to: email,
          from: 'vhkhari2017@gmail.com',
          subject: 'OTP from Alert360',
          text: OTP,
        };
        transpo.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error:', error);
          } else {
            if(info.response.match('OK'))
            res.json({otp:OTP});
          }
        });
  }
  }
  catch{
    console.log("error")
  }}
  )
  
  function otpGenerator(){
    const num=Math.random().toString()
    return (num.slice(num.length-7,num.length-1))
  
  }


app.listen(5000,()=>{console.log("server is running")})