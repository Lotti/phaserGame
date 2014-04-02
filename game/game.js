var debug = false;
var mummy;
var block;
var background;
var fps;
var message;
var points;
var started = debug;
var gameover = false;
var jumpTimer = 0;
var jumpPressed = false;
var lastRandomLevel;

var gems;
var platforms;
var rocks;

var gameDiv = "game";
var gameWidth = parseInt(document.getElementById(gameDiv).offsetWidth);
var gameHeight = parseInt(document.getElementById(gameDiv).offsetHeight);

var game = new Phaser.Game(gameWidth, gameHeight, debug ? Phaser.CANVAS : Phaser.AUTO, gameDiv, null, false, false);

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
		game.load.image('dot', 'res/sprites/dot.gif');
		game.load.image('soil', 'res/sprites/soil.gif');
		game.load.image('block', 'res/sprites/block.gif');
	},
	create: function() {
		game.state.start('game');		
	}
}


var GameState = {
	create: function() {
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.gravity.y = 250;

		block = game.add.sprite(0,0,'block');
		block.exists = false;
				
		background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'soil');
		background.fixedToCamera = true;
		
		gems = game.add.group();
		platforms = game.add.group();
		rocks = game.add.group();		
				
		mummy = game.add.sprite(0, game.world.height - block.height*6, 'mummy');
		mummy.name = 'mummy';
		mummy.lifes = 3;
		mummy.hit = 0;
		
		mummy.animationSpeed = 15;
		mummy.walkSpeed = 5;
		mummy.jumpSpeed = 150;
		
    	game.physics.arcade.enable(mummy);
		mummy.scale.setTo(1,1);
		mummy.anchor.setTo(.5,.5);
		mummy.body.bounce.y = 0.05;
		mummy.body.setSize(mummy.width*0.5,mummy.height,0,0);
		mummy.body.collideWorldBounds = true;
		mummy.animations.add('walk');
		mummy.body.drag.set(1,1);
		mummy.body.maxVelocity.set(30, 10000);
		game.camera.follow(mummy);
		
		drawPlatform(game, block, platformData[0], game.world.height - block.height*6);
				
		//if (debug) {
			game.time.advancedTiming = true;
			fps = game.add.text(5, 2.5, '', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
			fps.fixedToCamera = true;
			fps.update = function() {
				fps.setText(game.time.fps+' fps');
			}
		//}
		
		message = game.add.text(game.world.width*.4, 2.5, '', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
		message.update = function() {
			var t = 'lives: ';
			for(var i = 0; i<mummy.lifes; i++) {
				t+= '*';
			}
			message.setText(t);
		}
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
		if (gameover) {
			
			message.setText("Game Over!");
			
			mummy.body.velocity.x = 0;
			mummy.body.velocity.y = 0;
			mummy.body.angularVelocity = 0;
			mummy.body.allowGravity = false;
			mummy.body.immovable = true;
			mummy.animations.stop();
		
			rocks.forEach(function(e) {
				e.body.velocity.x = 0;
				e.body.velocity.y = 0;
				e.body.angularVelocity = 0;
				e.body.allowGravity = false;
				e.body.immovable = true;	
			});
			
			if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
				this.restart();
			}
		}
		else {
			if (mummy.lifes <= 0) {
				gameover = true;
			}
			
			//gem "no-physics" collision
			if (gems != null) {
				gems.forEach(function(e) {
					if (e != undefined && e.exists && Phaser.Rectangle.intersects(mummy.getBounds(), e.getBounds())) {
						e.kill();
						points.p+=5;
					}
				});
			}
			
			//mummy collisions
			game.physics.arcade.collide(mummy, [platforms, rocks], function(mummy, o) {
				if (mummy != undefined && o != undefined) {
					if (o.name == "rock") {
						if (!mummy.hit) {
							mummy.lifes--;
							if (mummy.lifes > 0) {
								mummy.hit = 1;
								game.time.events.repeat(Phaser.Timer.SECOND * 0.15, 10, function() {
									mummy.visible = !mummy.visible;
									mummy.hit++;
									if (mummy.hit > 10) {
										mummy.hit = 0;
										mummy.visible = true;
									}
								}, this);
							}
						}
					}
				}
				else {
					console.log("mummy or other undefined");
				}				
			});
			
			//rocks collisions
			game.physics.arcade.collide(rocks, [gems,platforms,rocks], function(rock, o) {
				if (rock != undefined && o != undefined) {
					if (o.name == "gem") {
						o.kill();
					}
					else if (o.name == "block") {
                        o.kill();
                        
						if (rock.particles == undefined) {
							rock.particles = game.add.emitter(0, 0, 100);
							rock.particles.makeParticles('dot');
                            //rock.particles.scale.setTo(0.25,0.25);
                            rock.particles.gravity = 250;
						}
						
						rock.particles.x = rock.x;
    					rock.particles.y = rock.y;
						rock.particles.start(true, 2000, null, 4);
						rock.scale.setTo(r.scale.x*0.8,r.scale.y*0.8);
                        rock.lifes--;
						if (rock.lifes == 0) {
							rock.kill();
						}
					}
				}
				else {
					console.log("rock or other undefined");
				}
			});
            
            var clickOnLeft = false;
            var clickOnRight = false;
            var clickOnTop = false;
            if (game.input.activePointer.isDown) {
                if (game.input.activePointer.x < game.width*0.5) {
                    clickOnLeft = true;
                }
                else if (game.input.activePointer.x > game.width*0.5) {
                    clickOnRight = true;
                }

                if (game.input.activePointer.y < game.height*0.5) {
                    clickOnTop = true;
                }
            }
							
			if (clickOnLeft || game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
				mummy.animations.play("walk",mummy.animationSpeed);
				mummy.scale.x = -Math.abs(mummy.scale.x);
				
				mummy.body.velocity.x-= mummy.walkSpeed;
			}
			else if (clickOnRight || game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
				mummy.animations.play("walk",mummy.animationSpeed);
				mummy.scale.x = Math.abs(mummy.scale.x);
				
				mummy.body.velocity.x+= mummy.walkSpeed;
			}
			else {
				mummy.body.velocity.x = 0;
				mummy.animations.stop();
				mummy.frame = 15;
			}
			
			if (!jumpPressed && (clickOnTop || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) && mummy.body.touching.down) {
				jumpPressed = true;
				mummy.body.velocity.y-= mummy.jumpSpeed;
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
				if (started) {
					points.p++;
					drawRocks(game, block);
				}
				game.world.setBounds(0,0,game.world.width, game.world.height+block.height*7);
				started = true;
				
				this.cleanUp();
			}
		}
	},
	cleanUp: function() {
		//cleaning routines (remove lower rocks)
		rocks.forEachExists(function(e) {
			if (e != undefined && !e.inCamera && e.y+block.height > game.camera.y + game.camera.height) {
				e.kill();
			}
		});

		//cleaning routines (remove upper platforms)
		platforms.forEachExists(function (e) {
			if (e != undefined && !e.inCamera && e.y+block.height < game.camera.y*1.5) {
				e.kill();
			}
		});
		
		gems.forEach(function(e) {
			if (e != undefined) {
				if (!e.exists) {
					gems.remove(e);
					e.destroy();
				}
			}
		});
		rocks.forEach(function(e) {
			if (e != undefined) {
				if (!e.exists) {
					
					if (e.particles != undefined) {
						e.particles.destroy();
					}
					rocks.remove(e);
					e.destroy();
				}
			}
		});
		platforms.forEach(function (e) {
			if (e != undefined) {
				if (!e.exists) {
					platforms.remove(e);
					e.destroy();
				}
			}
		});			
	},	
	restart: function() {
		started = false;
		gameover = false;		
		jumpTimer = 0;
		jumpPressed = false;
		
		game.state.start("game",true,false);
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
