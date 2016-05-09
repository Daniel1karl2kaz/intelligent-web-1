/**
* Client variable is an object of the twitter api
* Objects in the client include the consumer_key, consumer_secret, access_token, access_token_secret
* @param consumer_key
* @param consumer_secret
* @param access_token
* @param access_token_secret
**/

var protocol = require('http');
var static = require('node-static');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var Twit = require('twit');
var mysql = require('mysql');
var async = require('async');


var connection = mysql.createConnection(
    {
      host     : '127.0.0.1',
      port     : '3306',
      user     : 'root',
      password : '1234',
      database : 'intelligent'
    }
);
connection.connect();


var client = new Twit({
  consumer_key: 'QQY9a1KOfB9f9yrDu5TPYNxM1',
  consumer_secret: 'KFcrYRVEAou07gQwrjNUmHUsJInLa7kz8TdeCMaxSjC3sD0EEM',
  access_token: '312094689-JpmZ9EJwxUUmZErdzTbagA5zlnndyyXj4ckOVQtE',
  access_token_secret: 'S6U36toKMU9FZNriCh2MqM4ZbYzbnzQ65l8w6m0ydeqEe'
});


var file = new (static.Server)();
var portNo = 3001;
var app = protocol.createServer(function (req, res) {
  var pathname = url.parse(req.url).pathname;
  if ((req.method == 'POST') && (pathname == '/postFile.html')) {
    var body = '';
    req.on('data', function (data) {
      body += data;
      // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
      // flood attack or faulty client
      // (code 413: req entity too large), kill req
      if (body.length > 1e6) {
        res.writeHead(413,
          {'Content-Type': 'text/plain'}).end();
          req.connection.destroy();
        }
      });
      req.on('end', function () {
        var string = JSON.parse(body);
        res.writeHead(200, {"Content-Type": "application/json"});
        

        jsonx = {};
        jsonz = {};
        
      

        function tweets(query, cba) {
          client.get('search/tweets', {q:"@"+query, count:1},
            function (err,data){
              var myTweetsArray = [];
              for(var index in data.statuses){
                var tweet = data.statuses[index];

                myTweetsArray[index] = tweet 
                //console.log(tweet.text)
              }
              // console.log(cba+'xxxxxx');
             cba(myTweetsArray, mergeTweets);

            })
        }
         
        
          
       function mentions(tweetsArray, cba){
        client.get('statuses/user_timeline', {screen_name:"@"+string.teamname, count:1},
          function(err,data,cb) {
            var myMentionsArray = [];
            for(var index in data){
              var tweet = data[index];

              myMentionsArray[index] = tweet
              // console.log(tweet.text);
            }
            
           //  var final = $.merge(jsonx, jsonz)
           // console.log(cba+'xxxxxxxxxxxxxxx')

             cba(tweetsArray,myMentionsArray);
          })

      }

      function mergeTweets(arrayT, arrayM) {
        var resArray = arrayT.concat(arrayM)
        resJson = {};
        for (index in resArray) {
          resJson[index] = resArray[index]
        }
        console.log(resJson)
        res.end(JSON.stringify(resJson));
      
      }

            
        
        var doSometing = function(){

          if (string.checktweet1 && string.checkmentions1 == 'on'){
            tweets(string.teamname, mentions)
         }  
         //  if (string.checktweet1 == 'on'){
         //  return(tweets())
         // }
         // if (string.checkmentions1 == 'on'){
         //  return(mentions())
         // }
        
         
        }
        
        doSometing()



 
     });


    }


    else {
      file.serve(req, res, function (err, result) {
        if (err != null) {
          console.error('Error serving %s - %s', req.url, err.message);
          if (err.status === 404 || err.status === 500) {
            file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
          } else {
            res.writeHead(err.status, err.headers);
            res.end();
          }
        } else {
          res.writeHead(200, {"Content-Type": "text/plain", 'Access-Control-Allow-Origin': '*'});

        }
      });
    }
  }).listen(portNo);
