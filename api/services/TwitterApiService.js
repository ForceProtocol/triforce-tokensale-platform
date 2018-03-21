/**
 * MailchimpService
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Twitter = require('twitter');
var connectedToRealTime = false;

module.exports = {

	
	/**
	* Collate user ID retweets against a tweet
	*/
	findTwitterIdsFromUsername: function (bearerToken,username) {
	

		return new sails.bluebird(function(resolve, reject) {
			
			var twitterClient = new Twitter({
				consumer_key: sails.config.twitterService.consumer_key,
				consumer_secret: sails.config.twitterService.consumer_key,
				bearer_token: bearerToken
			});
			
			twitterClient.get("users/show",
			{
				screen_name: username
			},
			function(err, tweet, response) {
			
				if(err){
					console.error("Check Retweets Error: ",err);
					return reject(err);
				}else{
				
					jsonResponse = JSON.parse(response.body);
					
					userId = jsonResponse.id_str;
					
					return resolve(userId);
				}
			});
		
		});
		
	},
	
	
	
	/**
	* Collate user ID retweets against a tweet
	*/
	checkRetweets: function (bearerToken,tweetId, cursor) {
	
		var retweetIds;
		
		return new sails.bluebird(function(resolve, reject) {
		
			var twitterClient = new Twitter({
				consumer_key: 'Ief0uelYEH3sHIBusJmaXrUyK',
				consumer_secret: '08fWVfdyGZiHX0vF31zm7O3ZtoZ8tS9WyJizp7ITckvJtMz6yK',
				bearer_token: bearerToken
			});
			
			twitterClient.get("statuses/retweeters/ids",
			{
				id: tweetId,
				cursor: cursor,
				stringify_ids: true,
				count: 100
			},
			function(err, tweet, response) {
			
				if(err){
					console.error("Check Retweets Error: ",err);
					return reject(err);
				}else{
				
					jsonResponse = JSON.parse(response.body);
					
					retweetIds = jsonResponse.ids;
					
					console.log("next page is:",jsonResponse);
					
					// check if there is more reweets to cycle through
					if(jsonResponse.next_cursor_str != "0"){
											
						TwitterApiService.checkRetweets(bearerToken,tweetId,jsonResponse.next_cursor_str).then(function(data){
						
							console.log("The total retweets orignal: ",retweetIds.length);
							console.log("The total retweets on next page: ",data.length);
							console.log("The total copmbined: ",retweetIds.concat(data));
						
							resolve(retweetIds.concat(data));
						}).catch(function(err){
							console.log("checkretweets error:",err);
							return reject(err);
						});
					}else{
						resolve(retweetIds);
					}
				}
			});
		
		});
		
	},
	
	
	
	/**
	* Connect to a stream
	*/
	connectStream: function () {
	
		return new sails.bluebird(function(resolve, reject) {
		
			console.log("Connecting to twitter stream");
			
			if(sails.config.environment == 'development'){
				return resolve(true);
			}
			
			if(connectedToRealTime){
				return resolve(true);
			}
		
			var twitterClient = new Twitter({
				consumer_key: 'Ief0uelYEH3sHIBusJmaXrUyK',
				consumer_secret: '08fWVfdyGZiHX0vF31zm7O3ZtoZ8tS9WyJizp7ITckvJtMz6yK',
				access_token_key: "869611199159250945-fdkRLUBbs6T8HDM4lMxyCHcSf1IPfA5",
				access_token_secret: "M4j4NXO8AXLUns2PtS2uDfeX4bNjrXcxwMRmDdh3j7K8A"
			});
			
			connectedToRealTime = true;
			
			var stream = twitterClient.stream('statuses/filter', {follow: '869611199159250945'});
			
			stream.on('data', function(event) {

				// We had a retweet happen
				if(typeof event.retweeted_status !== 'undefined'){
				
					var uid = event.user.id_str,
					followers = event.user.followers_count,
					tweetId = event.retweeted_status.id_str;
					
					TwitterFollowers.findOne({uid:uid}).exec(function(err,follower){
					
						
						if(err || typeof follower == 'undefined'){
							if(err){
								sails.log.error("Cant find twitter follower with ID provided:",err);
								sails.log.error("Cant find twitter follower with ID provided:",uid);
							}
						}
						else{
							// Make sure they havent already been recorded for this
							FollowerTweetsTracked.findOne({stakeType:1,tweetid:tweetId,twitterFollower:follower.uid}).populate('twitterFollower').exec(function(err,result){
							
								if(err){
									sails.log.error("Update retweet follower error in stream: ",err);
								}else if(typeof result == 'undefined'){
								
									// Update this followers details
									TwitterFollowers.update({uid:uid},{retweets:follower.retweets + 1,stakes:follower.stakes + 10,followers:followers}).exec(function(err,updated){
										if(err){
											sails.log.error("Update retweet follower error in stream: ",err);
										}
										
										// Now insert this tweet as being tracked against the user
										FollowerTweetsTracked.create({tweetid:tweetId,stakeType:1,twitterFollower:follower.uid}).exec(function(err,created){});
									});
								
								}else{
									console.log("User retweet already tracked");
								}
								
							});
						}
					});
				}
				
			});
			 
			stream.on('error', function(err) {
				sails.log.error("Twitter Stream API error occured",err);
			});
			
			
			var stream2 = twitterClient.stream('user', { stringify_friend_ids: true });


			// User liked our tweet
			stream2.on('favorite', function (event) {
				var uid = event.source.id_str,
				followers = event.source.followers_count,
				tweetId = event.target_object.id_str;
				
				TwitterFollowers.findOne({uid:uid}).exec(function(err,follower){
					
					if(err || typeof follower == 'undefined'){
						if(err){
							sails.log.error("Cant find twitter follower with ID provided for like:",err);
							sails.log.error("Cant find twitter follower with ID provided for like:",uid);
						}
					}
					else{
						// Make sure they havent already been recorded for this
						FollowerTweetsTracked.findOne({stakeType:2,tweetid:tweetId,twitterFollower:follower.uid}).populate('twitterFollower').exec(function(err,result){
						
							if(err){
								sails.log.error("Update likes follower error in stream: ",err);
							}else if(typeof result == 'undefined'){
							
								// Update this followers details
								TwitterFollowers.update({uid:uid},{likes:follower.likes + 1,stakes:follower.stakes + 5,followers:followers}).exec(function(err,updated){
									if(err){
										sails.log.error("Update likes follower error in stream: ",err);
									}
									
									// Now insert this tweet as being tracked against the user
									FollowerTweetsTracked.create({tweetid:tweetId,stakeType:2,twitterFollower:follower.uid}).exec(function(err,created){});
								});
							
							}else{
								console.log("User like already tracked");
							}
							
						});
					}
				});
			});
			
			
			stream2.on('error', function(err) {
				sails.log.error("Twitter Stream 2 API error occured",err);
			});
			
			
			return resolve(true);
		});
	}
	
	
};

