const express = require('express');
var bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
var weather = require('openweather-apis');
 
weather.setLang('it');
weather.setUnits('metric');
weather.setAPPID('79176779e66a794eb53ea0316714f7c9');

const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

const app = express();
const port = 3000;

function sendexecptions(state,res){

    switch(state){
        case 1:

        res.status(400).json({
            message: 'user already registered'
        });
        break;
        case 2:
        res.status(401).json({
            message: 'user not registered'
        });
        break;
        case 3:
        res.status(403).json({
            message: 'invalid password'
        });
        break;
        case 4:
        res.status(404).json({
            message: 'no data in headers'
        });
        break;
        case 5:
        res.status(406).json({
            message: 'error occured in api'
        });
        break;
        case 6:
        res.status(407).json({
            message: 'Token expired'
        });
        break;
        case 7:
        res.status(408).json({
            message: 'invalid token'
        });
        break;
        case 8:
        res.status(409).json({
            message: 'invalid refresh token'
        });
        break;

    }

}

app.use(bodyParser.urlencoded({ extended: false }));

mongo.connect(url,{ useNewUrlParser: true }, (err, client) => {

    if (err) {
        console.error(err)
        return
        }


    const db = client.db('APISERVICE');
    const collection = db.collection('users');

        app.get('/registration',function(req,res){

            if(req.headers.email&&req.headers.pwd){

                    async function registration(){

                        try{
                        var k = await  collection.findOne({email:req.headers.email});

                        if(k){
                            sendexecptions(1,res);
                        }
                
                        else{
                            var token1 = uuidv1();
                            var refreshtoken1 = uuidv1();
                    

                            await collection.insertOne({email:req.headers.email,pwd:req.headers.pwd,name:req.headers.name,token:token1,refresh_token:refreshtoken1,validity:Math.floor(new Date() / 1000)+259200});
                            
                            var successfull_registration = {
                                code:200,
                                message:'user registered successfully'
                            }
                            return res.json(successfull_registration);



                            }}
                    catch(e){
                            console.log(e);
                        }
                    }
                registration();
                }
            else{
                sendexecptions(4,res);
            }

    });
    app.get('/auth',function(req,res){
        if(req.headers.email&&req.headers.pwd){

            async function auth(){

                try{
                var k = await  collection.findOne({email:req.headers.email});

                if(k){
                    if(req.headers.pwd == k.pwd){
                    
                        res.json(k);

                    }
                    else{

                        sendexecptions(3,res);
                        

                    }
                }
        
                else{
               
                    sendexecptions(2,res);
                    }

                    
                }
            catch(e){
                    console.log(e);
                }
            }
        auth();


        }
        else{
            sendexecptions(4,res);

        }

    });

    app.get('/weather',function(req,res){

        if(req.headers.token){

            async function weather1(){

                try{
                    var k = await  collection.findOne({token:req.headers.token});

                    if(k){

                        
                        weather.setCoordinate(req.query.lat, req.query.lon);

                        if(Math.floor(new Date() / 1000)<k.validity){
                            weather.getAllWeather(function(err, JSONObj){
                                if(err){
                                    sendexecptions(5,res);
                                }
                                return res.json(JSONObj);
                              });
                           
                        }
                        else{
                            sendexecptions(6,res);
                        }

                    }
                    else{
                        sendexecptions(7,res);
                        }
                    }



                
                catch(e){
                    console.log(e);
                }


            }

            weather1();

        }
        else{
            sendexecptions(4,res);
        
        }


    });

    app.get('/refreshtoken',function(req,res){

        if(req.headers.refreshtoken&&req.headers.email){

            async function refreshToken(){

                var k = await  collection.findOne({email:req.headers.email});
                if(k){
                    if(k.refresh_token == req.headers.refreshtoken){

                    var newtoken = uuidv1();
                    var newrefreshtoken = uuidv1();
                    await collection.update({email:k.email},{$set:{token:newtoken,refresh_token:newrefreshtoken,validity:Math.floor(new Date() / 1000)+259200}});
                    var token_refreshed = {
                        code:200,
                        token:newtoken,
                        refresh_token:newrefreshtoken,
                        message:'token refreshed successfully'
                    }
                    return res.json(token_refreshed);
                    
                    }
                    else{

                        sendexecptions(8,res);

                    }

                }
                else{
                    sendexecptions(2,res);
                }
            }

            refreshToken();

        }
        else{
            sendexecptions(4,res);
        }

    });

    app.listen(port, () => console.log(`api app listening on port ${port}!`));

});