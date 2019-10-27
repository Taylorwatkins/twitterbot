// Our Twitter library
var Twit = require('twit');

// Data from file
var fs = require('fs')

// We need to include our configuration file
var T = new Twit(require('./config.js'));

// Pull all twitter account info from another file
var config = require('./config.js');

// This is the URL of a search for the latest tweets on the '#GeorgiaTech' hashtag.
var georgiaTechSearch = {q: "#GeorgiaTech", count: 10, result_type: "recent"}; 

// Make a Twit object for connection to the API
var T = new Twit(config);

// Set up a user stream tracking mentions to username
var stream = T.stream('statuses/filter', { track: '@StealTheT' });

// Now looking for tweet events
stream.on('tweet', tweetEvent);

// Use request for expanding given tweet url which gets shortened by twitter by default
var Q = require("q");
var request = require("request");
// Code for expanding url shortened by twitter
function expandUrl(shortUrl) {
    var deferred = Q.defer();
    request( { method: "HEAD", url: shortUrl, followAllRedirects: true },
        function (error, response) {
            if (error) {
                deferred.reject(new Error(error));
            } else {
                deferred.resolve(response.request.href);            
            }
    });
    return deferred.promise;
}

function tweetEvent(tweet) {
   // Who is this in reply to?
   var reply_to = tweet.in_reply_to_screen_name;
   
   // What is the text?  
   var txt = tweet.text
   
   // Get rid of the @ mention
   short_url = txt.replace(/@StealTheT /g,'');
   
   var tweet_link = '';
   // Expand the shortened url
  
   expandUrl(short_url).then(function (longUrl) {
      var my_regex = /https:\/\/twitter\.com\/([a-zA-Z0-9_.]+)\/status\/([0-9]+)\?/g;
      var extracted_info = my_regex.exec(longUrl); // Username of the given tweet owner
    
      var name = extracted_info[1]; // Id of the given tweet
      var id = extracted_info[2];
     
      // If this was in reply to me
      if (reply_to === 'StealTheT') {
         var file_text = '';
         fs.readFile('input.txt', (err, data) => {
           if (err) throw err;
           file_text = data.toString();
           // Start a reply back to the sender
           var replyText = '@'+ name + ' ' + file_text + ' Right?!';
               
           T.post('statuses/update', { status: replyText, in_reply_to_status_id: id}, tweeted);
          // Make sure it worked!
          function tweeted(err, reply) {
            if (err) {
              console.log(err.message);
            } else {
              console.log('Tweeted: ' + reply.text);
            }
        }
      })
    }
  });
}

// This function finds the latest tweet with the #GeorgiaTech hashtag, and retweets it without any T.
function retweetWithoutT() {
	T.get('search/tweets', georgiaTechSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If our search request to the server had no errors...
	  if (!error) {
	  	// ...then we grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].text;
        retweetId = retweetId.replace(/T/g, '');
        retweetId = retweetId.replace(/t/g, '');
		// ...and then we tell Twitter we want to retweet it!
		T.post('statuses/update', {status: retweetId }, function (error, response) {
			if (response) {
				console.log('Success! Check your bot, it should have retweeted something.')
			}
			// If there was an error with our Twitter call, we print it out here.
			if (error) {
				console.log('There was an error with Twitter:', error);
			}
		})
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});
}

// Try to retweet something as soon as we run the program...
retweetWithoutT();
// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetWithoutT, 1000 * 60 * 5);
