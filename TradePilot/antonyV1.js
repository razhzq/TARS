const Token = require('../class/token.class');

const main = async () => {
     const tokens = await Token.getAllTokens();
     const filteredTokens = tokens.filter((item) => item.tokenWeight >= 3)
     console.log(filteredTokens);
}

main();