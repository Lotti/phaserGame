var debug = true;
var gameDiv = "game";
var mummy;
var blocks = [];
var rocks = [];
var fps;
var message;
var points;
var started = false;
var press = false;
var gameover = false;
var jumpTimer = 0;

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
		
		game.load.spritesheet('mummy', 'res/sprites/mummy.gif', 37, 45, 18);
		game.load.image('gem', 'res/sprites/gem.gif');
		game.load.image('rock', 'res/sprites/rock.gif');
		game.load.image('soil', 'res/sprites/soil.gif');
		game.load.image('block', 'res/sprites/block.gif');
		
		/*
		game.load.image('circle', 'res/sprites/cd.png');	
		for(var i in colors) {
			game.load.image(colors[i]+'Dot', 'res/sprites/'+colors[i]+'Dot.png');
		}
		for(var i in basketColors) {
			game.load.image(basketColors[i], 'res/sprites/'+basketColors[i]+'.png');
		}
		game.load.physics('physicsBasket', 'res/physics/basket.json');
		*/
	},
	create: function() {		
		game.state.start('game');
	}
}


var GameState = {
	create: function() {
		press = false;		
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.gravity.y = 250;
		
		tilesprite = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'soil');
		
		borders = game.add.group();
		borders.name = "borders";
		for(var i = 0; i<15; i++) {
			var y;
			if (blocks.length == 0) {
				y = 0;
			}
			else {
				y = blocks[blocks.length-1].height;
			}
			
			blocks[blocks.length] = borders.create(0, y*i, 'block');
			blocks[blocks.length-1].immovable = true;
			
			blocks[blocks.length] = borders.create(game.world.width - blocks[blocks.length-1].width, y*i, 'block');
			blocks[blocks.length-1].immovable = true;			
		}
		
		mummy = game.add.sprite(0, 0, 'mummy');
    	game.physics.arcade.enable(mummy);
		mummy.scale.setTo(1.5,1.5);

		mummy.body.bounce.y = 0.15;
		mummy.body.collideWorldBounds = true;

		mummy.animations.add('left', [0, 1, 2, 3], 10, true);
		mummy.animations.add('turn', [4], 20, true);
		mummy.animations.add('right', [5, 6, 7, 8], 10, true);

		game.camera.follow(mummy);		
		
		rocks[rocks.length] = game.add.sprite(100,0, 'rock');
		game.physics.arcade.enable(rocks[rocks.length-1]);
		rocks[rocks.length-1].anchor.setTo(0.5,0.5);
		rocks[rocks.length-1].scale.setTo(1.5,1.5);
		rocks[rocks.length-1].body.setSize(16,16,0,0);
		rocks[rocks.length-1].body.bounce.y = 0.2;
		rocks[rocks.length-1].body.collideWorldBounds = true;
		
		
		/*
		//circle
		circleCG = game.physics.p2.createCollisionGroup();

		circle = game.add.sprite(game.world.width*.5-25, 25, 'circle');
		circle.collidedWith = [];
		circle.name = 'circle';
		circle.anchor.setTo(0.5,0.5);
		circle.scale.setTo(0.33,0.33);
		game.physics.p2.enable(circle, debug);
		circle.body.setCircle(circle.width * .5);
		circle.body.mass = 1;
		circle.body.setCollisionGroup(circleCG);
		circle.body.collideWorldBounds = true;
		
		//dots
		dotCG = game.physics.p2.createCollisionGroup();		

		var rows = 7;
		var cols = 15;
		var startX = 6;
		var startY = 90;
		var spaceX = 50;
		var spaceY = 45;
		dots = game.add.group();
		dots.name = 'dots';
		for(var i=0; i<cols; i++) {
			for(var j=0; j<rows; j++) {
				if (j%2==0) {
					offsetX = startX;
				}
				else {
					offsetX = spaceX*.5+startX;
				}

				var dot = dots.create(i*spaceX+offsetX, j*spaceY+startY, colors[game.rnd.integerInRange(0,colors.length-1)]+'Dot');
				dot.row = j+1; //ad-hoc variable
				dot.name = ((j+1)*i)+'dot';
				dot.anchor.setTo(0.5,0.5);
				dot.scale.setTo(0.4,0.4);
				game.physics.p2.enable(dot, debug);
				//dot.body.setCircle(dot.width * .5);
				dot.body.clearShapes();
				dot.body.addCircle(1, 0, -4, 0);
				dot.body.addCircle(1, 0, 4, 0);
				dot.body.addCircle(1, 4, 0, 0);
				dot.body.addCircle(1, -4, 0, 0);
				dot.body.mass = 100;
				dot.body.allowSleep = true;
				dot.body.setCollisionGroup(dotCG);				
				dot.body.collides(circleCG); //now it works!
			}
		}

		circle.body.collides(dotCG, function(circleBody,otherBody) {
			var row = otherBody.sprite.row;
			if (circle.collidedWith.indexOf(row) == -1) {
				circle.collidedWith.push(row);
				switch(otherBody.sprite.key) {
					default:
						points.p+=row;
					break;
					case 'redDot':
						points.p-=row;
					break;				
				}
			}
		});

		//baskets
		startX = 42.5;
		startY = game.world.height-33;
		spaceX = 92.5;
		var basketNumber = 7;

		basketCG = game.physics.p2.createCollisionGroup();	

		baskets = game.add.group();
		baskets.name = 'baskets';	
		for(var i=0; i<basketNumber; i++) {
			var basket = baskets.create(i*spaceX+startX, startY, basketColors[game.rnd.integerInRange(0,basketColors.length-1)]);
			basket.name = (i+1)+'basket';
			basket.anchor.setTo(0.5,1.0);
			basket.scale.setTo(0.75,0.75);
			game.physics.p2.enable(basket, debug);
			basket.body.clearShapes();
			basket.body.loadPolygon('physicsBasket','scaledBasket');
			basket.body.mass = 100;
			basket.body.allowSleep = true;
			basket.body.setCollisionGroup(basketCG);
			basket.body.collides(circleCG);
		}

		circle.body.collides(basketCG, function(circleBody, otherBody) {
			if (circle.collidedWith.indexOf(otherBody) == -1) {
				circle.collidedWith.push(otherBody);
				var sign = (points.p >= 0) ? true : false;
				var add = false;
				var skip = false;
				switch(otherBody.sprite.key) {
					case 'basketgreen':
						add = sign;
					break;				
					case 'basketred':
						add = !sign;
					break;
					default:
						skip = true;
					break;
				}
				
				if (!skip) {
					if (add) {
						points.p=Math.round(parseInt(points.p)*1.5);
					}
					else {
						points.p=Math.round(parseInt(points.p)*0.5);
					}
				}
				message.setText("Game Over! Click to restart!");
				gameover = true;
			}
		});
		*/
		
		//if (debug) {
			game.time.advancedTiming = true;
			fps = game.add.text(blocks[blocks.length-1].width+5, 2.5, '', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
			fps.update = function () {
				fps.setText(game.time.fps+' fps');
			}
		//}
		
		message = game.add.text(game.world.width*.3, 2.5, '', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
		
		points = game.add.text(game.world.width-blocks[blocks.length-1].width-5, 2.5, '0 points', { font: '20px Verdana', fill: '#FFFFFF', align: 'left' });
		points.p = 0;
		points.update = function () {
			points.pivot.x = points.width;
			points.pivot.y = 0;		
			points.setText(points.p+' points');
		}		
	},
	update: function() {
		var speed = 7.5;
		var jumpSpeed = 7.5;
		var circlePressed = false;

		if (gameover) {
			if (game.input.activePointer.isDown) {
				this.restart();
			}
		}
		else {
			if (game.input.keyboard.isDown(Phaser.Keyboard.CONTROL) && mummy.body.onFloor() && game.time.now > jumpTimer) {
				mummy.body.velocity.y-= jumpSpeed;
				jumpTimer = game.time.now + 750;
			}
			else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
				mummy.body.velocity.x-= speed;
			}
			else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
				mummy.body.velocity.x+= speed;
			}

			if (mummy.body.x < 0 + blocks[blocks.length-1].width) {
				mummy.body.velocity.x = 0;
				mummy.body.x = blocks[blocks.length-1].width;
			} 
			else if (mummy.body.x > game.world.width - mummy.body.width - blocks[blocks.length-1].width) {
				mummy.body.velocity.x = 0;
				mummy.body.x = game.world.width - mummy.body.width - blocks[blocks.length-1].width;
			}	

			if (mummy.body.immovable == true) {
				if (game.input.activePointer.isUp) {
					circlePressed = false;
					press = false;
				}
			}
		}

		/*
		if (game.input.activePointer.isDown) {
			if (!press && game.input.activePointer.positionDown.x > circle.position.x-circle.width*.5 
				&& game.input.activePointer.positionDown.x < circle.position.x+circle.width*.5
				&& game.input.activePointer.positionDown.y > circle.position.y-circle.height*.5
				&& game.input.activePointer.positionDown.y < circle.position.y+circle.height*.5) {
				circlePressed = true;
			}

			press = true;

			if (circlePressed) {
				circle.body.motionState = Phaser.Physics.ARCADE.Body.DYNAMIC;
			}
			else {
				circle.body.x = game.input.activePointer.worldX;
			}
		}
		else if (game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
			circle.body.motionState = 1;
		}
		*/
	},
	render: function() {
		if (debug) {
			game.debug.body(mummy);
			game.debug.body(rocks[rocks.length-1]);
		}
	},	
	restart: function() {
		gameover = false;
		press = false;

		/*
		circle.collidedWith = [];
		circle.body.x = game.world.width*.5-25;
		circle.body.y = 25;
		circle.body.motionState  = 2;
		*/

		points.p = 0;

		message.setText("");
	}	
}


game.state.add('boot', BootState, true);
game.state.add('preload', PreloadState, false);
game.state.add('game', GameState, false);

window.onkeypress = function(e) {
	if (e.keyCode == 114) {
		GameState.restart();
	}
};
