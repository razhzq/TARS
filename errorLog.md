6/5/22

/Users/orca/Desktop/TARS/TARS/node_modules/puppeteer-core/lib/cjs/puppeteer/common/ExecutionContext.js:311
        throw new Error('Execution context was destroyed, most likely because of a navigation.');
              ^

Error: Execution context was destroyed, most likely because of a navigation.
    at rewriteError (/Users/orca/Desktop/TARS/TARS/node_modules/puppeteer-core/lib/cjs/puppeteer/common/ExecutionContext.js:311:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async #evaluate (/Users/orca/Desktop/TARS/TARS/node_modules/puppeteer-core/lib/cjs/puppeteer/common/ExecutionContext.js:250:60)
    at async IsolatedWorld.document (/Users/orca/Desktop/TARS/TARS/node_modules/puppeteer-core/lib/cjs/puppeteer/common/IsolatedWorld.js:111:26)
    at async IsolatedWorld.$x (/Users/orca/Desktop/TARS/TARS/node_modules/puppeteer-core/lib/cjs/puppeteer/common/IsolatedWorld.js:117:26)
    at async twitterlogin (/Users/orca/Desktop/TARS/TARS/scrape.js:43:21)
    at async /Users/orca/Desktop/TARS/TARS/scrape.js:273:16

Node.js v20.11.1


