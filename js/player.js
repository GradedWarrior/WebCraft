// ==========================================
// Player
//
// This class contains the code that manages the local player.
// ==========================================

// Mouse event enumeration
MOUSE = {};
MOUSE.DOWN = 1;
MOUSE.UP = 2;
MOUSE.MOVE = 3;

// Constructor()
//
// Creates a new local player manager.

function Player()
{
}

// setWorld( world )
//
// Assign the local player to a world.

Player.prototype.setWorld = function( world )
{
	this.world = world;
	this.world.localPlayer = this;
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
	this.shiftDown = false
	this.escDown = false;
	this.onGui = false;
	this.mouseSlot = {id: 0, count: 0, durability: 1};
}

// setClient( client )
//
// Assign the local player to a socket client.

Player.prototype.setClient = function( client )
{
	this.client = client;
}

// setGamemode( mode )
//
// Set players gamemode

Player.prototype.setGamemode = function( mode )
{
	this.gamemode = mode;
}

// setInputCanvas( id )
//
// Set the canvas the renderer uses for some input operations.

Player.prototype.setInputCanvas = function( id )
{
	var canvas = this.canvas = document.getElementById( id );
    var player = this;

    // Below we set up the pointer lock for this canvas
    // Reference:
    //   https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;

    // once clicking on the canvas, pointer lock is enabled
    canvas.onclick = function() {
        canvas.requestPointerLock();
    };

    // Hook for updating viewing angles
    var updateAngles = function (e) {
	    player.targetPitch = player.pitchStart - e.movementY / 200;
	    player.targetYaw = player.yawStart + e.movementX / 200;
        player.yawStart = player.targetYaw;
        player.pitchStart = player.targetPitch;
	    canvas.style.cursor = "move";
    };

    // Listen to the pointer lock change
    var pointerLockChange = function () {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            player.pointerLocked = true;
            document.addEventListener("mousemove", updateAngles, false);
        } else {
            player.pointerLocked = false;
            document.removeEventListener("mousemove", updateAngles, false);
        }
    };
    document.addEventListener('pointerlockchange', pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', pointerLockChange, false);

	var t = this;
	document.onkeydown = function( e ) {
        if ( e.target.tagName != "INPUT" ) {
            t.onKeyEvent( e.keyCode, true );
            return false;
        }
    }
	document.onkeyup = function( e ) {
        if ( e.target.tagName != "INPUT" ) {
            t.onKeyEvent( e.keyCode, false );
            return false;
        }
    }
	canvas.onmousedown = function( e ) {
        t.onMouseEvent( e.clientX, e.clientY, MOUSE.DOWN, e.which == 3 );
        return false;
    }
	canvas.onmouseup = function( e ) {
        t.onMouseEvent( e.clientX, e.clientY, MOUSE.UP, e.which == 3 );
        return false;
    }
	canvas.onmousemove = function( e ) {
        t.onMouseEvent( e.clientX, e.clientY, MOUSE.MOVE, e.which == 3 );
        return false;
    }
}

//
// 
// loads hotbar

Player.prototype.loadHotBar = function()
{
	var tableRow = document.getElementById( "hotbar" ).getElementsByTagName( "tr" )[0];
	var texOffset = 10;
	var slot;
	// Setup inventory data
	for (  slot = 0; slot < 36; slot++ ) {
		var newSlot = {
			slot: slot,
			id: 0,
			count: 0
		};
		this.inventory.push(newSlot);
	}

	// Display slots

	for (  slot = 0; slot < 9; slot++ )
	{
		var selector = document.createElement( "td" );
		
		var pl = this;
		var curSlot;

  			selector.material = BLOCK.fromId(pl.inventory[slot].id);
			selector.innerHTML = pl.inventory[0].count;
		
		selector.onclick = function()
		{
			pl.currentSlot = slot;
			pl.buildMaterial = this.material;
		}

		tableRow.appendChild( selector );
		texOffset -= 70;
	}
	// debug
	this.inventory[0].id = 58;
	this.inventory[0].count = 64;
}

Player.prototype.updateHotBarData = function () {
	var tableRow = document.getElementById( "hotbar" ).getElementsByTagName( "td" );
var i
	for ( i = 0; i < tableRow.length; i++ ) {
		var selector = tableRow[i];
		var slot = i;
				var pl = this;
		//se;
		var curSlot;
  			selector.material = BLOCK.fromId(pl.inventory[slot].id);
			selector.innerHTML = '<img width="30" src="resource_packs/default/textures/block/' + BLOCK.fromId(pl.inventory[slot].id).name_id + '.png"/><p class="item-count">' + pl.inventory[slot].count + '</p>';
		
		selector.onclick = function()
		{
			pl.currentSlot = i;
			pl.buildMaterial = this.material;
		}

	}
}

Player.prototype.setSlot = function (slot) {
	this.currentSlot = slot;
	this.buildMaterial = BLOCK.fromId(this.inventory[slot].id);
}
// Collect item
//
//

Player.prototype.collectItem = function (item) {
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


Player.prototype.openInventory = function() {
	if (this.onGui == false) {

		this.onGui = true;

		document.getElementById("gui-overlay").style.display = "block";
		document.exitPointerLock();
		document.getElementById("gui-content").innerHTML = '<img class="gui" src="' + containerPath +'/inventory.png" width="400"/>';
		document.getElementById("gui-slot-container").innerHTML = '<div id="gui-inventory-crafting-container"></div><div id="gui-inventory-crafted-container"></div><div id="gui-inventory-slot-container"></div><div id="gui-inventory-hotbar-slot-container"></div>';
		var slot;
		for (  slot = 9; slot < 36; slot++ ) {
			var slotElm = document.createElement("div");
			slotElm.setAttribute("id", "gui-container-slot");
			document.getElementById("gui-inventory-slot-container").appendChild(slotElm);
		}
	} else {
		this.onGui = false;
		document.getElementById("gui-overlay").style.display = "none";
		document.getElementById("gui-overlayer").innerHTML = "";
		document.getElementById("gui-content").innerHTML = "";
		this.canvas.requestPointerLock();
	}
}
// setMaterialSelector( id )
//
// Sets the table with the material selectors.

Player.prototype.setMaterialSelector = function( id )
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
// Hook a player event.

Player.prototype.on = function( event, callback )
{
	this.eventHandlers[event] = callback;
}

// onKeyEvent( keyCode, down )
//
// Hook for keyboard input.

Player.prototype.onKeyEvent = function( keyCode, down )
{
	var key = String.fromCharCode( keyCode ).toLowerCase();
	this.keys[key] = down;
	this.keys[keyCode] = down;
	
	if ( !down && key == "t" && this.eventHandlers["openChat"] ) this.eventHandlers.openChat();

	if (keyCode == 27) {
		this.escDown = true;
		if (this.onGui = true) {
		document.getElementById("gui-overlay").style.display = "none";
		document.getElementById("gui-content").innerHTML = "";
		this.canvas.requestPointerLock();
		setTimeout(function () {document.getElementById("renderSurface").requestPointerLock();}, 101);
		//func();
		this.onGui = false;
		}
	} else {
		this.escDown = false;
	}

	if (keyCode == 16) {

	}
    if (!down && key == "e") {
    	this.openInventory();
    }
}

// onMouseEvent( x, y, type, rmb )
//
// Hook for mouse input.
Player.prototype.onMouseEvent = function( x, y, type, rmb )
{
	if ( type == MOUSE.UP && this.pointerLocked ) {
		this.doBlockAction( this.canvas.width / 2, this.canvas.height / 2, !rmb );
		this.canvas.style.cursor = "default";
	}
}


// doBlockAction( x, y )
//
// Called to perform an action based on the player's block selection and input.

Player.prototype.doBlockAction = function( x, y, destroy )
{
	var bPos = new Vector( Math.floor( this.pos.x ), Math.floor( this.pos.y ), Math.floor( this.pos.z ) );
	var block = this.canvas.renderer.pickAt( new Vector( bPos.x - 4, bPos.y - 4, bPos.z - 4 ), new Vector( bPos.x + 4, bPos.y + 4, bPos.z + 4 ), x, y );

	if ( block != false )
	{
		var obj = this.client ? this.client : this.world;

		if ( destroy ) {
			if (this.gamemode == 0) {
			this.collectItem(obj.getBlock(block.x, block.y, block.z));
		}
			obj.setBlock( block.x, block.y, block.z, BLOCK.AIR );
		} else {
			if ((!this.world.getBlock(block.x, block.y, block.z).onAction) || this.shiftDown) {
				if (this.gamemode == 0) {
					if (this.buildMaterial != BLOCK.AIR ) {
					var item = this.inventory[this.currentSlot];
					var count = item.count -1;
						if (count == -1) {
							item.id = 0;
							this.buildMaterial = BLOCK.AIR;
						} else {
							item.count = item.count -1;
						}
				}

					this.updateHotBarData();
				}
				obj.setBlock( block.x + block.n.x, block.y + block.n.y, block.z + block.n.z, this.buildMaterial );
		} else {
			this.world.getBlock(block.x, block.y, block.z).onAction();
		}
	}
	}
}

// getEyePos()
//
// Returns the position of the eyes of the player for rendering.

Player.prototype.getEyePos = function()
{
	return this.pos.add( new Vector( 0.0, 0.0, 1.7 ) );
}

// update()
//
// Updates this local player (gravity, movement)

Player.prototype.update = function()
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
// Resolves collisions between the player and blocks on XY level for the next movement step.

Player.prototype.resolveCollision = function( pos, bPos, velocity )
{
	var world = this.world;
	var playerRect = { x: pos.x + velocity.x, y: pos.y + velocity.y, size: 0.25 };

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

		if ( lineRectCollide( side, playerRect ) )
		{
			if ( side.x != null && velocity.x * side.dir < 0 ) {
				pos.x = side.x + playerRect.size / 2 * ( velocity.x > 0 ? -1 : 1 );
				velocity.x = 0;
			} else if ( side.y != null && velocity.y * side.dir < 0 ) {
				pos.y = side.y + playerRect.size / 2 * ( velocity.y > 0 ? -1 : 1 );
				velocity.y = 0;
			}
		}
	}

	var playerFace = { x1: pos.x + velocity.x - 0.125, y1: pos.y + velocity.y - 0.125, x2: pos.x + velocity.x + 0.125, y2: pos.y + velocity.y + 0.125 };
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

		if ( rectRectCollide( face, playerFace ) && velocity.z * face.dir < 0 )
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
