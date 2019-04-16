var http = require('http'),
    httpProxy = require('http-proxy');
 
var count = 1;
var proxy = httpProxy.createProxyServer({});
 

var server = http.createServer(function(req, res) {
    if(count%3 == 0){
  count ++;
  proxy.web(req, res, { target: 'http://apiservice1:3000' });

    }
    else if(count%3 == 1){
        count ++;
        proxy.web(req, res, { target: 'http://apiservice2:3001' });
    }
    else{
        
        count ++;
         proxy.web(req, res, { target: 'http://apiservice3:3002' });
     }
    
});
 
console.log("listening on port 5050")
try {
    server.listen(5050);    
} catch (error) {
    console.log('ERROR', error);
}
