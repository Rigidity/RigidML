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

async function generate(data) {
	const {item, document, context, scope, dir} = data;
	if (typeof item == "string") {
		context.innerHTML += item;
	} else if (typeof item == "boolean") {
		await generate({...data, item: "" + item});
	} else if (typeof item == "function") {
		const text = item.toString().split("=>")[0].trim();
		if (text.replace(/[^a-zA-Z0-9$_()]/g, "") != text) {
			throw new Error("Complex function literals are not supported.");
		}
		if (text == "$") {
			const content = await item();
			if (typeof content != "function") {
				throw new Error("Component definitions must be arrow functions.");
			}
			const name = content.toString().split("=>")[0].trim();
			if (name.replace(/[^a-zA-Z0-9_$]/g, "") != name) {
				throw new Error("Complex component definitions are not supported.");
			}
			scope['$' + name] = content;
		} else if (text.startsWith("$")) {
			const subtext = text.slice(1);
			if (scope['$' + subtext] === undefined) {
				throw new Error(`The component ${subtext} is not defined.`);
			}
			await generate({...data, item: scope['$' + subtext](await item())});
		} else if (text.startsWith("(") && text.endsWith(")")) {
			const subtext = text.slice(1, -1).trim();
			if (subtext == "$") {
				const newfile = path.join(scope.path, await item());
				const newpath = path.dirname(newfile);
				await generate({...data, item: evaluate("[" + fs.readFileSync(newfile, "utf-8") + "]", scope), dir: newpath});
			} else if (subtext.startsWith("$")) {
				const substr = subtext.slice(1);
				context.setAttribute(substr, await item());
			} else if (subtext == "") {
				await generate({...data, item: await item()});
			} else {
				context.style[subtext] = await item();
			}
		} else {
			const container = document.createElement(text);
			await generate({...data, item: await item(), context: container});
			context.appendChild(container);
		}
	} else if (typeof item == "number") {
		await generate({...data, item: "" + item});
	} else if (typeof item == "symbol") {
		await generate({...data, item: item.toString().slice(7, -1)});
	} else if (typeof item == "bigint") {
		await generate({...data, item: "" + item});
	} else if (Array.isArray(item)) {
		for (var i = 0; i < item.length; i++) {
			await generate({...data, item: item[i]});
		}
	} else if (item instanceof Promise) {
		await generate({...data, item: await item});
	} else if (typeof item == "object") {
		await generate({...data, item: JSON.stringify(item)});
	}
	return document;
}

function scopify(request, response, path, callback) {
	const scope = {};
	scope.request = request;
	scope.response = response;
	scope.path = path;
	scope.data = {};
	callback(scope.data);
	scope.document = new JSDOM(template).window.document;
	scope.on = async (element, item) => {
		await generate({item, document: scope.document, context: element, scope});
	};
	return scope;
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
	page(url = "/", text = "", dir = ".", handler = () => {}) {
		this.app.get(url, async (req, res) => {
			const scope = scopify(req, res, dir, data => {
				handler(data, req, res);
			});
			await scope.on(scope.document.body, evaluate(`[${text}]`, scope));
			res.send(scope.document.documentElement.outerHTML);
		});
	}
	pageFile(url = "/", file = "index.js", handler = () => {}) {
		this.app.get(url, async (req, res) => {
			const text = fs.readFileSync(file, "utf-8");
			const scope = scopify(req, res, path.dirname(file), data => {
				handler(data, req, res);
			});
			await scope.on(scope.document.body, evaluate(`[${text}]`, scope));
			res.send(scope.document.documentElement.outerHTML);
		});
	}
	api(url, handler = () => {}) {
		this.app.post(url, (req, res) => {
			const cookies = {...req.cookies};
			handler({
				request: req, response: res,
				data: req.body, cookies,
				cookie: (key, val, options) => {
					res.cookie(key, val, options);
				},
				result: (message = "OK") => res.status(200).send(message),
				error: (message = "ERR") => res.status(400).end(message),
				updateCookies: () => {
					for (const [key, val] of Object.entries(cookies)) {
						if (req.cookies[key] === undefined || req.cookies[key] != cookies[key]) {
							res.cookie(key, val);
						}
					}
				}
			});
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