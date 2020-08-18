const {listen} = require("../index");

const port = +(process.argv[2] || "25565");
const app = listen(port);
app.pageFile("/", "home.js", data => {
	data.greet = name => `Hello, ${name}!`;
});

app.api('/api/test', $ => {
	console.log($.data);
});

console.log(`The example page is now listening on port ${port}.`);