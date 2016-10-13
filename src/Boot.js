// Teemo Platformer = TP
var TP = {};

TP.Boot = function(game){};
TP.Boot.prototype = {
	preload: function(){
		this.stage.backgroundColor = '#DECCCC';
		this.load.image('loading-background', 'img/loading-background.png');
		this.load.image('loading-progress', 'img/loading-progress.png');
	},
	create: function(){
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        this.scale.setMinMax(640,360,1280,720);
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.state.start('Preloader');
	}
};