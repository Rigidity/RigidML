($) => 'templates/components/elements.js',
() => [
	this.formField("Username", "input"),
	this.line,
	this.formField("Password", "password"),
	this.line,
	this.formButton("Submit"),
]