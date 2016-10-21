TP.MainMenu = function(game) {};
TP.MainMenu.prototype = {
	create: function() {
        
        this.add.sprite(0, 0, 'background');

		var fontHighscore = { font: "32px Arial", fill: "#000" };
		var textHighscore = this.add.text(this.world.width*0.5, this.world.height-50, 'Highscore:', fontHighscore);
		textHighscore.anchor.set(0.5,1);
        
        // play
        var buttonStart = this.add.button(this.world.width-20, this.world.height-20, 'button_start', this.clickStart, this, 1, 0, 2);
		buttonStart.anchor.set(1);
	},
    
    clickStart: function() {
		this.time.events.add(200, function() {
			this.game.state.start('Game');
		}, this);
	}
};