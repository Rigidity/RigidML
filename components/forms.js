$ => formStyle => div => [
	($id) => formStyle[0],
	this.on(this.document.body, style => `
		#${formStyle[0]} input {
			appearance: none;
			-webkit-appearance: none;
			-moz-appearance: none;
			background-color: ${formStyle[1]?.field || '#EEEEEE'};
			font: ${formStyle[1]?.font || '16px Sans-Serif'};
		}
		#${formStyle[0]} input:-webkit-autofill::first-line {
			font: ${formStyle[1]?.font || '16px Sans-Serif'};
		}
		#${formStyle[0]} input[type='button'] {
			background-color: ${formStyle[1]?.button || '#DDDDDD'};
		}
		#${formStyle[0]} input[type='button']:hover {
			background-color: ${formStyle[1]?.hover || '#CCCCCC'};
		}
		#${formStyle[0]} input[type='button']:active {
			background-color: ${formStyle[1]?.active || '#BBBBBB'};
		}
	`),
	formStyle[1]?.content
],
$ => formInput => input => [
	(fontSize) => '16px',
	(width) => '200px',
	(height) => '28px',
	(margin) => '2px',
	(outline) => 'none',
	(borderRadius) => '6px',
	(borderWidth) => '0px',
	(paddingLeft) => '8px',
	(paddingRight) => '8px',
	formInput
],
$ => formField => $formInput => [
	($placeholder) => formField[0],
	($type) => formField[1]?.type || 'text',
	($id) => formField[1]?.id || formField[0].toLowerCase(),
	($name) => formField[1]?.name || formField[0].toLowerCase(),
	formField[1]?.content
],
$ => formButton => $formInput => [
	($type) => 'button',
	($value) => formButton[0],
	($id) => formButton[1]?.id || formButton[0].toLowerCase(),
	formButton[1]?.content
],
$ => formAPI => [
	($onClick) => (formAPI[2]?.name || 'formAPIHandler') + "()",
	this.on(this.document.body, script => `
		function ${formAPI[2]?.name || 'formAPIHandler'}() {
			$.ajax({
				method: "POST",
				url: decodeURIComponent("${encodeURIComponent(formAPI[0])}"),
				data: {${Object.keys(formAPI[1]).map(name => `${name}: document.getElementById(decodeURIComponent("${encodeURIComponent(formAPI[1][name])}")).value`)}},
				success: function(result) {
					${formAPI[2]?.res || `window.location = ""`};
				},
				error: function(error) {
					${formAPI[2]?.err || `console.log(error.responseText)`}
				}
			});
		}
	`)
]