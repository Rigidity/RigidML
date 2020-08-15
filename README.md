# RigidML v1.0.0

## Example (index.js)

```js
const {listen} = require("rigidml");

const app = listen(80);
app.pageFile("/", "home.js");
```

## Example (home.js)

```js
h1 => [
	($id) => 'dissapearing',
	(color) => 'red',
	(font) => '26px Sans-Serif',
	"Hello, ", [
		(color) => 'blue',
		"world"
	], "!"
],
$ => setTimeout(() => $("#dissapearing").hide(), 5000)
```

## Literals
`array` Each item in the list is executed individually.  
`string` Treated as plain HTML and is appended to the target element.  
`function` Many things can be done with arrow functions, shown below.  
`undefined` Nothing is applied or done with an undefined value.

## Functions
`key => val` The simplest type of function. Makes an HTML element.
`(key) => val` Defines a CSS property on the active element.  
`($key) => val` Assigns an HTML property to the active element.  
`($) => val` Includes a file relative to the current file.  
`$key => val` Assigns a property to the current context obect.  
`$ => val` Inserts a script tag with the function as its content.  
`() => val` Gets executed once the element is reached.  
`({$}) => val` Includes a file based on the directory the app was called from.  