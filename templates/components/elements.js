$formInput => content =>
	input => [
		(outline) => 'none',
		(margin) => '2px',
		(padding) => '6px',
		(fontFamily) => 'Sans-Serif',
		(fontSize) => '16px',
		(borderWidth) => '0px',
		(borderRadius) => '6px',
		(width) => '160px',
		(height) => '30px',
		(backgroundColor) => 'rgb(220, 220, 220)',
		content
	],
$formField => (placeholder, type = 'text', id = placeholder.toLowerCase(), name = id) => [
	this.formInput([
		($type) => type,
		($placeholder) => placeholder,
		($name) => name,
		($id) => id
	])
],
$formButton => (value) => [
	this.formInput([
		($type) => 'button',
		($value) => value
	]),
],
$line => br => [],
$lines => amount => Array(amount).fill(br => [])