var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();

// app.use(express.static(path.join(__dirname, 'public')));
app.use('/',express.static(path.join(__dirname, 'client')));

app.set('port',(process.env.PORT || 8080));

// app.get('/',function(req,res){
//   res.sendFile(__dirname + '/client/index.html');
// });

app.listen(app.get('port'),function(err){
  console.log('app listening on... 8080');
});