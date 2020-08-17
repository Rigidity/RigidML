const {listen} = require("../index");

const port = +(process.argv[2] || "25565");
const app = listen(port);
app.pageFile("/", "home.js");

console.log(`The example page is now listening on port ${port}.`);