TP.Preloader = function(game) {};
TP.Preloader.prototype = {
	preload: function() {
		var preloadBG = this.add.sprite((this.world.width-580)*0.5, (this.world.height+150)*0.5, 'loading-background');
		var preloadProgress = this.add.sprite((this.world.width-540)*0.5, (this.world.height+170)*0.5, 'loading-progress');
		this.load.setPreloadSprite(preloadProgress);
		
		this._preloadResources();
        
        // tilemap load
        game.load.tilemap('tilemap', 'src/tilemaps/tilemap_main.json', null, Phaser.Tilemap.TILED_JSON);
        // bitmap font load
        game.load.bitmapFont('Upheaval', 'src/fonts/upheaval.png', 'src/fonts/upheaval.fnt');
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
        ['tiles', 'src/tilemaps/tiles.png', 64, 64],
        ['player_healthBar', 'img/player_healthBar.png', 101, 29],
        ['player_healthEmpty', 'img/player_healthEmpty.png', 101, 29],
        ['testBullet', 'img/bulletTest2.png']
	],
	'spritesheet': [
        ['player', 'img/spritesheets/player.png', 58, 77, 4],
        ['player_pet', 'img/spritesheets/player_pet_2.png', 32, 34],
        ['player_pet_hover', 'img/spritesheets/player_pet_hover.png', 32, 33],
        ['player_icons', 'img/spritesheets/player_icons.png', 64, 64],
        ['healthPack', 'img/spritesheets/healthPack.png'],
        // enemies
        ['enemy_test', 'img/spritesheets/enemyTest.png', 64, 64],
        ['enemy_bloblet', 'img/spritesheets/enemyBloblet.png', 33, 32],
        // pause menu
        ['button_pause', 'img/spritesheets/button_pause.png', 64, 64],
        ['button_resume', 'img/spritesheets/button_resume.png', 520, 40],
        ['button_sfx', 'img/spritesheets/button_sfx.png', 452, 40],
        ['button_restart', 'img/spritesheets/button_restart.png', 760, 40],
        ['button_exit', 'img/spritesheets/button_exit.png', 408, 40]
	]
	//'audio': [
	//	['audio-click', ['sfx/audio-button.m4a','sfx/audio-button.mp3','sfx/audio-button.ogg']]
	//]
};