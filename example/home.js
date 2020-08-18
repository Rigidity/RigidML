($) => '../components/grid.js',
($) => 'registerform.js',
($) => 'navlink.js',
(textAlign) => 'center',
(color) => 'white',
		(backgroundColor) => '#444444',
		div => [
			(backgroundColor) => '#111111',
			h1 => [
				(color) => '#EEEEEE',
				(fontFamily) => 'Arial Rounded MT Bold, Sans-Serif',
				(fontSize) => '32px',
				(paddingTop) => '16px',
				(paddingBottom) => '16px',
				"RigidNetwork"
			],
			div => [
				(backgroundColor) => '#666666',
				(padding) => '4px',
				(height) => '24px',
				$navlink => ['Home', '/'],
				$navlink => ['Discord', 'https://discord.gg/MbX6VMA'],
				$navlink => ['Login', "login"],
				$navlink => ['Register', "register"]
			]
		],
		div => [
			$columns => [
				$1 => (backgroundColor) => '#222222',
				$2 => $registerForm => '',
				$1 => (backgroundColor) => '#222222'
			]
		]
