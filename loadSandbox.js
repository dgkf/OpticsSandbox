$(document).ready(function() {
  var sandboxDiv = $(".opticsSandbox");

  // create canvas element within .opticsSandbox
  var c = document.createElement("canvas");
  c.setAttribute("tabindex", 1)
  c.setAttribute("class", "opticsSandbox-canvas")
	sandboxDiv.append(c);
	var ctx = c.getContext("2d");

  // resize canvas if the window is resized to fit the size of the parent container
  function resizeCanvas() {
  	ctx.canvas.width  = ctx.canvas.parentNode.offsetWidth;
  	ctx.canvas.height = ctx.canvas.parentNode.offsetHeight;
  }

  window.onresize = function(event) { resizeCanvas(); }
  resizeCanvas();

	// create and begin our model
	var lm = new opticsModel(c, ctx);

  // append properties panel .html overlays
  var propertiesDiv = document.createElement("div")
  propertiesDiv.setAttribute("class", "opticsSandbox-Panels");
  sandboxDiv.append(propertiesDiv);
  $(".opticsSandbox-Panels").load("assets/Panels.html");

  var watermarkDiv = document.createElement("div")
  watermarkDiv.setAttribute("class", "opticsSandbox-Watermark");
  sandboxDiv.append(watermarkDiv);
  $(".opticsSandbox-Watermark").load("assets/Watermark.html");
});
