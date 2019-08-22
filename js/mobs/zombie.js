// ==========================================
// Zombie
//
// This class contains the code that manages the local Zombie.
// ==========================================

// Mouse event enumeration
MOUSE = {};
MOUSE.DOWN = 1;
MOUSE.UP = 2;
MOUSE.MOVE = 3;

// Constructor()
//
// Creates a new Zombie manager.

function Zombie()
{
}

// setWorld( world )
//
// Assign the Zombie to a world.

Zombie.prototype.setWorld = function( world )
{
	this.world = world;
	this.world.localZombie = this;
	this.pos = world.spawnPoint;
	this.velocity = new Vector( 0, 0, 0 );
	this.angles = [ 0, Math.PI, 0 ];
	this.yawStart = this.targetYaw = this.angles[1];
	this.pitchStart = this.targetPitch = this.angles[0];
    this.pointerLocked = false;
	this.falling = false;
	this.keys = {};
	this.buildMaterial = BLOCK.DIRT;
	this.eventHandlers = {};
	this.inventory = [];
	this.currentSlot = 0;
	this.speed = 10;
}

// setClient( client )
//
// Assign the local Zombie to a socket client.

Zombie.prototype.setClient = function( client )
{
	this.client = client;
}

// setGamemode( mode )
//
// Set Zombies gamemode

// setInputCanvas( id )
//
// Set the canvas the renderer uses for some input operations.


//
// 
// loads hotbar

Zombie.prototype.loadHotBar = function()
{
	var tableRow = document.getElementById( "hotbar" ).getElementsByTagName( "tr" )[0];
	var texOffset = 10;
	var slot;
	// Setup inventory data
	for (  slot = 0; slot < 1; slot++ ) {
		var newSlot = {
			slot: slot,
			id: 0,
			count: 0
		};
		this.inventory.push(newSlot);
	}


}

Zombie.prototype.updateHotBarData = function () {

}

Zombie.prototype.setSlot = function (slot) {
	this.currentSlot = slot;
	this.buildMaterial = BLOCK.fromId(this.inventory[slot].id);
}
// Collect item
//
//

Zombie.prototype.collectItem = function (item) {
var pl = this;
function getEmptySlot() {
	var slot;
    for ( slot = 0; slot < 36; slot++ )
        if ( pl.inventory[slot].id == 0 ) {
            return pl.inventory[slot];
            break;
        } else {
        	console.log("Something went wrong getting empty slot.");
        }
}
var newBlock;
for ( slot = 0; slot < 36; slot++ ) {
    if ( typeof( this.inventory[slot] ) == "object" && this.inventory[slot].id == item.id ) {
        newBlock = false;
        this.inventory[slot].count = this.inventory[slot].count + 1;
        break;
     } else {
     	newBlock = true;
     	//for ( var mat in this.inventory ) {
     		if (this.inventory[slot].id == 0) { 
     			newSlot = getEmptySlot();
     		 	newSlot.id = item.id;
     			newSlot.count = 1;
     		var item = this.inventory[this.currentSlot];
			if (item.id = newSlot.id) {
				this.buildMaterial = BLOCK.fromId(newSlot.id);
			}
     			break;
     		//}
     	
     }
}
}
this.updateHotBarData();
}
// setMaterialSelector( id )
//
// Sets the table with the material selectors.

Zombie.prototype.setMaterialSelector = function( id )
{
	var tableRow = document.getElementById( id ).getElementsByTagName( "tr" )[0];
	var texOffset = 0;
	this.setSlot(this.currentSlot);
	for ( var mat in BLOCK )
	{
		if ( typeof( BLOCK[mat] ) == "object" && BLOCK[mat].spawnable == true )
		{
			var selector = document.createElement( "td" );
			selector.style.backgroundPosition = texOffset + "px 0px";

			var pl = this;
			selector.material = BLOCK[mat];
			selector.onclick = function()
			{
				this.style.opacity = "1.0";

				pl.prevSelector.style.opacity = null;
				pl.prevSelector = this;

				pl.buildMaterial = this.material;
			}

			if ( mat == "DIRT" ) {
				this.prevSelector = selector;
				selector.style.opacity = "1.0";
			}

			tableRow.appendChild( selector );
			texOffset -= 70;
		}
	}
}

// on( event, callback )
//
// Hook a Zombie event.

Zombie.prototype.on = function( event, callback )
{
	this.eventHandlers[event] = callback;
}

// onKeyEvent( keyCode, down )
//
// Hook for keyboard input.

Zombie.prototype.onKeyEvent = function( keyCode, down )
{
	var key = String.fromCharCode( keyCode ).toLowerCase();
	this.keys[key] = down;
	this.keys[keyCode] = down;

	if ( !down && key == "t" && this.eventHandlers["openChat"] ) this.eventHandlers.openChat();
}

// onMouseEvent( x, y, type, rmb )
//
// Hook for mouse input.
Zombie.prototype.onMouseEvent = function( x, y, type, rmb )
{
	if ( type == MOUSE.UP && this.pointerLocked ) {
		this.doBlockAction( this.canvas.width / 2, this.canvas.height / 2, !rmb );
		this.canvas.style.cursor = "default";
	}
}


// getEyePos()
//
// Returns the position of the eyes of the Zombie for rendering.

Zombie.prototype.getEyePos = function()
{
	return this.pos.add( new Vector( 0.0, 0.0, 1.7 ) );
}

// update()
//
// Updates this local Zombie (gravity, movement)

Zombie.prototype.update = function()
{
	var world = this.world;
	var velocity = this.velocity;
	var pos = this.pos;
	var bPos = new Vector( Math.floor( pos.x ), Math.floor( pos.y ), Math.floor( pos.z ) );

	if ( this.lastUpdate != null )
	{
		var delta = ( new Date().getTime() - this.lastUpdate ) / 1000;

		// View
		this.angles[0] += ( this.targetPitch - this.angles[0] ) * 30 * delta;
		this.angles[1] += ( this.targetYaw - this.angles[1] ) * 30 * delta;
		if ( this.angles[0] < -Math.PI/2 ) this.angles[0] = -Math.PI/2;
		if ( this.angles[0] > Math.PI/2 ) this.angles[0] = Math.PI/2;

		// Gravity
		if ( this.falling )
			velocity.z += -0.7;

        
		// Jumping
		if ( this.keys[" "] && !this.falling )
			velocity.z = 6.1;

		// Walking
		var walkVelocity = new Vector( 0, 0, 0 );
		if ( this.falling )
		{
			if ( this.keys["w"] ) {
				walkVelocity.x += Math.cos( Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["s"] ) {
				walkVelocity.x += Math.cos( Math.PI + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI + Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["a"] ) {
				walkVelocity.x += Math.cos( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
			}
			if ( this.keys["d"] ) {
				walkVelocity.x += Math.cos( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
				walkVelocity.y += Math.sin( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
			}
		}
		if ( walkVelocity.length() > 0 ) {
				walkVelocity = walkVelocity.normal();
				velocity.x = walkVelocity.x * 4;
				velocity.y = walkVelocity.y * 4;
		} else {
			velocity.x /= this.falling ? 1.01 : 1.5;
			velocity.y /= this.falling ? 1.01 : 1.5;
		}

		// Resolve collision
		this.pos = this.resolveCollision( pos, bPos, velocity.mul( delta ) );
	}

	// Hot keys

	if ( this.keys["1"] ) {
		this.setSlot(0)
	}
	if ( this.keys["2"] ) {
		this.setSlot(1)
	}
	if ( this.keys["3"] ) {
		this.setSlot(2)
	}
	if ( this.keys["4"] ) {
		this.setSlot(3)
	}
	if ( this.keys["5"] ) {
		this.setSlot(4)
	}
	if ( this.keys["6"] ) {
		this.setSlot(5)
	}
	if ( this.keys["7"] ) {
		this.setSlot(6)
	}
	if ( this.keys["8"] ) {
		this.setSlot(7)
	}
	if ( this.keys["9"] ) {
		this.setSlot(8)
	}
	this.lastUpdate = new Date().getTime();
}

// resolveCollision( pos, bPos, velocity )
//
// Resolves collisions between the Zombie and blocks on XY level for the next movement step.

Zombie.prototype.resolveCollision = function( pos, bPos, velocity )
{
	var world = this.world;
	var ZombieRect = { x: pos.x + velocity.x, y: pos.y + velocity.y, size: 0.25 };

	// Collect XY collision sides
	var collisionCandidates = [];

	for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ )
	{
		for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
		{
			for ( var z = bPos.z; z <= bPos.z + 1; z++ )
			{
				if ( world.getBlock( x, y, z ) != BLOCK.AIR )
				{
					if ( world.getBlock( x - 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x, dir: -1, y1: y, y2: y + 1 } );
					if ( world.getBlock( x + 1, y, z ) == BLOCK.AIR ) collisionCandidates.push( { x: x + 1, dir: 1, y1: y, y2: y + 1 } );
					if ( world.getBlock( x, y - 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y, dir: -1, x1: x, x2: x + 1 } );
					if ( world.getBlock( x, y + 1, z ) == BLOCK.AIR ) collisionCandidates.push( { y: y + 1, dir: 1, x1: x, x2: x + 1 } );
				}
			}
		}
	}

	// Solve XY collisions
	for( var i in collisionCandidates )
	{
		var side = collisionCandidates[i];

		if ( lineRectCollide( side, ZombieRect ) )
		{
			if ( side.x != null && velocity.x * side.dir < 0 ) {
				pos.x = side.x + ZombieRect.size / 2 * ( velocity.x > 0 ? -1 : 1 );
				velocity.x = 0;
			} else if ( side.y != null && velocity.y * side.dir < 0 ) {
				pos.y = side.y + ZombieRect.size / 2 * ( velocity.y > 0 ? -1 : 1 );
				velocity.y = 0;
			}
		}
	}

	var ZombieFace = { x1: pos.x + velocity.x - 0.125, y1: pos.y + velocity.y - 0.125, x2: pos.x + velocity.x + 0.125, y2: pos.y + velocity.y + 0.125 };
	var newBZLower = Math.floor( pos.z + velocity.z );
	var newBZUpper = Math.floor( pos.z + 1.7 + velocity.z * 1.1 );

	// Collect Z collision sides
	collisionCandidates = [];

	for ( var x = bPos.x - 1; x <= bPos.x + 1; x++ )
	{
		for ( var y = bPos.y - 1; y <= bPos.y + 1; y++ )
		{
			if ( world.getBlock( x, y, newBZLower ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZLower + 1, dir: 1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
			if ( world.getBlock( x, y, newBZUpper ) != BLOCK.AIR )
				collisionCandidates.push( { z: newBZUpper, dir: -1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
		}
	}

	// Solve Z collisions
	this.falling = true;
	for ( var i in collisionCandidates )
	{
		var face = collisionCandidates[i];

		if ( rectRectCollide( face, ZombieFace ) && velocity.z * face.dir < 0 )
		{
			if ( velocity.z < 0 ) {
				this.falling = false;
				pos.z = face.z;
				velocity.z = 0;
				this.velocity.z = 0;
			} else {
				pos.z = face.z - 1.8;
				velocity.z = 0;
				this.velocity.z = 0;
			}

			break;
		}
	}

	// Return solution
	return pos.add( velocity );
}
