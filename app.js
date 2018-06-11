var express = require('express');
var app = express();

app.use(express.static('production'));

var port = 3000;
app.listen(port,function(){
    console.log("http://localhost:%d mode::%s",port,app.settings.env)
});
