($) => '../components/forms.js',
$ => registerForm =>
	$formStyle => [
		'myform', {
			content: [
				h1 => [
					'Register',
					(color) => 'white',
					(fontFamily) => 'Sans-Serif',
					(fontSize) => '24px',
					(marginBottom) => '20px'
				],
				$formField => ['Email', {type: 'email'}], '<br>',
				$formField => ['Username'], '<br>',
				$formField => ['Password', {type: 'password'}], '<br>',
				$formButton => ['Register', {
					content: $formAPI => [
						'/api/test', {
							email: 'email',
							username: 'username',
							password: 'password'
						}
					]
				}],
				(backgroundColor) => '#444444',
				(display) => 'inline-block',
				(padding) => '24px',
				(borderRadius) => '8px',
				(textAlign) => 'center'
			]
		}
	]