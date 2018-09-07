var express = require('express');
var formidable = require('formidable');
var cloudinary = require('cloudinary');
var fs = require('fs');
var app = express();
app.set('view engine', 'ejs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
cloudinary.config({ 
    cloud_name: '***', 
    api_key: '*********', 
    api_secret: '********' 
  });


app.get('/', function (req, res){
 
    res.sendFile("/<path to upload_file.html>");
});
app.get('/Previous', function (req, res){
   MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var mysort = { name: 1 };
        dbo.collection("Images").find().sort(mysort).toArray(function(err, result) {
          if (err) throw err;
          console.log(result[0]);
          db.close();
          console.log(result.length);
          res.render('<path to display.html>', {
              result: result,
          });
        });
    });
});
app.post('/', function (req, res){
    var form = new formidable.IncomingForm();
    var publicid;
    var iurl;
    form.parse(req, function (err, fields, files) {
        var oldpath = files.file.path;
        var img = fs.readFileSync(oldpath);
        cloudinary.uploader.upload(oldpath, function (result) {
          for(var attributename in result){
            if(attributename=='public_id'){
              publicid=result[attributename]
            }
            if(attributename=='url'){
              iurl=result[attributename]
            }
        }
        
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
         var myobj = { name:publicid , imageURl: iurl };
          dbo.collection("Images").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          });
          
        var mysort = { name: 1 };
          dbo.collection("Images").find().sort(mysort).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
          });
          
        });
        res.writeHead(200, { 'Content-Type': 'image/gif' });
        res.end(img, 'binary');
        });
        });
   
   });
app.listen(3000);