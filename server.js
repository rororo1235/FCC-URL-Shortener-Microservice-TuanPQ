'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

var bodyParser = require("body-parser");

var shortLinkApp = require("./shortLinkApp.js");

// Basic Configuration 
var port = process.env.PORT || 3000;

var router = express.Router();

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

app.use(cors());

var timeout = 10000;

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({
  extended : false
}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var Link = shortLinkApp.LinkModel;

var createLink = shortLinkApp.doShortLink;

var getLink = shortLinkApp.doGetLink;

router.get("/api/shorturl/:urlId", (req, res, next) => {
  var urlIdStr = req.params.urlId;
  var urlId = parseInt(urlIdStr);
  if (urlIdStr != urlId) 
    return next({message: "short id wrong fomart!"});
  var t = setTimeout(() => next({ message : "Time Out!" }), timeout);
  getLink(urlId, (error, link) => {
    clearTimeout(t);
    if(error || !link){ 
      return next({message : "No short url found for given input"});
    }
    res.redirect(link.original_url);
  });
});


router.post("/api/shorturl/new", (req, res, next) => {
  var t = setTimeout(() => next({ message : "Time Out!" }), timeout);
  createLink(req.body.url, (error, data) => {
    clearTimeout(t);
    if(error){ 
      return next({message : "Invalid url!"});
    }
    if(!data) {
      return next({message : "Missing data!"});
    }
    Link.findById(data._id).exec((error, link) => {
      if (error) {
        return next(error);
      } else res.json({
        original_url : link.original_url,
        short_url : link.short_url
      }); 
    });
  });
  
});

app.use("/", router);

// Error handler
app.use(function(err, req, res, next) {
  if(err) {
    if(err.message){
      res.status(500).json({error : err.message});
    } else
    res.status(500)
      .type('txt')
      .send('SERVER ERROR');
  }
});

// Unmatched routes handler
app.use(function(req, res){
  if(req.method.toLowerCase() === 'options') {
    res.end();
  } else {
    res.status(404).type('txt').send('Not Found');
  }
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});