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
  
    await page.waitForSelector('input[autocomplete="current-password"]', {
      timeout: 1000000,
    });
    await page.type('input[autocomplete="current-password"]', "T6zcoXeGlN");
  
    //span login
    const spanLogin = await page.evaluateHandle((text) => {
      const spans = Array.from(document.querySelectorAll("span"));
      return spans.find((element) => element.textContent === text);
    }, "Log in");
  
    if (spanLogin) {
      await spanLogin.click(); // Click on the <span> element with the text "Next"
    } else {
      console.error('Could not find the <span> element with the text "Next"');
    }
  
  
    // await page.click('div[data-testid="LoginForm_Login_Button"]');
  
    await page.waitForTimeout(4000);
    const targetText = "Following";
  
    // Use XPath to find the element by its text content
    const xpathExpression = `//*[contains(text(), "${targetText}")]`;
    const [element] = await page.$x(xpathExpression);
    if (element) {
      await element.evaluate(b => b.click());
      // await element.click();
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
    // await page.waitForNavigation();
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
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/search?q=${tokenName}`
      );
      const tokenData = response.data.pairs;
  
      // Filter tokens by chain
      const filteredTokens = tokenData.filter((obj) => obj.chainId === "solana" || obj.chainId === "base" || obj.chainId === "ton");
      console.log(filteredTokens);
  
      // Check if any of the filtered tokens meet all conditions
      return filteredTokens.some((obj) => {
        const hasSymbol =
          obj.baseToken.symbol.toLowerCase() === tokenName.toLowerCase() ||
          obj.baseToken.symbol
            .toLowerCase()
            .startsWith("$" + tokenName.toLowerCase());
        const hasVolume = parseInt(obj.volume.h24) >= 50000; // Minimum volume condition
  
        return hasSymbol && hasVolume;
      });
    } catch (error) {
      console.error("dexScreenerAPI: ", error);
      return false; // Explicitly return false in case of an error
    }
  }

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
    // console.log(tokenMatchedTweets);
    return tokenMatchedTweets;
}


(async () => {
  // constant
  const accountMap = await getAccountMap();

  const page = await twitterlogin();
  setInterval(async () => {
    const tweets = await scrapeTweets(page);
    const uniqueTweets = await removeDuplicate(tweets);
    const tokenTweets = await extractToken(uniqueTweets);
  }, 60000);
})();