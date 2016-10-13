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
        
        /*** add player's sprite, physics, collision etc ***/
        //game.gamePausedGroup = this.add.group();
        game.playerUIGroup = this.add.group();
        
        var style = { font: "bold 42px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        /*  The Text is positioned at 0, 100
        text = game.add.text(game.camera.width*0.5, 650, "test text", style);
        text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        text.anchor.set(0.5,0.5);
        text.fixedToCamera = true;*/
        
        player_W = game.add.sprite(game.camera.width*0.5, 650, 'player');
        player_W.anchor.set(0.5,0.5);
        player_W.fixedToCamera = true;
        
        player_Q = game.add.sprite(0,0, 'player').alignTo(player_W, Phaser.LEFT_CENTER, 32);
        player_Q.fixedToCamera = true;
        
        player_E = game.add.sprite(0,0, 'player').alignTo(player_W, Phaser.RIGHT_CENTER, 32);
        player_E.fixedToCamera = true;
        
        
        game.playerUIGroup.add(player_W);
        game.playerUIGroup.add(player_Q);
        game.playerUIGroup.add(player_E);

        //game.camera.width*0.5, 650
        
        
    },
    
    /****** PLAYER ******/
    initPlayer: function() {
        
        /*** add player's sprite, physics, collision etc ***/
        player = game.add.sprite(10, 700, 'player');
        // add player pet (the hextech scout companion)
        player_pet = game.add.sprite(-50, 600, 'player_pet');
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
        game.debug.cameraInfo(game.camera, 32, 300);
    },
    
    playerUpdate: function() {
        
        // physics!!
        game.physics.arcade.collide(player, ground);
        game.physics.arcade.overlap(player, player_pet);
        
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