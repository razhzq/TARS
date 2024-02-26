

const Candle = require("./class/candle.class");
const Token = require("./class/token.class");

async function main() {
    const candles = await Candle.getAllCandle();
    const filteredCandle = candles.filter(candle => candle.dStatus === 0);

    const targetTime = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    for(let i =0; i < filteredCandle.length; i++) {
        const formattedCandleTime  = new Date(filteredCandle[i].checkPoint).getTime();
        if(formattedCandleTime <= targetTime) {
            await Token.decreaseTokenWeight(filteredCandle[i].id, filteredCandle[i].increment);
            await Candle.updateCandleStatus(filteredCandle[i].id);
        }

        continue
    }

    setTimeout(() => {
        main();
    }, 43200); // run every 12 hours

}

main();