//var fs = require('fs')
// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));
var fs = require('fs');

//twitter by default
var stream = T.stream('statuses/filter', { track: ['@StealTheT'] });
stream.on('tweet', tweetEvent);

function tweetEvent(tweet) {

    // Who sent the tweet?
    var name = tweet.user.screen_name;
    // What is the text?
    var txt = tweet.text;
    txt = txt.replace("@StealTheT", "");
    txt = txt.replace(/T/g, '');
    txt = txt.replace(/t/g, '');
    // the status update or tweet ID in which we will reply
    var nameID  = tweet.id_str;

     // Get rid of the @ mention
    // var txt = txt.replace(/@myTwitterHandle/g, "");

    // Start a reply back to the sender
    var reply = "@" + name + ' ' + txt;
    var params             = {
                              status: reply,
                              in_reply_to_status_id: nameID
                             };

    T.post('statuses/update', params, function(err, data, response) {
      if (err !== undefined) {
        console.log(err);
      } else {
        console.log('Tweeted: ' + params.status);
      }
    })
};

// This is the URL of a search for the latest tweets on the '#GeorgiaTech' hashtag.
var gtSearch = {q: "#GeorgiaTech", count: 5, result_type: "recent"};

// This function finds the latest tweet with the #GeorgiaTech hashtag, and retweets it without the T or t.
function retweetWithoutT() {
	T.get('search/tweets', gtSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If our search request to the server had no errors...
	  if (!error) {
	  	// ...then we grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].text;
        retweetId = retweetId.replace(/T/g, '');
        retweetId = retweetId.replace(/t/g, '');
        var b64content = fs.readFileSync('./images/noT.jpeg', { encoding: 'base64' })

// first we must post the media to Twitter
		T.post('media/upload', { media_data: b64content }, function (err, data, response) {
		  // now we can assign alt text to the media, for use by screen readers and
		  // other text-based presentations and interpreters
		  var mediaIdStr = data.media_id_string
		  var altText = "Tech Tower"
		  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

		  T.post('media/metadata/create', meta_params, function (err, data, response) {
		    if (!err) {
		      // now we can reference the media and post a tweet (media will attach to the tweet)
		      var params = { status: retweetId, media_ids: [mediaIdStr] }

		      T.post('statuses/update', params, function (err, data, response) {
		        console.log(data)
		      })
		    }
		  })
		})
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});

}

// This is the URL of a search for the latest tweets on the '#UGA' hashtag.
var ugaSearch = {q: "#UGA", count: 5, result_type: "recent"};

// This function finds the latest tweet with the #UGA hashtag, and retweets it with a little g.
function retweetWithLittleG() {
	T.get('search/tweets', ugaSearch, function (error, data) {
	  // log out any errors and responses
	  console.log(error, data);
	  // If our search request to the server had no errors...
	  if (!error) {
	  	// ...then we grab the ID of the tweet we want to retweet...
		var retweetId = data.statuses[0].text;
        retweetId = retweetId.replace(/G/g, 'g');
        var thwg = "THWg"
        var b64content = fs.readFileSync('./images/2011-september-10-18-4-10.0.jpg', { encoding: 'base64' })

// first we must post the media to Twitter
		T.post('media/upload', { media_data: b64content }, function (err, data, response) {
		  // now we can assign alt text to the media, for use by screen readers and
		  // other text-based presentations and interpreters
		  var mediaIdStr = data.media_id_string
		  var altText = "buzz"
		  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

		  T.post('media/metadata/create', meta_params, function (err, data, response) {
		    if (!err) {
		      // now we can reference the media and post a tweet (media will attach to the tweet)
		      var params = { status: retweetId + "\nTHWg", media_ids: [mediaIdStr] }

		      T.post('statuses/update', params, function (err, data, response) {
		        console.log(data)
		      })
		    }
		  })
		})
        //retweetId = retweetId.replace(/t/g, '');
		// ...and then we tell Twitter we want to retweet it!
		// T.post('statuses/update', {status: retweetId + "\nTHWg" }, function (error, response) {
		// 	if (response) {
		// 		console.log('Success! Check your bot, it should have retweeted something.')
		// 	}
		// 	// If there was an error with our Twitter call, we print it out here.
		// 	if (error) {
		// 		console.log('There was an error with Twitter:', error);
		// 	}
		// })
	  }
	  // However, if our original search request had an error, we want to print it out here.
	  else {
	  	console.log('There was an error with your hashtag search:', error);
	  }
	});
}

// Try to retweet something as soon as we run the program...
retweetWithoutT();
retweetWithLittleG();
// ...and then every 10 minutes after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 10 = 10 minutes --> 1000 * 60 * 10
setInterval(retweetWithoutT, 1000 * 60 * 10);
setInterval(retweetWithLittleG, 1000 * 60 * 10);
