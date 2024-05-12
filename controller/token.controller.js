require("dotenv").config();
const Tweet = require("../class/tweet.class");
const Mention = require("../class/mention.class");
const Token = require("../class/token.class");

module.exports.tokenRankingHour = (hour = 0) => {
  return (req, res, next) => {
    var currentDate = new Date();

    var currentHour = currentDate.getHours();
    var hoursAgo = currentHour - hour;

    if (hoursAgo < 0) {
      currentDate.setDate(currentDate.getDate() - 1);
      hoursAgo += 24;
    }

    currentDate.setHours(hoursAgo);
    req.currentDate = currentDate;

    if (hour == 0) {
      req.hour = 0;
    }
    req.hour = hour;
    next();
  };
};

module.exports.getTokenRanking = async (req, res) => {
  const tweets = await Tweet.getTweets();
  const tokens = await Token.getAllTokens();
  const mentions = await Mention.getAllMention();

  const timeFilter = req.currentDate;
  const hourCond = req.hour;
  console.log("hour cond", hourCond);
  // console.log(timeFilter);
  //console.log("tweet time", tweets[0].tweetTime)
  const timeFilteredTweets = tweets.filter((tweet) =>
    hourCond === 0
      ? tweet.tweetTime <= timeFilter
      : tweet.tweetTime >= timeFilter
  );
  //console.log(timeFilteredTweets.length);

  const tokenMap = new Map();
  let furthestTimestamp = -Infinity;
  let closestTimestamp = Infinity;

  const currentTime = new Date();

  timeFilteredTweets.forEach(({ tweetTime, tweetToken }) => {
    if (tokenMap.has(tweetToken)) {
      const timeDifference = Math.abs(
        new Date(tweetTime).getTime() - currentTime.getTime()
      );
      if (timeDifference > furthestTimestamp) {
        furthestTimestamp = timeDifference;
        // Retrieve the current value of latestTimeDetection and update it if necessary
        const currentEntry = tokenMap.get(tweetToken);
        tokenMap.set(tweetToken, {
          earliestTimeDetection: currentEntry.earliestTimeDetection,
          latestTimeDetection: tweetTime, // Update latestTimeDetection
          tweetToken,
        });
      } else if (timeDifference < closestTimestamp) {
        closestTimestamp = timeDifference;
        // Retrieve the current value of earliestTimeDetection and update it if necessary
        const currentEntry = tokenMap.get(tweetToken);
        tokenMap.set(tweetToken, {
          earliestTimeDetection: tweetTime, // Update earliestTimeDetection
          latestTimeDetection: currentEntry.latestTimeDetection,
          tweetToken,
        });
      }
    } else {
      tokenMap.set(tweetToken, {
        earliestTimeDetection: tweetTime,
        latestTimeDetection: tweetTime,
        tweetToken,

      });
    }
  });

  const tokenRanks = Array.from(tokenMap.values());
  //add token weight and total account mentioned

  for (let i = 0; i < tokenRanks.length; i++) {
    const token = tokens.filter(
      (item) => item.tokenName === tokenRanks[i].tweetToken
    );

    const mentionsTokenArr = mentions.filter(
      (item) => item.tokenId === token[0].tokenId
    );

    // unique account mentions
    const uniqueMentions = mentionsTokenArr.reduce((acc, current) => {
      const existingEntry = acc.find(
        (item) => item.accountId === current.accountId
      );
      if (!existingEntry) {
        acc.push({ accountId: current.accountId, tokenId: current.tokenId });
      }

      return acc;
    }, []);

    tokenRanks[i].tokenWeight = token[0].tokenWeight;
    tokenRanks[i].network = token[0].network;
    tokenRanks[i].link = token[0].link;
    tokenRanks[i].totalMentioned = uniqueMentions.length;
  }

  res.status(200).json(tokenRanks);
};
