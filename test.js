const rigidml = require("./index");

const app = rigidml.listen(25565);
app.pageFile("/", "test.rml.js");
console.log("Test initialized.");