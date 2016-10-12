TP.Preloader = function(game) {};
TP.Preloader.prototype = {
	preload: function() {
		var preloadBG = this.add.sprite((this.world.width-580)*0.5, (this.world.height+150)*0.5, 'loading-background');
		var preloadProgress = this.add.sprite((this.world.width-540)*0.5, (this.world.height+170)*0.5, 'loading-progress');
		this.load.setPreloadSprite(preloadProgress);
		
		this._preloadResources();
        
        // tilemap load
        game.load.tilemap('tilemap', 'src/tilemaps/tilemap_main.json', null, Phaser.Tilemap.TILED_JSON);
	},
	_preloadResources() {
		var pack = TP.Preloader.resources;
		for(var method in pack) {
			pack[method].forEach(function(args) {
				var loader = this.load[method];
				loader && loader.apply(this.load, args);
			}, this);
		}
	},
	create: function() {
		this.state.start('Game');
	}
};
TP.Preloader.resources = {
	'image': [
		['background', 'img/background.png'],
        ['tiles', 'src/tilemaps/tiles.png', 64, 64]
	],
	'spritesheet': [
        ['button_start', 'img/button_start.png', 180, 180],
        ['player', 'img/spritesheets/player.png', 64, 64],
        ['player_pet', 'img/spritesheets/player_pet.png', 32, 32]
	]
	//'audio': [
	//	['audio-click', ['sfx/audio-button.m4a','sfx/audio-button.mp3','sfx/audio-button.ogg']]
	//]
};