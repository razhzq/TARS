require("dotenv").config();
const Tweet = require("../class/tweet.class");

module.exports.getTokenRanking = async () => {
     const tweets = await Tweet.getTweets();

     const tokenMap = new Map();
     let furthestTimestamp = -Infinity;
     let closestTimestamp = Infinity;

     const currentTime = new Date();

     tweets.forEach(({ tweetTime, tweetToken}) => {
        if(tokenMap.has(tweetToken)) { 
           const timeDifference = Math.abs(new Date(tweetTime) - currentTime);
           if(timeDifference > furthestTimestamp) {
            furthestTimestamp = timeDifference;
            tokenMap.set(tweetToken, { earliestTimeDetection: tweetTime, latestTimeDetection, tweetToken });
           } else if (timeDifference < closestTimestamp) {
            closestTimestamp = timeDifference;
            tokenMap.set(tweetToken, { latestTimeDetection: tweetTime, earliestTimeDetection,  tweetToken });
           }
        } else {
            tokenMap.set(tweetToken, {  earliestTimeDetection: tweetTime, latestTimeDetection: tweetTime,  tweetToken });
        }
     })

     console.log(tokenMap);



}