const {listen} = require("rigidml");

const port = +(process.argv[2] || "8080");
const app = listen(port);
app.pageFile("/", "home.rml.js");
console.log(`The example page is now listening on port ${port}.`);