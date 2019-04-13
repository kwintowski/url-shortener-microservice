'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var assert = require('assert');
var dns = require('dns');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
// make client connect to mongo service

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

let URL;
try {
  URL = require('./url_model.js');
} catch (error) {
  console.log("Problem using URL Model Module");
}

var createAndSaveURL = function(res, src_url, dest_url, done) {
    
  URL.find({src: src_url}).then(function(result) {
    if(result.length<1) {
      var document = new URL({src:src_url,dest:dest_url});

      document.save(function(err, data) {
        if(err) return done(err);
        console.log('Saving Data...');
        res.send({"original_url":src_url,"short_url":dest_url});
        //done(null);
      })
    }
    else {
      console.log(`Short URL Already exists: ${result[0].dest}`)
      res.send({"original_url":src_url,"short_url":result[0].dest});
        
    }
  });
};

var urlLookup = function(url, next, done) {
    
  URL.findOne({dest: url}, function(err,data) {
    if(err) done(err);
    console.log(data);
    done(data);
  });
}

var getNewURL = function(next, done) {
  
  URL.countDocuments({}, function(err, count){
    if(err) done(err);
    console.log( "Number of docs: ", count );
    done(count);
  });
}

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



// url shortener code...

/** Get data form POST  */
app.route('/api/shorturl/new')
  .post(function(req,res){
    console.log(`Posted URL ${req.body.url}`);
    //remove any leading "http(s)://"
    var url = (req.body.url.indexOf("://")<0?req.body.url:req.body.url.substr(req.body.url.indexOf("://")+3));
    dns.lookup(url,function(err, addr){
      if(err) {
        console.log(err);
        res.send({"error":"invalid URL"});}
      else {
        getNewURL(null,function(data){
          createAndSaveURL(res, req.body.url, data);
        });
      }
  });
});

//get the short url
app.get('/api/shorturl/:link',function(req,res) {
  var shortURL = req.params.link;
  urlLookup(shortURL,null,function(data){
    res.redirect(data.src);
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});