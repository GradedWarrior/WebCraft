
var containerPath = "resource_packs/default/textures/gui/container";

function setupGUI() {
  document.getElementById("gui-overlay").style.display = "block";
  document.exitPointerLock();
}




BLOCK.CRAFTING_TABLE.onAction = function() { 
	setupGUI();
	document.getElementById("gui-content").innerHTML = '<img class="gui" src="' + containerPath +'/crafting_table.png" width="400"/>';
	player.onGui = true;
}