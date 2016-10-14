TP.Game = function(game) {};
TP.Game.prototype = {
    
    create: function() {
        
        // start arcade physics and set background colour
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.plugins.add(Phaser.Plugin.ArcadeSlopes);
        game.stage.backgroundColor = '#5D988D';
        
        // gravity
        game.physics.arcade.setBoundsToWorld();
        
        // by default, the game starts with the player moving right
        playerMoving = 'right';
        
        // needed for fps display
        game.time.advancedTiming = true;

        // initiate game parts
        this.initTilemap();
        this.initUI();
        this.initPlayer();
        
    },
    
    /****** TILEMAP ******/
    initTilemap: function() {
        
        // Set up the tilemap
        map = game.add.tilemap('tilemap');
        map.addTilesetImage('tiles', 'tiles');
        ground = map.createLayer('Tile Layer');
        ground.resizeWorld();
        
        // pass tilemap to arcade slopes plugin
        collisionMap = {
            2:  'FULL',
            4:  'HALF_BOTTOM_LEFT',
            5:  'HALF_BOTTOM'
        }

        game.slopes.convertTilemapLayer(ground, collisionMap);
        
        // exlude some tiles from collision
        collisionExcluded = [
            3, // grass blades
            7 // grass blades
        ];
        
        map.setCollisionByExclusion(collisionExcluded, true, 'Tile Layer');
        
        // stop sprites from sliding down slopes:
        // Prefer the minimum Y offset globally
        game.slopes.solvers.sat.options.preferY = true;
        
    },
    
        /****** UI ******/
    initUI: function() {
        
        /*** PLAYER ABILITY UI ***/
        game.playerUIGroup = this.add.group();
        game.playerAbilityGroup = this.add.group();
        
        game.playerAbilityIcons = this.add.group();
        game.playerAbilityText = this.add.group();
        
        var style = { font: "25px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        
        // W Ability icon and text
        player_W = game.add.sprite(game.camera.width*0.5, 650, 'player_icons');
        player_W.frame = 1;
        player_W.anchor.set(0.5,0.5);
        playerW_text = game.add.text(0,0, "W", style).alignTo(player_W, Phaser.BOTTOM_CENTER);
        
        
        // Q Ability icon and text
        player_Q = game.add.sprite(0,0, 'player_icons').alignTo(player_W, Phaser.LEFT_CENTER, 32);
        player_Q.frame = 0;
        playerQ_text = game.add.text(0,0, "Q", style).alignTo(player_Q, Phaser.BOTTOM_CENTER);
        
        // E Ability icon and text
        player_E = game.add.sprite(0,0, 'player_icons').alignTo(player_W, Phaser.RIGHT_CENTER, 32);
        player_E.frame = 2;
        playerE_text = game.add.text(0,0, "E", style).alignTo(player_E, Phaser.BOTTOM_CENTER);
        
        /** Section to add stuff to their respective Groups **/
        
        // add player ability Icons to a group
        game.playerAbilityIcons.add(player_W);
        game.playerAbilityIcons.add(player_Q);
        game.playerAbilityIcons.add(player_E);
        
        // add player ability Text to a group
        game.playerAbilityText.add(playerW_text);
        game.playerAbilityText.add(playerQ_text);
        game.playerAbilityText.add(playerE_text);
        
        // add player ability Text and Icons to a playerAbilityGroup
        game.playerAbilityGroup.add(game.playerAbilityIcons);
        game.playerAbilityGroup.add(game.playerAbilityText);      
        
        // ability displays are held in their entirety within playerUIGroup
        game.playerUIGroup.add(game.playerAbilityGroup);

        /** END **/
        
        // add a pause button 
        var pauseButton = this.add.button(1265, 80, 'button_pause', console.log('test'), this, 1, 0, 2);
		pauseButton.anchor.set(1);
        
        game.playerUIGroup.add(pauseButton);    
        
        /*** PAUSE UI ***/
        game.gamePausedGroup = this.add.group();
        
        pauseTitle = game.add.bitmapText(game.camera.width*0.5, 150, 'Upheaval', 'Pause Menu', 150);
        pauseTitle.anchor.set(0.5,0.5);
        
        game.gamePausedGroup.add(pauseTitle);
        
        
        
        /*** FUNCTIONS ***/
        
        // run a foreach that fixes ability text to the camera *and* applies a stroke effect
        game.playerAbilityText.forEach(strokeText, this, true);
        
        // run a foreach that fixes all UI elements to the camera
        game.playerUIGroup.forEach(fixToCamera, this, true);
        game.gamePausedGroup.forEach(fixToCamera, this, true);
        
        
        // function to apply settings to ability text
        function strokeText(textName){

            textName.stroke = '#000000';
            textName.strokeThickness = 4;
        };
        
        // you get fixed to the camera, and *you* get fixed to the camera, and y
        function fixToCamera(thingy){
            thingy.fixedToCamera = true;
        }    
        
        
        //game.playerUIGroup.visible = false;
        
        
    },
    
    /****** PLAYER ******/
    initPlayer: function() {
        
        /*** add player's sprite, physics, collision etc ***/
        player = game.add.sprite(10, 700, 'player');
        // add player pet (the hextech scout companion)
        player_pet = game.add.sprite(-80,700, 'player_pet');
        //player.addChild(player.player_pet);
        
        game.physics.enable(player, Phaser.Physics.ARCADE);
        game.physics.enable(player_pet, Phaser.Physics.ARCADE);
        
        player.body.bounce.y = 0.2;
		player.body.gravity.y = 2000;
        player.body.collideWorldBounds = true;

        game.slopes.enable(player);
        
        // the camera should follow the player & enable slopes collision
        game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
        
        // load controls
		jumpBtn = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        moveCursors = game.input.keyboard.createCursorKeys();
        
    },
    
    /****** UPDATE FUNCTION ******/
    update: function() {
        
       this.playerUpdate();
        
    },
    
    // show fps
    render: function() {
        game.debug.text(game.time.fps, 2, 14, "#00ff00");
        game.debug.spriteInfo(player, 32, 32);
        game.debug.spriteInfo(player_pet, 400, 32);
        game.debug.cameraInfo(game.camera, 32, 150);
    },
    
    playerUpdate: function() {
        
        // physics!!
        game.physics.arcade.collide(player, ground);
        
        /*** Movement ***/
        
        // by default the player is not moving
	    player.body.velocity.x = 0;
        
        if (moveCursors.left.isDown)
		{
			//  Move to the left
			player.body.velocity.x = -300;
            
            playerMoving = 'left';
            
			//player.animations.play('left');
		}
		else if (moveCursors.right.isDown )
		{
			//  Move to the right
			player.body.velocity.x = +300;
            
            playerMoving = 'right';

			//player.animations.play('right');
		}

		//  Allow the player to jump if they are touching the ground.
		if (jumpBtn.isDown && player.body.blocked.down)
		{
			player.body.velocity.y = -750;
		}
        
        // attach the pet to the player
        this.playerPetMove();

    },
    
    /****** Player_Pet attachment and movement ******/
    playerPetMove: function(){
        
        // we want the player_pet to go to a position just to the side of the player
        playerOrbitRight = {
            'type': 25,
            'x': (Phaser.Math.ceilTo(player.x, 1) - 60),
            'y': (Phaser.Math.ceilTo(player.y, 1) - 30),
        }
        // the position will change depending on which way the character is facing
        playerOrbitLeft = {
            'type': 25,
            'x': (Phaser.Math.ceilTo(player.x, 1) + 84),
            'y': (Phaser.Math.ceilTo(player.y, 1) - 30),
        }
        
        // round up player_pet position 
        playerPetX = (Phaser.Math.ceilTo(player_pet.x, 1));
        playerPetY = (Phaser.Math.ceilTo(player_pet.y, 1));
        
        
        // make sure the pet actually moves to the right position based on the direction the player is facing
        switch (playerMoving){
            case 'right':
                
                // check x       
                if (playerPetX == playerOrbitRight.x)
                {	
                    player_pet.body.velocity.x = 0; 
                    
                } else {
                    game.physics.arcade.moveToObject(player_pet, playerOrbitRight, 250, 400);
                }
                
                // check y
                if (playerPetY == playerOrbitRight.y) {
                    
                    player_pet.body.velocity.y = 0;
                    
                } else {
                    game.physics.arcade.moveToObject(player_pet, playerOrbitRight, 250, 400);
                }
                
            break;
                
            case 'left':
                
                // check x
                if (playerPetX == playerOrbitLeft.x)
                {	
                    player_pet.body.velocity.x = 0; 
                    
                } else {
                    game.physics.arcade.moveToObject(player_pet, playerOrbitLeft, 250, 400);
                }
                
                // check y
                if (playerPetY == playerOrbitLeft.y) {
                    
                    player_pet.body.velocity.y = 0;
                    
                } else {
                    game.physics.arcade.moveToObject(player_pet, playerOrbitLeft, 250, 400);
                }
                
            break;
        }
        
    }
    
}