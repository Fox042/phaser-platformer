TP.Game = function(game) {};
TP.Game.prototype = {
    
    create: function() {
        /** global variables **/
        this.pauseState = false;
        // abilities
        this.Q_Unlocked = false;
        this.Q_Enabled = false;
        // player
        this.healthDropChance = 1;
        
        /** constants **/
        STANDARD_GRAVITY = 2000;
        HEALTH_DROP_MODIFIER = 10;
        
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
        this.initEnemies();
        
    },
    
    /****** TILEMAP ******/
    initTilemap: function() {
        
        // Set up the tilemap
        map = game.add.tilemap('tilemap');
        map.addTilesetImage('tiles', 'tiles');
        ground = map.createLayer('Tile Layer');
        ground.resizeWorld();
        //ground.debug = true;  
        
        // pass tilemap to arcade slopes plugin        
        
        collisionMap = {
            2: 'FULL',
            3: 'FULL',
            4: 'HALF_BOTTOM_LEFT',
            5: 'HALF_BOTTOM_RIGHT',
            6: 'HALF_TOP_RIGHT',
            7: 'HALF_TOP_LEFT',
            8: 'QUARTER_BOTTOM_LEFT_LOW',
            9: 'QUARTER_BOTTOM_RIGHT_LOW',
            10: 'QUARTER_TOP_RIGHT_LOW',
            11: 'QUARTER_TOP_LEFT_LOW',
            12: 'QUARTER_BOTTOM_LEFT_HIGH',
            13: 'QUARTER_BOTTOM_RIGHT_HIGH',
            14: 'QUARTER_TOP_RIGHT_HIGH',
            15: 'QUARTER_TOP_LEFT_HIGH',
            16: 'QUARTER_LEFT_BOTTOM_HIGH',
            17: 'QUARTER_RIGHT_BOTTOM_HIGH',
            18: 'QUARTER_RIGHT_TOP_LOW',
            19: 'QUARTER_LEFT_TOP_LOW',
            20: 'QUARTER_LEFT_BOTTOM_LOW',
            21: 'QUARTER_RIGHT_BOTTOM_LOW',
            22: 'HALF_BOTTOM',
            23: 'HALF_LEFT',
            24: 'HALF_RIGHT',
            25: 'HALF_TOP'
        }

        game.slopes.convertTilemapLayer(ground, collisionMap);
        
        // exlude some tiles from collision
        collisionExcluded = [
            26, // grass blades
            27  // grass blades
        ];
        
        map.setCollisionByExclusion(collisionExcluded, true, 'Tile Layer');
        
        // stop sprites from sliding down slopes:
        // Prefer the minimum Y offset globally
        game.slopes.solvers.sat.options.preferY = true;
        
    },
    
        /****** UI ******/
    initUI: function() {
        
        /*** PLAYER ABILITY UI ***/
        
        // add groups
        game.playerUIGroup = this.add.group();
        game.playerAbilityGroup = this.add.group();
        game.playerLivesGroup = this.add.group();
        
        // add groups within groups
        game.playerAbilityIcons = this.add.group();
        game.playerAbilityText = this.add.group();
        
        // player lives section
        player_healthBar = game.add.sprite(10,10, 'player_healthBar');
        player_healthEmpty = game.add.sprite(10,10, 'player_healthEmpty');
        
        player_healthBar.cropEnabled;
        
        game.playerLivesGroup.add(player_healthBar);
        game.playerLivesGroup.add(player_healthEmpty);
        
        // ability icons section
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
        
        // ability displays are held in their entirety within playerUIGroup (as are player lives)
        game.playerUIGroup.add(game.playerAbilityGroup);
        game.playerUIGroup.add(game.playerLivesGroup);

        /** END **/
        
        // add a pause button 
        pauseButton = game.add.button(1265, 80, 'button_pause', this.togglePause, this, 1, 0, 2);
		pauseButton.anchor.set(1);
        
        game.playerUIGroup.add(pauseButton);    
        
        /*** PAUSE UI ***/
        game.gamePausedGroup = this.add.group();
        
        // add pause resume option. the rest of the pause menu is aligned around this
        // order: title, SFX, resume, restart, exit
        // button (over, out, down, up)
        pauseResumeBtn = game.add.button(game.camera.width*0.5, game.camera.height*0.5, 'button_resume', this.togglePause, this, 0, 1, 2, 1);
        pauseResumeBtn.anchor.set(0.5);
        
        pauseSFXBtn = game.add.button(0,0, 'button_sfx', this.togglePause, this, 0, 1, 2, 1).alignTo(pauseResumeBtn, Phaser.TOP_CENTER, 0, 80);
        
        pauseTitleBtn = game.add.bitmapText(0,0, 'Upheaval', 'Pause Menu', 150).alignTo(pauseSFXBtn, Phaser.TOP_CENTER, 0, 80);
                
        pauseRestartBtn = game.add.button(0,0, 'button_restart', this.togglePause, this, 0, 1, 2, 1).alignTo(pauseResumeBtn, Phaser.BOTTOM_CENTER, 0, 80);
        
        pauseExitBtn = game.add.button(0,0, 'button_exit', this.togglePause, this, 0, 1, 2, 1).alignTo(pauseRestartBtn, Phaser.BOTTOM_CENTER, 0, 80);
        
        /** pause menu functions **/
        
        function pauseSFX(){
          console.log('SFX toggle');  
        };
        
        function pauseRestart(){
          console.log('Restart Level');  
        };
        
        function pauseExit(){
          console.log('Return to menu');
        };
        
        // add everything to the pausedGroup
        game.gamePausedGroup.add(pauseTitleBtn);
        game.gamePausedGroup.add(pauseSFXBtn);
        game.gamePausedGroup.add(pauseResumeBtn);
        game.gamePausedGroup.add(pauseRestartBtn);
        game.gamePausedGroup.add(pauseExitBtn);
        
        game.gamePausedGroup.visible = false;
        //game.playerUIGroup.visible = false;
        
        /*** GENERAL UI FUNCTIONS ***/
        
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
        
    },
    
    /****** PLAYER ******/
    initPlayer: function() {
        
        /*** PLAYER AND PLAYER_PET ***/
        
        // add player
        player = game.add.sprite(10, 704, 'player');
        // add player animations
        player.animations.add('idle', [0, 1, 2, 3], 6, true);

        // add player pet (the hextech scout companion)
        player_pet = game.add.sprite(-80,704, 'player_pet');
        player_pet.smoothed = false;
        player_pet.anchor.set(0.5,0.5);
        
        // player_pet animations
        player_pet.animations.add('glow', [0, 1, 2, 3, 4], 6, true);
        
        player_pet_hover = game.make.sprite(-16, 18, 'player_pet_hover');
        player_pet_hover.animations.add('loop', [0, 1, 2, 3], 10, true);
        
        player_pet.addChild(player_pet_hover);
        
        game.physics.enable(player, Phaser.Physics.ARCADE);
        game.physics.enable(player_pet, Phaser.Physics.ARCADE);
        
        player.body.bounce.y = 0.2;
		player.body.gravity.y = STANDARD_GRAVITY;
        player.body.collideWorldBounds = true;
        // by default the player is not invincible
        player.invincible = false;

        game.slopes.enable(player);
        
        // the camera should follow the player & enable slopes collision
        game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
        
        // implement health
        player.maxHealth = 100;
        player.health = 50;
        
        // INITIALISE WEAPONS SYSTEM (but really) 
        
        // add the bullets, that will be killed once they exceed a certain distance
        player_weapon = game.add.weapon(10, 'testBullet');
        player_weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
        player_weapon.bulletKillDistance = 450;

        //  The speed at which the bullets are fired
        player_weapon.bulletSpeed = 800;
        player_weapon.fireRate = 100;
        
        // bullets are fired from the player_pet
        player_weapon.trackSprite(player_pet);
        
        // INITIALISE HEALTH PACKS
        
        game.healthPacksGroup = this.add.group();
        
        healthPacks = function (game, x, y) {

            Phaser.Sprite.call(this, game, x, y, "healthPack");

            game.physics.enable(this, Phaser.Physics.ARCADE);
            game.slopes.enable(this);
            this.enableBody = true;
            this.body.gravity.y = 400;
            this.body.bounce.y = 0.2;
            this.body.collideWorldBounds = true;
            this.anchor.set(0.5,0.5);
            
            // add to the health pack group
            game.healthPacksGroup.add(this); 

        };

        healthPacks.prototype = Object.create(Phaser.Sprite.prototype);
        healthPacks.prototype.constructor = healthPacks;        

        
        // load controls
		jumpBtn = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        moveCursors = game.input.keyboard.createCursorKeys();
        pauseBtn = game.input.keyboard.addKey(Phaser.Keyboard.P);
        keyQ = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
        keyE = game.input.keyboard.addKey(Phaser.Keyboard.E);
        
    },
    
    initEnemies: function(){
        
        // enemy group
        game.enemyGroup = this.add.group();

        // create the test enemy object    
        enemy_Bloblet = function (game, x, y) {

            Phaser.Sprite.call(this, game, x, y, "enemy_bloblet");

            game.physics.enable(this, Phaser.Physics.ARCADE);
            game.slopes.enable(this);
            this.enableBody = true;
            this.body.gravity.y = STANDARD_GRAVITY;
            this.body.bounce.x = 0.2;
            this.body.collideWorldBounds = true;
            
            // adjust the collision box so the monster is resting on the ground
            this.body.setSize(33, 31, 0 , -8);
            
            // idle monster
            this.animations.add('idle', [0, 1, 2, 3, 4], 6, true);
            
            // health
            this.maxHealth = 10;
            this.health = 10;
            
            // add to the enemy group
            game.enemyGroup.add(this);
            

        };

        enemy_Bloblet.prototype = Object.create(Phaser.Sprite.prototype);
        enemy_Bloblet.prototype.constructor = enemy_Bloblet;

        // create the actual enemies and add them to the enemy group
        enemy_test = new enemy_Bloblet(game, 260, 724);
        enemy_test2 = new enemy_Bloblet(game, 660, 724);
        
    },
    
    /****** UPDATE FUNCTION ******/
    update: function() {    
        
        // update player and enemy
        this.playerUpdate();
        this.enemyUpdate();
        
        // this signal will pause the game if the user presses 'P'
        pauseBtn.onDown.add(this.togglePause, this);
        
        // this signal will cause the player's pet to fire a projectile at the nearest enemy
        keyQ.onDown.add(this.playerAbilities, this, 0, "Q");
        
        // this signal will cause the player's pet to deploy hextech rope
        keyW.onDown.add(this.playerAbilities, this, 0, "W");
        
        // this signal will cause the player's pet to toss a shroom
        keyE.onDown.add(this.playerAbilities, this, 0, "E");
        
    },
    
    // show fps
    render: function() {
        game.debug.text(game.time.fps, 1240, 700, "#00ff00");
        game.debug.spriteInfo(player, 400, 32);
        game.debug.spriteInfo(player_pet, 32, 32);
        //game.debug.cameraInfo(game.camera, 32, 150);
    },
    // pause menu function
    togglePause: function(){

        // toggle physics and UIs
        game.physics.arcade.isPaused = !game.physics.arcade.isPaused;
        game.playerUIGroup.visible = !game.playerUIGroup.visible;
        game.gamePausedGroup.visible = !game.gamePausedGroup.visible;
        
        // also disable movement input
        this.pauseState = !this.pauseState;
        // & pause animations
        player.animations.paused = !player.animations.paused;
        player_pet.animations.paused = !player_pet.animations.paused;
        player_pet_hover.animations.paused = !player_pet_hover.animations.paused;
        
        game.enemyGroup.callAll('animations.paused', 'animations', 'true');
        
        // and make sure the pause menu UI is in front of everything else
        game.world.bringToTop(game.gamePausedGroup);
    },
    /****** PLAYER *******/
    playerUpdate: function() {
        
        // physics!!
        game.physics.arcade.collide(player, ground);
        game.physics.arcade.collide(game.healthPacksGroup, ground);
        game.physics.arcade.overlap(game.healthPacksGroup, player, this.healPlayer);
        
        /*** Movement ***/
        
        // by default the player is idle
	    player.body.velocity.x = 0;
        player.animations.play('idle');
        
        // if the game isn't paused, allow the player to move
        if (this.pauseState == false){
            if (moveCursors.left.isDown)
            {
                //  Move to the left
                player.body.velocity.x = -300;

                playerMoving = 'left';

                player.frame = 0;
            }
            else if (moveCursors.right.isDown )
            {
                //  Move to the right
                player.body.velocity.x = 300;

                playerMoving = 'right';

                player.frame = 0;
            }

            //  Allow the player to jump if they are touching the ground.
            if (jumpBtn.isDown && player.body.touching.down)
            {
                player.body.velocity.y = -750;
                player.frame = 0;
            }
        }
        
        // attach the pet to the player
        this.playerPetMove();

    },
    
    /****** Player_Pet attachment and movement ******/
    playerPetMove: function(){
        
        // player pet glow
        player_pet.animations.play('glow');
        player_pet_hover.animations.play('loop');
        
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
                // if it reached the right position, it can stop moving
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
        
    },
    
    /****** PLAYER ABILITIES SECTION ******/
    playerAbilities: function(){
        
        // run the ability function according to the key pressed
        var abilityUsed = arguments[1];
        
        switch (abilityUsed) {
            
            case "Q":
                fireQ();
            break;
                
            case "W":
                fireW();
            break;
                
            case "E":
                fireE();
        }
        
        // fire Q
        function fireQ(){
            if (game.Q_Enabled == true){
                player_weapon.fireAtSprite(closestEnemy);
            }
            
        }
        
        // fire W
        function fireW(){
            console.log('w function');
            console.log(player_weapon);
        }
        
        // fire E
        function fireE(){
            console.log('e function');
        }
        
        
    },
    
    /****** ENEMY SECTION ******/
    enemyUpdate: function(){
        
        // idle animations
        game.enemyGroup.callAll('animations.play', 'animations', 'idle');
        
        // physics!!
        if (this.pauseState == false){
            game.physics.arcade.collide(game.enemyGroup, ground);
            game.physics.arcade.overlap(game.enemyGroup, player, this.damagePlayer);
            game.physics.arcade.overlap(player_weapon.bullets, game.enemyGroup, this.damageEnemy, null, this);
        };
        
        // check if there are any enemies alive
        if (game.enemyGroup.countLiving()  > 0){
            
            // Q is only able to be used when there is an enemy close enough
            // Q will always target the closest enemy
            
            closestEnemy = game.enemyGroup.getClosestTo(player);

            distanceToEnemy = game.physics.arcade.distanceBetween(player, closestEnemy);

            checkQ();

            // check whether the player is able to use their Q or not
            function checkQ(){

                // if they are close enough, the player can fire Q
                if (distanceToEnemy <= 400) {

                    game.Q_Enabled = true;

                } else {

                    game.Q_Enabled = false;
                }
            }
            
        } else {
            game.Q_Enabled = false;
            // if there are still bullets in flight when all enemies are dead... kill them
            player_weapon.killAll();
        };
                
    },
    // if a player gets damaged, take away a life. if they're too hurt... game over!
    damagePlayer: function(player, enemy){
        
        // if the player's health is within certain parameters
        if ((player.health > 10 && player.health <= 100) && player.invincible == false) {

            // apply the damage according to the enemy
            switch (enemy.key) {
                case "enemy_bloblet":
                    player.damage(10);
                    toggleInvincible();
                    knockBack();
                    game.time.events.add(2000, toggleInvincible, this);
                    break;

                default:
                    player.damage(0);
                    break;
            };

            // crop the health bar 
            cropRect = new Phaser.Rectangle(0, 0, ((player.health / player.maxHealth) * 100), 29);
            player_healthBar.crop(cropRect, false);
        
        };
        
        // function that knocks you back from your enemy
        function knockBack() {
            
             player.body.velocity.y = -900;

        };
        
        // function that toggles invincible state
        function toggleInvincible() {
            // toggle invincible state
            player.invincible = !player.invincible;
            // toggle alpha that visually shows whether you're invincible
            if (player.alpha == 1)
            {
                player.alpha = 0.5;
            } else {
                player.alpha = 1;
            }
        }
        
    },
    
    // chance for an enemy to drop a health pack will grow the lower the player's health is
    genHealthPack: function(enemy){
        
        this.healthDropChance = 100 - ((player.health) - HEALTH_DROP_MODIFIER);
        
        console.log('healthDropChance: '+this.healthDropChance);
        
        // roll to determine whether a health pack is generated - chance based on player health
        if (Phaser.Utils.chanceRoll(this.healthDropChance)){
            
            healthPack = new healthPacks(game, enemy.x, enemy.y);
            healthPack.body.velocity.y = -400;
            
        }
        
    },
    
    // if a player gets healed, add life.
    healPlayer: function(player, healPack){
        
        if (player.health > 0 && player.health < 100 ){
            
            // apply the heal and kill the health pack
            player.heal(10);
            healPack.destroy();
    
            console.log('health: '+player.health);
            
            // reduce the crop on the health bar
            cropRect = new Phaser.Rectangle(0,0,((player.health / player.maxHealth) * 100), 29);   
            player_healthBar.crop(cropRect, false);   
        }
    },
    
    // damage the enemy
    damageEnemy: function(bullet, enemy){
        
        // when an enemy is killed, run the health pack generating function
        enemy.events.onKilled.add(this.genHealthPack, this);
        
        // just to be safe, make sure enemy health is above 0 before damaging
        if (enemy.health > 0) {

                // apply the damage according to the enemy
                enemy.damage(5);
                // destroy the bullet on-hit
                bullet.kill();
        };
        
    }

}