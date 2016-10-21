var game = new Phaser.Game(1280, 720, Phaser.CANVAS);


	var states = {
		'Boot': TP.Boot,
		'Preloader': TP.Preloader,
		'MainMenu': TP.MainMenu,
		'Game': TP.Game
	};
	

    for(var state in states)
		game.state.add(state, states[state]);
	game.state.start('Boot');