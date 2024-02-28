require("dotenv").config();
const puppeteer = require("puppeteer");
const axios = require("axios");
const Tweet = require("./class/tweet.class");
const Token = require("./class/token.class");
const Account = require("./class/account.class");
const Mention = require("./class/mention.class");
const Candle = require("./class/candle.class");
const { getAccountMap } = require("./helpers");

async function twitterlogin() {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.goto("https://twitter.com");
  await page.setViewport({ width: 1080, height: 1024 });
  await page.waitForSelector('a[data-testid="loginButton"]');
  await page.click('a[data-testid="loginButton"]');
  await page.waitForSelector('div[aria-labelledby="modal-header"]');
  await page.waitForSelector('input[autocomplete="username"]');
  await page.type('input[autocomplete="username"]', "STEFjpeg");

  const span = await page.evaluateHandle((text) => {
    const spans = Array.from(document.querySelectorAll("span"));
    return spans.find((element) => element.textContent === text);
  }, "Next");

  if (span) {
    await span.click(); // Click on the <span> element with the text "Next"
  } else {
    console.error('Could not find the <span> element with the text "Next"');
  }

  await page.waitForSelector('input[autocomplete="current-password"]');
  await page.type('input[autocomplete="current-password"]', "T6zcoXeGlN");
  await page.click('div[data-testid="LoginForm_Login_Button"]');

  await page.waitForTimeout(4000);
  const targetText = "Following";

  // Use XPath to find the element by its text content
  const xpathExpression = `//*[contains(text(), "${targetText}")]`;
  const [element] = await page.$x(xpathExpression);
  if (element) {
    await element.click();
  }
  return page;
}

// returns 200 tweets array
async function scrapeTweets(page) {
  //scroll to the end of page
  await page.evaluate(() => {
    location.reload(true);
    window.scrollTo(0, 0);
  });

  // wait for tweets to load
  await page.waitForNavigation();
  await page.waitForSelector('[data-testid="tweetText"]');

  let tweetsArray = [];
  let count = 0;

  while (tweetsArray.length < 200) {
    // scroll down
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await page.waitForSelector('[data-testid="tweetText"]');

    const tweetTexts = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll(
        '[data-testid="tweetText"]'
      );

      const texts = [];

      for (let i = 0; i < tweetElements.length; i++) {
        const tweet = tweetElements[i].innerText.trim();
        const cleanedTweet = tweet.replace(/\+/g, "").replace(/\n/g, "");
        texts.push(cleanedTweet);
      }
      return texts;
    });

    const tweetUsernames = await page.evaluate(() => {
      const tweetAccounts = document.querySelectorAll(
        '[data-testid="User-Name"]'
      );

      const accounts = [];

      for (let i = 0; i < tweetAccounts.length; i++) {
        const inputString = tweetAccounts[i].innerText.trim();
        const match = inputString.match(/@(\w+)/);
        const username = match ? match[1] : null;

        accounts.push(username);
      }
      return accounts;
    });

    const tweetTimeStamp = await page.evaluate(() => {
      const timeElements = document.querySelectorAll("time");
      const time = [];

      for (let i = 0; i < timeElements.length; i++) {
        const timeOfTweet = timeElements[i].getAttribute("datetime");
        time.push(timeOfTweet);
      }
      return time;
    });

    for (let i = 0; i < tweetTexts.length; i++) {
      if (tweetsArray.some((tweet) => tweetTexts[i] === tweet.tweetString))
        continue;
      count++;
      tweetsArray.push({
        id: count,
        tweetString: tweetTexts[i],
        tweetWho: tweetUsernames[i],
        tweetTime: tweetTimeStamp[i],
      });
    }
    //end of while loop
  }
  return tweetsArray;
}

// remove duplicate from the 200 arrays
async function removeDuplicate(tweetsArray) {
  const tweetsDb = await Tweet.getTweets();
  let newTweetsArray = [];

  for (let i = 0; i < tweetsArray.length; i++) {
    if (
      tweetsDb.some((tweet) => tweet.tweetString === tweetsArray[i].tweetString)
    )
      continue;
    newTweetsArray.push(tweetsArray[i]);
  }
  return newTweetsArray;
}

async function checkTokenChain(tokenName) {
  try {
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/search?q=${tokenName}`);
    const tokenData = response.data.pairs;

    // Filter tokens by chain
    const filteredTokens = tokenData.filter(obj => obj.chainId === "ethereum" || obj.chainId === "solana");

    // Check if any of the filtered tokens meet all conditions
    return filteredTokens.some(obj => {
      const hasSymbol = obj.baseToken.symbol.toLowerCase() === tokenName.toLowerCase() ||
        obj.baseToken.symbol.toLowerCase().startsWith("$" + tokenName.toLowerCase());
      const hasVolume = parseInt(obj.volume.h24) >= 50000; // Minimum volume condition

      return hasSymbol && hasVolume;
    });
  } catch (error) {
    console.error("dexScreenerAPI: ", error);
    return false; // Explicitly return false in case of an error
  }
}

// extract token from the unique arrays and add token array to the tweet objectg
async function extractToken(newTweetsArray) {
  let tokenMatchedTweets = [];

  for (let i = 0; i < newTweetsArray.length; i++) {
    const inputString = newTweetsArray[i].tweetString;
    const matches = [...inputString.matchAll(/\$([a-zA-Z]+)/g)];
    if (matches.length > 0) {
      const signalMatch = await Promise.all(
        matches.map(async (match) => {
          const token = match[1].toLowerCase();
          const checkStatus = await checkTokenChain(token);
          return checkStatus !== false ? token : null;
        })
      );

      const filteredSignalMatch = signalMatch.filter((match) => match !== null);

      const uniqueSignal = filteredSignalMatch.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

      if (uniqueSignal.length > 0) {
        newTweetsArray[i].signals = uniqueSignal;
        tokenMatchedTweets.push(newTweetsArray[i]);
      }
    } else continue;
  }
  console.log(tokenMatchedTweets.length);
  return tokenMatchedTweets;
}

async function handleAccountDetails(accountName, accountsMap) {
  let accountDetails = accountsMap.get(accountName);
  if (!accountDetails) {
    try {
      accountDetails = await Account.getAccountDetails(accountName);
    } catch (error) {
      await Account.saveAccount(accountName, 1);
      accountDetails = await Account.getAccountDetails(accountName);
    }
  }

  return accountDetails;
}

// save tweets tp db
async function saveTweetsToDb(tokenMatchedTweets, accountsMap) {
  let detectedTokens = [];
  console.log("tweets to process: ", tokenMatchedTweets.length);
  for (let i = 0; i < tokenMatchedTweets.length; i++) {
    const tweetSignals = tokenMatchedTweets[i].signals;
    const accountName = tokenMatchedTweets[i].tweetWho;
    const accountDetails = await handleAccountDetails(accountName, accountsMap);
    const accountId = accountDetails.id;
    const accountTier = accountDetails.signalTier;

    console.log(
      `iteration: ${i} accountId:${accountId} accountTier:${accountName}`
    );

    for (let j = 0; j < tweetSignals.length; j++) {
      const tokenExist = await Token.checkTokenIfExist(tweetSignals[j]);
      if (!tokenExist) {
        await Token.saveNewToken(tweetSignals[j]);
      }
      await Tweet.saveNewTweet(
        tokenMatchedTweets[i].tweetString,
        tokenMatchedTweets[i].tweetWho,
        tokenMatchedTweets[i].tweetTime,
        tweetSignals[j]
      );
      const tokenId = await Token.getTokenId(tweetSignals[j]);

      //check if token has been mentioned by the same accounts
      const mentionExist = await Mention.checkTokenMention(tokenId, accountId);
      //assign tokenWeight according to the fact that the token has been mentioned or not
      const accTierWeight = mentionExist ? accountTier / 2 : accountTier;

      // save token mentioned by the account
      await Mention.saveTokenMention(tokenId, accountId);

      //update token Weight
      const newTokenWeight = await Token.increaseTokenWeight(
        tokenId,
        accTierWeight
      );
      //add candle
      await Candle.newTokenCandle(tokenId, newTokenWeight, accTierWeight);
      detectedTokens.push({
        token: tweetSignals[j],
        account: accountName,
      });
    }
  }

  console.log("detected tokens: ", detectedTokens);
}

(async () => {
  // constant
  const accountMap = await getAccountMap();

  const page = await twitterlogin();
  setInterval(async () => {
    const tweets = await scrapeTweets(page);
    const uniqueTweets = await removeDuplicate(tweets);
    const tokenTweets = await extractToken(uniqueTweets);
    await saveTweetsToDb(tokenTweets, accountMap);
  }, 60000);
})();
