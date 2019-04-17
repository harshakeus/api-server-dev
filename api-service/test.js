var weather = require('openweather-apis');

weather.setLang('it');
weather.setUnits('metric');
weather.setAPPID('79176779e66a794eb53ea0316714f7c9');

weather.setCoordinate(50.0467656, 20.0048731);

weather.getAllWeather(function(err, JSONObj){
    console.log(JSONObj);
});

volumes:
- ~/apimongo/data:/data