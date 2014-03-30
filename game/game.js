var debug = false;
var gameDiv = "game";
var mummy;
var block;
var background;
var fps;
var message;
var points;
var gameover = false;
var jumpTimer = 0;
var jumpPressed = false;
var lastRandomLevel;

var gameWidth = parseInt(document.getElementById(gameDiv).offsetWidth);
var gameHeight = parseInt(document.getElementById(gameDiv).offsetHeight);

var game = new Phaser.Game(gameWidth, gameHeight, debug ? Phaser.CANVAS : Phaser.AUTO, gameDiv);

var BootState = {
    preload: function() {
        game.load.image('loading', 'res/textures/loading.png');
    },
    create: function() {
        game.state.start('preload');
    }
}

var PreloadState = {
    preload: function() {
        loadingBar = game.add.sprite(0, 0, 'loading');
        // Center the preload bar
        loadingBar.x = game.world.centerX - loadingBar.width / 2;
        loadingBar.y = game.world.centerY - loadingBar.height / 2;
        game.load.setPreloadSprite(loadingBar);
		
		//game.load.tilemap('start', 'res/tilemap/start.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.spritesheet('mummy', 'res/sprites/mummy.gif', 37, 45, 18);
		game.load.image('gem', 'res/sprites/gem.gif');
		game.load.image('rock', 'res/sprites/rock.gif');
		game.load.image('soil', 'res/sprites/soil.gif');
		game.load.image('halfBlock', 'res/sprites/halfBlock.gif');
		game.load.image('block', 'res/sprites/block.gif');
	},
	create: function() {		
		game.state.start('game');
	}
}


var GameState = {
	create: function() {
		jumpPressed = false;
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.gravity.y = 250;

		block = game.add.sprite(0,0,'block');
		block.exists = false;
				
		background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'soil');
		background.fixedToCamera = true;
				
		mummy = game.add.sprite(0, game.world.height - block.height*6, 'mummy');
		mummy.name = 'mummy';
    	game.physics.arcade.enable(mummy);
		mummy.scale.setTo(1,1);
		mummy.anchor.setTo(.5,.5);
		mummy.body.bounce.y = 0.05;
		mummy.body.setSize(mummy.width*0.5,mummy.height,0,0);
		mummy.body.collideWorldBounds = true;
		mummy.animations.add('walk');
		game.camera.follow(mummy);
		
		drawPlatform(game, block, platformData[0], game.world.height - block.height*6);
				
		//if (debug) {
			game.time.advancedTiming = true;
			fps = game.add.text(5, 2.5, '', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
			fps.fixedToCamera = true;
			fps.update = function () {
				fps.setText(game.time.fps+' fps');
			}
		//}
		
		message = game.add.text(game.world.width*.3, 2.5, '', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
		message.fixedToCamera = true;
		
		points = game.add.text(game.world.width-5, 2.5, '0 points', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
		points.fixedToCamera = true;
		points.p = 0;
		points.update = function() {
			points.pivot.x = points.width;
			points.pivot.y = 0;		
			points.setText(points.p+' points');
		}		
	},
	update: function() {
		var animationSpeed = 15;
		var speed = 5;
		var maxSpeed = 30;
		var jumpSpeed = 150;

		if (gameover) {
			if (game.input.activePointer.isDown) {
				this.restart();
			}
		}
		else {
			game.physics.arcade.collide(mummy, platforms, function(mummy, block) {
			});
			game.physics.arcade.collide(rocks, platforms, function(rock, block) {
				block.life--;
				if (block.life == 1) {
					block.loadTexture("halfBlock",0);
				}
				else if (block.life == 0) {
					block.destroy();
				}
			});
			game.physics.arcade.collide(mummy, rocks, function(mummy, rocks) {
			});
							
			if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
				mummy.animations.play("walk",animationSpeed);
				mummy.scale.x = -Math.abs(mummy.scale.x);
				mummy.body.velocity.x-= speed;
				if (Math.abs(mummy.body.velocity.x) > maxSpeed) {
					mummy.body.velocity.x = -maxSpeed;
				}
			}
			else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
				mummy.animations.play("walk",animationSpeed);
				mummy.scale.x = Math.abs(mummy.scale.x);
				mummy.body.velocity.x+= speed;
				if (Math.abs(mummy.body.velocity.x) > maxSpeed) {
					mummy.body.velocity.x = maxSpeed;
				}
			}
			else {
				mummy.body.velocity.x = 0;
				mummy.animations.stop();
				mummy.frame = 15;
			}
			
			if (!jumpPressed && game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && mummy.body.touching.down) {
				jumpPressed = true;
				mummy.body.velocity.y-= jumpSpeed;
			}
			
			if (!game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
				jumpPressed = false;
			}			
			
			//load next platforms!
			if (mummy.body.y+mummy.body.height > game.world.height - block.height*7) {
				var rnd;
				do {
					rnd = game.rnd.integerInRange(0,platformData.length-1);
				} 
				while(lastRandomLevel == rnd);
				lastRandomLevel = rnd;
				
				drawPlatform(game, block, platformData[lastRandomLevel]);
				drawRocks(game, block);
				game.world.setBounds(0,0,game.world.width, game.world.height+block.height*7);
			}
		}
	},
	render: function() {
		if (debug) {
			game.debug.body(mummy);
			rocks.forEach(function(e) {
				game.debug.body(e);
			});
			platforms.forEach(function (e) {
				game.debug.body(e);
			});				
		}
				
		//cleaning routines (remove lower rocks)
		rocks.forEach(function(e) {
			if (e != undefined && !e.inCamera && e.y+block.height > game.camera.y + game.camera.height) {
				e.destroy();
			}
		});

		//cleaning routines (remove upper platforms)
		platforms.forEach(function (e) {
			if (e != undefined && !e.inCamera && e.y+block.height < game.camera.y) {
				e.destroy();
			}
		});					
	},	
	restart: function() {
		gameover = false;
		
		game.state.start("game");
		points.p = 0;

		message.setText("");
	}	
}


game.state.add("boot", BootState, true);
game.state.add("preload", PreloadState, false);
game.state.add("game", GameState, false);

window.onkeypress = function(e) {
	if (e.keyCode == 114) {
		game.state.start("game");
	}
};
