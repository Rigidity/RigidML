const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const {JSDOM} = require("jsdom");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const ratelimit = require("express-rate-limit");

const template = `
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style>
			html, body, div, span, applet, object, iframe,
			h1, h2, h3, h4, h5, h6, p, blockquote, pre,
			a, abbr, acronym, address, big, cite, code,
			del, dfn, em, img, ins, kbd, q, s, samp,
			small, strike, strong, sub, sup, tt, var,
			b, u, i, center,
			dl, dt, dd, ol, ul, li,
			fieldset, form, label, legend,
			table, caption, tbody, tfoot, thead, tr, th, td,
			article, aside, canvas, details, embed, 
			figure, figcaption, footer, header, hgroup, 
			menu, nav, output, ruby, section, summary,
			time, mark, audio, video {
				margin: 0;
				padding: 0;
				border: 0;
				font-size: 100%;
				font: inherit;
				vertical-align: baseline;
			}
			article, aside, details, figcaption, figure, 
			footer, header, hgroup, menu, nav, section {
				display: block;
			}
			body {
				line-height: 1;
			}
			ol, ul {
				list-style: none;
			}
			blockquote, q {
				quotes: none;
			}
			blockquote:before, blockquote:after,
			q:before, q:after {
				content: '';
				content: none;
			}
			table {
				border-collapse: collapse;
				border-spacing: 0;
			}
		</style>
	</head>
	<body>
		<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
	</body>
</html>
`;

function generate(item, document = new JSDOM(template).window.document, context = document.body, scope = {}) {
	scope[":current"] = item;
	scope[":document"] = document;
	scope[":element"] = context;
	if (typeof item == "string") {
		context.innerHTML += item;
	} else if (typeof item == "boolean") {
		throw new Error("Booleam literals are not implemented.");
	} else if (typeof item == "function") {
		const text = item.toString().split("=>")[0].trim();
		if (text.replace(/[^a-zA-Z0-9$_{}()]/g, "") != text) {
			throw new Error("Complex function literals are not implemented.");
		}
		if (text == "$") {
			const container = document.createElement("script");
			container.innerHTML = item.toString().split("=>").slice(1).join("=>").trim();
			context.appendChild(container);
		} else if (text.startsWith("$")) {
			const subtext = text.slice(1);
			scope[subtext] = item(scope[subtext]);
		} else if (text.startsWith("(") && text.endsWith(")")) {
			const subtext = text.slice(1, -1).trim();
			if (subtext == "$") {
				generate(evaluate("[" + fs.readFileSync(path.join(scope[":path"], item()), "utf-8") + "]", scope), document, context, scope);
			} else if (subtext.startsWith("$")) {
				const substr = subtext.slice(1);
				context.setAttribute(substr, item());
			} else if (subtext.startsWith("{") && subtext.endsWith("}")) {
				const subobj = subtext.slice(1, -1).trim();
				if (subobj == "$") {
					generate(evaluate("[" + fs.readFileSync(item(), "utf-8") + "]", scope), document, context, scope);
				} else if (subobj.startsWith("$")) {
					throw new Error("Parenthesis object dollar prefix names are not implemented.");
				} else if (subobj == "") {
					throw new Error("Parenthesis object empty names are not implemented.");
				} else {
					throw new Error("Parenthesis object names are not implemented.");
				}
			} else if (subtext == "") {
				generate(item(), document, context, scope);
			} else {
				context.style[subtext] = item();
			}
		} else {
			const container = document.createElement(text);
			generate(item(), document, container, scope);
			context.appendChild(container);
		}
	} else if (typeof item == "number") {
		throw new Error("Number literals are not implemented.");
	} else if (typeof item == "symbol") {
		throw new Error("Symbol literals are not implemented.");
	} else if (typeof item == "bigint") {
		throw new Error("BigInt literals are not implemented.");
	} else if (Array.isArray(item)) {
		item.forEach(entry => {
			generate(entry, document, context, scope);
		});
	} else if (typeof item == "object") {
		throw new Error("Object literals are not implemented.");
	}
	return document;
}

class RML {
	constructor(app) {
		this.app = app;
	}
	get(url, handler = () => {}) {
		this.app.get(url, handler);
	}
	post(url, handler = () => {}) {
		this.app.post(url, handler);
	}
	put(url, handler = () => {}) {
		this.app.put(url, handler);
	}
	patch(url, handler = () => {}) {
		this.app.patch(url, handler);
	}
	delete(url, handler = () => {}) {
		this.app.delete(url, handler);
	}
	page(url = "/", text, dir = ".") {
		this.app.get(url, (req, res) => {
			const scope = {};
			scope[":request"] = req;
			scope[":response"] = res;
			scope[":path"] = dir;
			res.send(generate(evaluate(`[${text}]`, scope), undefined, undefined, scope).documentElement.outerHTML);
		});
	}
	pageFile(url = "/", file = "index.js") {
		this.app.get(url, (req, res) => {
			const text = fs.readFileSync(file, "utf-8");
			const scope = {};
			scope[":request"] = req;
			scope[":response"] = res;
			scope[":path"] = path.dirname(file);
			res.send(generate(evaluate(`[${text}]`, scope), undefined, undefined, scope).documentElement.outerHTML);
		});
	}
	api(url, handler = () => {}) {
		this.app.post(url, (req, res) => {
			let sent = false;
			const cookies = {...req.cookies};
			handler({
				request: req, response: res,
				data: req.body, cookies,
				cookie: (key, vak, options) => {
					res.cookie(key, val, options);
				},
				error: message => {
					if (sent) return;
					res.status(400).send(new Error(message));
					sent = true;
				}
			});
			for (const [key, val] of Object.entries(cookies)) {
				if (req.cookies[key] === undefined || req.cookies[key] != cookies[key]) {
					res.cookie(key, val);
				}
			}
			if (!sent) {
				res.status(200).send("OK");
			}
		});
	}
	apiFile(url, file = "api.js") {
		this.api(url, $ => {
			evaluate(fs.readFileSync(file, "utf-8"), $);
		});
	}
	rateLimit(url = "/", amount = 4, seconds = 5, message = "You are being rate limited.") {
		this.app.use(url, ratelimit({
			max: amount, windowMs: 1000 * seconds, message
		}));
	}
	static(dir) {
		this.app.use(express.static(path.join(__dirname, dir)));
	}
}

function evaluate(text = "", scope = {}) {
	return function() {
		return eval(text);
	}.call(scope);
}

function listen(port) {
	const app = express();
	app.use(bodyparser.urlencoded({
		extended: false
	}));
	app.use(cookieparser());
	app.listen(port);
	const rml = new RML(app);
	return rml;
};

module.exports = {
	evaluate, listen,
	RML, generate,
	template
};