var platforms = null;
var rocks = null;
var platformData = [
	[
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[2,1,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
		[2,2,1,0,0,0,0,0,0,0,0,0,0,1,2,2],
		[2,2,2,1,0,0,0,0,0,0,0,0,1,2,2,2],
		[1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
	],
	[
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0],
		[2,2,2,1,0,0,1,2,2,1,0,0,0,0,0,0],
		[2,2,2,2,1,1,2,2,2,2,1,0,0,0,0,0],
		[1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
	],
	[
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,2],
		[0,0,0,1,1,2,1,1,0,0,0,0,0,1,2,2],
		[0,0,1,2,2,2,2,2,1,1,0,0,0,0,1,2],
		[0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1],
	],
	[
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
		[0,0,0,0,1,2,1,1,1,1,2,1,0,0,0,0],
		[0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
		[0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
	],
	[
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
		[0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0],
		[1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	],
	[
		[0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0],
		[1,0,0,1,0,0,1,0,0,0,1,1,0,0,1,0],
		[1,0,0,0,0,1,1,0,0,0,0,1,1,0,1,0],
		[1,0,0,0,0,1,0,0,1,1,0,0,0,0,1,0],
		[1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,0],
	],
	[
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[2,1,0,0,0,0,0,0,0,0,0,0,0,0,1,2],
		[2,2,1,0,0,0,0,0,0,0,0,0,0,1,2,2],
		[2,2,2,1,0,0,0,0,0,0,0,0,1,2,2,2],
		[1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
	],
];
	
function drawPlatform(game, block, platformData, y) {
	if (platforms == null) {
		platforms = game.add.group();
 		//platforms.enableBody = true;
    	//platforms.physicsBodyType = Phaser.Physics.ARCADE;		
	}
	var x = 0;
	var y = (y !== undefined) ? y : game.world.height + block.height;
	y+= block.height;

	var reverse = game.rnd.integerInRange(0,1);
		
	for(var i = 0; i<platformData.length; i++) {
		for(var j = 0; j<platformData[i].length; j++) {
			if (reverse) {
				var jj = (platformData[i].length-1)-j;
			}
			else {
				var jj = j;		
			}		
			if (platformData[i][jj]) {
				var b = platforms.create(x+j*block.width, y+i*block.height, 'block', 12);
				b.name = 'block';
				b.life = 2;
				//if (platformData[i][jj] != 2) {
					game.physics.arcade.enable(b);
					b.body.allowGravity = false;
					b.body.immovable = true;		
				//}
			}
		}
	}
}
		
function drawRocks(game, block) {
	if (rocks == null) {
		rocks = game.add.group();
 		rocks.enableBody = true;
    	rocks.physicsBodyType = Phaser.Physics.ARCADE;		
	}		
		
	var lastP = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	var p;
	var n = game.rnd.integerInRange(0,4);
	for(var i = 0; i<n; i++) {
		do {
			p = game.rnd.integerInRange(0,game.world.width/block.width);
		} while(lastP[p] == 1);
		lastP[p] = 1;
		r = rocks.create(p*block.width-18, game.camera.y - block.height, "rock", 11);
		r.name = "rock";
		r.anchor.setTo(0.5,0.5);
		r.scale.setTo(1.5,1.5);
		r.body.setSize(16,16,0,0);
		r.body.bounce.setTo(0.2, 0.2);
		r.body.angularVelocity = 250;
		r.body.collideWorldBounds = true;
	}
}

function last(array) {
	if (array.length > 0) {
		return array[array.length-1];
	}
	else {
		return null;
	}
}