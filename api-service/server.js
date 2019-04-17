const express = require('express');
var bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
var weather = require('openweather-apis');
 
weather.setLang('it');
weather.setUnits('metric');
weather.setAPPID('79176779e66a794eb53ea0316714f7c9');

const mongo = require('mongodb').MongoClient;
const url = 'mongodb://mongo:27017';

const app = express();
const port = 3000;


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
                            console.log(k);
                            if(req.headers.pwd == k.pwd){

                                return res.send('already registered change endpoint to /weather with this token '+k.token+' this is your refresh token '+k.refresh_token);
                            }

                            else{

                                return res.send('invalid email id and password');
                            }                                        
                        }
                
                        else{
                            var token1 = uuidv1();
                            var refreshtoken1 = uuidv1();
                    

                            await collection.insertOne({email:req.headers.email,pwd:req.headers.pwd,token:token1,refresh_token:refreshtoken1,validity:Math.floor(new Date() / 1000)+259200});
                            
                            return res.send('registration successful hit endpoint /weather by adding this token in headers'+token1+' this is your refresh token '+refreshtoken1);



                            }}
                    catch(e){
                            console.log(e);
                        }
                    }
                registration();
                }
            else{
                return res.send('please send email and pwd in headers');
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
                                    return res.send(err);
                                }
                                return res.json(JSONObj);
                              });
                           
                        }
                        else{
                            
                            return res.send('validity of token is expired please send refresh token in headers at endpoint /refreshtoken');
                        }

                    }
                    else{
                        return res.send('not registered please registered at /register endpoint');
                    }



                }
                catch(e){
                    console.log(e);
                }


            }

            weather1();

        }
        else{
            res.send('please provide token in headers');
        }


    });

    app.get('/refreshtoken',function(req,res){

        if(req.headers.refreshtoken){

            async function refreshToken(){

                var k = await  collection.findOne({refresh_token:req.headers.refreshtoken});
                if(k){

                    var newtoken = uuidv1();
                    var newrefreshtoken = uuidv1();
                    await collection.update({email:k.email},{$set:{token:newtoken,refresh_token:newrefreshtoken,validity:Math.floor(new Date() / 1000)+259200}});
                    return res.send('new token generated hit endpoint /weather by adding this token in headers'+newtoken+' this is your refresh token '+newrefreshtoken);


                }
                else{
                    return res.send('invalid refreshtoken');
                }
            }

            refreshToken();

        }
        else{
            res.send('please refresh token in headers')
        }

    });

    app.listen(port, () => console.log(`api app listening on port ${port}!`));

});