// ==========================================
// World container
//
// This class contains the elements that make up the game world.
// Other modules retrieve information from the world or alter it
// using this class.
// ==========================================

// Constructor( sx, sy, sz )
//
// Creates a new world container with the specified world size.
// Up and down should always be aligned with the Z-direction.
//
// sx - World size in the X-direction.
// sy - World size in the Y-direction.
// sz - World size in the Z-direction.

function World(sx, sy, sz, roughness, smoothAmount, smoothAmt){

	this.blocks = new Array( sx );
	for ( var x = 0; x < sx; x++ )
	{
		this.blocks[x] = new Array( sy );
		for ( var y = 0; y < sy; y++ )
		{
			this.blocks[x][y] = new Array( sz );
		}
	}
	for(var x = 0; x < sx;x++){
		for(var y = 0; y < sy;y++){
			for(var z = 0; z < sz;z++){
				this.blocks[x][y][z] = BLOCK.AIR;
			}
		}
	}

	this.sx = sx;
	this.sy = sy;
	this.sz = sz;
	
	this.roughness = roughness;
	this.smoothAmount = smoothAmount;
	this.smoothAmt = smoothAmt;

	this.players = {};
}

var PerlinNoise = (function() {
	

	var CN=function(a){if(a==undefined)a=Math;this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];this.p=[];for(var b=0;b<256;b++)this.p[b]=Math.floor(a.random()*256);this.perm=[];for(b=0;b<512;b++)this.perm[b]=this.p[b&255]};CN.prototype.dot=function(a,b,f,g){return a[0]*b+a[1]*f+a[2]*g};CN.prototype.mix=function(a,b,f){return(1-f)*a+f*b};
	  CN.prototype.fade=function(a){return a*a*a*(a*(a*6-15)+10)};var floor=Math.floor;
	  CN.prototype.noise=function(a,b,f){var g=~~a,i=~~b,k=~~f;a-=g;b-=i;f-=k;g&=255;i&=255;k&=255;var d=this.perm,r=d[g+d[i+d[k+1]]]%12,s=d[g+d[i+1+d[k]]]%12,n=d[g+d[i+1+d[k+1]]]%12,o=d[g+1+d[i+d[k]]]%12,q=d[g+1+d[i+d[k+1]]]%12,c=d[g+1+d[i+1+d[k]]]%12,j=d[g+1+d[i+1+d[k+1]]]%12,e=this.grad3,h=this.dot,l=this.fade,m=this.mix;g=h(e[d[g+d[i+d[k]]]%12],a,b,f);o=h(e[o],a-1,b,f);s=h(e[s],a,b-1,f);c=h(e[c],a-1,b-1,f);r=h(e[r],a,b,f-1);q=h(e[q],a-1,b,f-1);n=h(e[n],a,b-1,f-1);j=h(e[j],a-1,b-1,f-1);a=
	  l(a);b=l(b);f=l(f);l=m(g,o,a);e=m(r,q,a);h=m(s,c,a);a=m(n,j,a);l=m(l,h,b);b=m(e,a,b);return m(l,b,f)};


	return CN;

})();

World.prototype.getPower = function(a,b){
	if(b == 0)return 1;
	var d = a;
	for(var c = 1;c < b;c++)a = a*d;
	return a;
}

World.prototype.getPowerOfTwo = function(a,b){
	if(a<b)a = b;
	for(b = 0;this.getPower(2, b) <= a;b++);
	return b;
}

World.prototype.createWorld = function()
{

	var map = generate(this.getPower(2, this.getPowerOfTwo(this.sx, this.sy)), this.roughness, this.smoothAmount, this.smoothAmt);
	
	for ( var x = 0; x < this.sx; x++ ){
		for ( var y = 0; y < this.sy; y++ ){
			this.blocks[x][y][0] = BLOCK.BEDROCK;
			var pointHeight = map[x][y] * (this.sz - 10);
			for(var z = 1; z < this.sz;z++){
				if(z < pointHeight){
					if(!(z < pointHeight - 1))this.blocks[x][y][z] = BLOCK.GRASS_DIRT;
					else if(z < pointHeight - 3){
						var random = Math.random() * 100;
						if(random < 1){
							this.blocks[x][y][z] = BLOCK.DIAMOND_ORE;
						}
						else if(random < 3){
							this.blocks[x][y][z] = BLOCK.GOLD_ORE;
						}
						else if(random < 6){
							this.blocks[x][y][z] = BLOCK.REDSTONE_ORE;
						}
						else if(random < 14){
							this.blocks[x][y][z] = BLOCK.IRON_ORE;
						}
						else if(random < 24){
							this.blocks[x][y][z] = BLOCK.COAL_ORE;
						}
						else this.blocks[x][y][z] = BLOCK.STONE;
					}
					else this.blocks[x][y][z] = BLOCK.DIRT;
				}
				else if(z < 42){
					//this.blocks[x][y][z] = BLOCK.STILL_WATER;
				}
				else if(y != this.sy/2 && x != this.sx/2 && ( z < pointHeight + 1 && z > pointHeight - 1) && (x > 2 && x < this.sx - 2) && (y > 2 && y < this.sy - 2)){
					var random = Math.random() * 100;
					if(random < 1){
						this.createTree(x,y,z,5,4,2);
					}
				}
			}
		}
	}
	this.spawnPoint = new Vector( this.sx/2 + 0.5, this.sy/2 + 0.5, map[this.sx/2][this.sy/2] * (this.sz - 10));
};

World.prototype.createTree = function(x,y,z,trunkHeight,leavesHeight,range)
{
	for(iz = 0;iz < trunkHeight;iz++){
		this.blocks[x][y][z + iz] = BLOCK.WOOD;
	}	

	for(var ix = -1*range;ix <= range;ix++){
		for(var iy = -1*range;iy <= range;iy++){
			for(iz = 0;iz < leavesHeight;iz++){
				if(!((Math.abs(iy) == range) && (Math.abs(ix) == range) && (iz == (leavesHeight - 3))))
				this.setBlock(x + ix, y + iy, z + iz + trunkHeight, BLOCK.OAK_LEAVES);

				if(!(iz == (leavesHeight - 1)))
				this.setBlock(x + ix, y + iy, z + iz + trunkHeight, BLOCK.OAK_LEAVES);
			}
		}
	}
};

// createFlatWorld()
//
// Sets up the world so that the bottom half is filled with dirt
// and the top half with air.

World.prototype.createFlatWorld = function( height )
{
	this.spawnPoint = new Vector( 0.5, 0.5, height );

	for ( var x = 0; x < this.sx; x++ )
		for ( var y = 0; y < this.sy; y++ )
			for ( var z = 0; z < this.sz; z++ )
				this.blocks[x][y][z] = z < height ? BLOCK.GRASS_DIRT : BLOCK.AIR;

    this.ground_height = height;
}

// createRandomWorld()
// Sets up the world with random hills and valleys 


World.prototype.createRandomWorld = function( height )
{

	var perlin = new PerlinNoise();
	this.spawnPoint = new Vector( ~~(this.sx / 2), ~~(this.sy / 2), height );

	var frequencyScale = 25;
	
	for ( var x = 0; x < this.sx; x++ )
		for ( var y = 0; y < this.sy; y++ )
			for ( var z = 0; z < this.sz; z++ ) {
				//var zz = z/this.sz

				var noiseVal = perlin.noise(x/frequencyScale,y/frequencyScale,z/frequencyScale);
				var tolerance = -2.25 + ((z/this.sz)*4.25);

				this.blocks[x][y][z] = (noiseVal > tolerance || z < height) ?  BLOCK.GRASS_DIRT : BLOCK.AIR;

				if (x == this.spawnPoint.x && y == this.spawnPoint.y) {
					if (this.blocks[x][y][z] === BLOCK.GRASS_DIRT && z>this.spawnPoint.z) {
						this.spawnPoint.z = z+1;
					}
				}

			}


	this.spawnPoint.x += .5;
	this.spawnPoint.y += .5;

	
}


World.prototype.createSchematic = function (path, is_url, callback) {
    var world = this;
    var set_schematic = function (array) {
        var Z = array.shape[0];
        var X = array.shape[1];
        var Y = array.shape[2];
        var D = array.shape[3];
        if (D != 2) {
            throw "Array last dimension error!";
        }
        // put the schematic starting at (this.sx / 2 - X / 2, this.sy / 2 - Y / 2, this.ground_height)
        var x_offset = Math.floor(world.sx / 2 - X / 2);
        var y_offset = Math.floor(world.sy / 2 - Y / 2);
        var z_offset = world.ground_height;
        for (var x = 0; x < X; x ++)
            for (var y = 0; y < Y; y ++)
                for (var z = 0; z < Z; z ++) {
                    var idx = (z * (X * Y) + x * Y + y) * D;
                    world.blocks[x + x_offset][y + y_offset][z + z_offset] =
                        BLOCK.fromId(array.data[idx]);
                }
        // callback after loading finishes
        if (callback != null) {
            callback();
        }
    };

    var npy_loader = NumpyLoader();
    if (is_url) {
        npy_loader.ajax(path, set_schematic);
    } else {
        npy_loader.open(path, set_schematic);
    }

    // (x,y,z) in WebCraft -> (z,x,y) in NPY -> (y,z,x) standard
}

// createFromString( str )
//
// Creates a world from a string representation.
// This is the opposite of toNetworkString().
//
// NOTE: The world must have already been created
// with the appropriate size!

World.prototype.createFromString = function( str )
{
	var i = 0;

	for ( var x = 0; x < this.sx; x++ ) {
		for ( var y = 0; y < this.sy; y++ ) {
			for ( var z = 0; z < this.sz; z++ ) {
				this.blocks[x][y][z] = BLOCK.fromId( str.charCodeAt( i ) - 97 );
				i = i + 1;
			}
		}
	}
}

// getBlock( x, y, z )
//
// Get the type of the block at the specified position.
// Mostly for neatness, since accessing the array
// directly is easier and faster.

World.prototype.getBlock = function( x, y, z )
{
	if ( x < 0 || y < 0 || z < 0 || x > this.sx - 1 || y > this.sy - 1 || z > this.sz - 1 ) return BLOCK.AIR;
	return this.blocks[x][y][z];
}

// setBlock( x, y, z )

World.prototype.setBlock = function( x, y, z, type )
{
	this.blocks[x][y][z] = type;
	if ( this.renderer != null ) this.renderer.onBlockChanged( x, y, z );
}

// toNetworkString()
//
// Returns a string representation of this world.

World.prototype.toNetworkString = function()
{
	var blockArray = [];

	for ( var x = 0; x < this.sx; x++ )
		for ( var y = 0; y < this.sy; y++ )
			for ( var z = 0; z < this.sz; z++ )
				blockArray.push( String.fromCharCode( 97 + this.blocks[x][y][z].id ) );

	return blockArray.join( "" );
}

// Export to node.js
if ( typeof( exports ) != "undefined" )
{
	// loadFromFile( filename )
	//
	// Load a world from a file previously saved witc h saveToFile().
	// The world must have already been allocated with the
	// appropriate dimensions.

	World.prototype.loadFromFile = function( filename )
	{
		var fs = require( "fs" );
		try {
			fs.lstatSync( filename );
			var data = fs.readFileSync( filename, "utf8" ).split( "," );
			this.createFromString( data[3] );
			this.spawnPoint = new Vector( parseInt( data[0] ), parseInt( data[1] ), parseInt( data[2] ) );
			return true;
		} catch ( e ) {
			return false;
		}
	}

	// saveToFile( filename )
	//
	// Saves a world and the spawn point to a file.
	// The world can be loaded from it afterwards with loadFromFile().

	World.prototype.saveToFile = function( filename )
	{
		var data = this.spawnPoint.x + "," + this.spawnPoint.y + "," + this.spawnPoint.z + "," + this.toNetworkString();
		require( "fs" ).writeFileSync( filename, data );
	}
    
    
    
    
    World.prototype.getString = function()
	{
		var data = this.spawnPoint.x + "," + this.spawnPoint.y + "," + this.spawnPoint.z + "," + this.toNetworkString();
            
        return data.toString;
	}

	exports.World = World;
}
