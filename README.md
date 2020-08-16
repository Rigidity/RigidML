# RigidML v2.0.0

## Example (index.js)

```js
const {listen} = require("rigidml");

const port = +(process.argv[2] || "8080");
const app = listen(port);
app.pageFile("/", "home.js");
console.log(`The example page is now listening on port ${port}.`);
```

## Example (home.js)

```js
h1 => [
	($id) => 'dissapearing',
	(color) => 'red',
	(fontFamily) => 'Sans-Serif',
	(fontSize) => '64px',
	"Hello, ", p => [
		(color) => 'blue',
		(display) => 'inline-block',
		"world"
	], "!"
],
script => `setTimeout(() => $("#dissapearing").hide(), 5000)`
```

## Scope Object
`this.components` The object that contains all of the components.  
`this.request` The HTTP request object passed from express.  
`this.response` The HTTP response object passed from express.  
`this.path` The directory from which this RML script was called from.  
`this.document` The NodeJS document object which contains the DOM.  
`this.on` Helper that executes an item on a specific element.  

## Application
`app.page(url, text, dir)` Handles get requests with RigidML source text.  
`app.pageFile(url, file)` Handles get requests with a RigidML file.  
`app.api(url, handler)` Handles post requests with an API utility object.  
`app.apiFile(url, file)` Handles post requests in a file in a bound utility object.  
`app.static(path)` Includes a static folder on the application.  
`app.rateLimit(url, amount, seconds, message)` Applies a rate limit to a url.  
`app.get(url, handler)` Handles raw get requests.  
`app.post(url, handler)` Handles raw post requests.  
`app.put(url, handler)` Handles raw put requests.  
`app.patch(url, handler)` Handles raw patch requests.  
`app.delete(url, handler)` Handles raw delete requests.  

## API Utility
`util.request` The raw request object.  
`util.response` The raw response object.  
`util.data` The JSON data parsed from the body.  
`util.cookies` An assignable object of the browser's cookies.  
`util.cookie(key, val, options)` Assigns a cookie to the response.  
`util.error(message)` Sends a 400 status code and an error response.  

## Literals
`array` Each item in the list is executed individually.  
`function` Many things can be done with arrow functions, shown below.  
`string` Treated as plain HTML and is appended to the target element.  
`number` Treated as plain HTML and is appended to the target element.  
`boolean` Treated as plain HTML and is appended to the target element.  
`bigint` Treated as plain HTML and is appended to the target element.  
`symbol` Description treated as plain HTML and is appended to the target element.  
`undefined` Nothing is applied or done with an undefined value.

## Functions
`key => val` The simplest type of function. Makes an HTML element.  
`(key) => val` Defines a CSS property on the active element.  
`($key) => val` Assigns an HTML property to the active element.  
`($) => val` Includes a file relative to the current file.  
`$key => val` Instantiates an existing component.  
`$ => key => val` Defines a component that can be reused.  
`() => val` Gets executed once the element is reached.  