const axios = require('axios');


async function getTokenHighestLiquidity(tokenName) {
    try {

        let tokenData;
        const response = await axios.get(
            `https://api.dexscreener.com/latest/dex/search?q=${tokenName}`
        )

        //filter according through chains
        tokenData = response.data.pairs;
        tokenData = tokenData.filter((item) => item.chainId === "solana" || item.chainId === "base" || item.chainId === "ton");

        tokenData = tokenData.sort((a,b) => b.liquidity.usd - a.liquidity.usd);

        console.log(tokenData[0]);  // highest liquidity
    } catch (err)
    {
        console.log(err);
    }
}


async function main()
{
    getTokenHighestLiquidity('pepe');
}

main();