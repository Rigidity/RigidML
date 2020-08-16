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