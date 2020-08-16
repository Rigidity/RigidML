const {listen} = require("../index");

const port = +(process.argv[2] || "8080");
const app = listen(port);
app.pageFile("/", "home.js");
app.api("/api", $ => {
	$.result("Test");
});
console.log(`The example page is now listening on port ${port}.`);