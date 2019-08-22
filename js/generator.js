
function generate(mapSize, roughness, smoothAmount, smoothAmt){
	var map;
	map = generateMapTerrain(mapSize, roughness);
	for(var i = 0; i < smoothAmount; i++){
	  map = smooth(map, mapSize,smoothAmt);
	}
  
	function round(n)
	{
	  if (n-(parseInt(n, 10)) >= 0.5){
	    return parseInt(n, 10)+1;
	  }else{
	    return parseInt(n, 10);
	  }
	}

	function smooth(data, size, amt) {
	    /* Rows, left to right */
	    for (var x = 1; x < size; x++){
		for (var z = 0; z < size; z++){
		    data[x][z] = data[x - 1][z] * (1 - amt) + data[x][z] * amt;
		}
	    }

	    /* Rows, right to left*/
	    for (x = size - 2; x < -1; x--){
		for (z = 0; z < size; z++){
		    data[x][z] = data[x + 1][z] * (1 - amt) + data[x][z] * amt;
		}
	    }

	    /* Columns, bottom to top */
	    for (x = 0; x < size; x++){
		for (z = 1; z < size; z++){
		    data[x][z] = data[x][z - 1] * (1 - amt) + data[x][z] * amt;
		}
	    }

	    /* Columns, top to bottom */
	    for (x = 0; x < size; x++){
		for (z = size; z < -1; z--){
		    data[x][z] = data[x][z + 1] * (1 - amt) + data[x][z] * amt;
		}
	    }
	      
	    return data;
	  }

  return map;
};





function generateMapTerrain(mapSize, roughness) {
    var map = create2DArray(mapSize+1);
    startDisplacement(map, mapSize);
    return map;

    function create2DArray(d1) {
        var x = new Array(d1),
        i = 0,
        j = 0;

        for (i = 0; i < d1; i += 1) {
            x[i] = new Array(d1);
        }

        for (i=0; i < d1; i += 1) {
            for (j = 0; j < d1; j += 1) {
                x[i][j] = 0;
            }
        }

        return x;
    }

    // Starts off the map generation, seeds the first 4 corners
    function startDisplacement(map,mapSize){
        var tr, tl, t, br, bl, b, r, l, center;

        // top left
        map[0][0] = Math.random(1.0);
        tl = map[0][0];

        // bottom left
        map[0][mapSize] = Math.random(1.0);
        bl = map[0][mapSize];

        // top right
        map[mapSize][0] = Math.random(1.0);
        tr = map[mapSize][0];

        // bottom right
        map[mapSize][mapSize] = Math.random(1.0);
        br = map[mapSize][mapSize];

        // Center
        map[mapSize/2][mapSize/2] = map[0][0] + map[0][mapSize] + map[mapSize][0] + map[mapSize][mapSize] / 4;
        map[mapSize/2][mapSize/2] = normalize(map[mapSize/2][mapSize/2]);
        center = map[mapSize/2][mapSize/2];

        /* Non wrapping terrain */
        map[mapSize/2][mapSize] = bl + br + center / 3;
        map[mapSize/2][0] = tl + tr + center / 3;
        map[mapSize][mapSize/2] = tr + br + center / 3;
        map[0][mapSize/2] = tl + bl + center / 3;

        // Call displacment
        midpointDisplacment(mapSize);
    }

    // Workhorse of the terrain generation.
    function midpointDisplacment(mSize){
        var newSize = mSize/2,
            top, topRight, topLeft, bottom, bottomLeft, bottomRight, right, left, center,
            x = 0, y = 0,
            i = 0, j = 0;

        if (newSize > 1 && newSize > 1){
            for(i = newSize; i <= mapSize; i += newSize){
                for(j = newSize; j <= mapSize; j += newSize){
                    x = i - (newSize / 2);
                    y = j - (newSize / 2);

                    topLeft = map[i - newSize][j - newSize];
                    topRight = map[i][j - newSize];
                    bottomLeft = map[i - newSize][j];
                    bottomRight = map[i][j];

                    // Center
                    map[x][y] = (topLeft + topRight + bottomLeft + bottomRight) / 4 + displace(mSize); ///tu
                    map[x][y] = normalize(map[x][y]);
                    //console.log(normalize(map[x][y]));
                    center = map[x][y];

                    // Top
                    if(j - (newSize * 2) + (newSize / 2) > 0){
                        map[x][j - newSize] = (topLeft + topRight + center + map[x][j - mSize + (newSize/2)]) / 4 + displace(mSize);
                    }else{
                        map[x][j - newSize] = (topLeft + topRight + center) / 3+ displace(mSize);
                    }

                    map[x][j - newSize] = normalize(map[x][j - newSize]);
                   // console.log(normalize(map[x][j - newSize]));
                    // Bottom
                    if(j + (newSize / 2) < mapSize){
                        map[x][j] = (bottomLeft + bottomRight + center + map[x][j + (newSize/2)]) / 4+ displace(mSize);
                    }else{
                        map[x][j] = (bottomLeft + bottomRight + center) / 3+ displace(mSize);
                    }

                    map[x][j] = normalize(map[x][j]);
                    //console.log(normalize(map[x][j]));

                    //Right
                    if(i + (newSize / 2) < mapSize){
                        map[i][y] = (topRight + bottomRight + center + map[i + (newSize/2)][y]) / 4+ displace(mSize);
                    }else{
                        map[i][y] = (topRight + bottomRight + center) / 3+ displace(mSize);
                    }

                    map[i][y] = normalize(map[i][y]);

                    // Left
                    if(i - (newSize * 2) + (newSize / 2) > 0){
                        map[i - newSize][y] = (topLeft + bottomLeft + center + map[i - mSize + (newSize/2)][y]) / 4 + displace(mSize);
                    }else{
                        map[i - newSize][y] = (topLeft + bottomLeft + center) / 3+ displace(mSize);
                    }

                    map[i - newSize][y] = normalize(map[i - newSize][y]);
                }
            }
            midpointDisplacment(newSize);
        }
    }

    function displace(num){
        var max = num / (mapSize + mapSize) * roughness;
        return (Math.random(1.0)- 0.5) * max;
    }

    function normalize(value){
        if(value > 1)
            value = 1;
        else if(value < 0)
            value = 0;
        return value;
    }

};








