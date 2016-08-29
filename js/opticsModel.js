function opticsModel(canvas, context) {
  var vp = new Viewport(context);
	var om = new objectManager(context);
  var mh = new mouseHandler(context, om, vp);
  var kh = new keyHandler(context, om, mh);
  vp.addToScene(new grid(context))
  vp.addToScene(om);
  vp.addToScene(mh);
	this.fps = 60;

	this.init = function() {
		om.add(new OpticalElement(context, {x: 0, y: 0, h: 200, w: 5, c1:{dx:-30}, c2:{dx:30}}));
		om.add(new ls(context, om, {x: 250, y: 0, raycolor: 'rgba(236, 236, 64, 0.8)', rays: 36, type:'spot'}));
		//om.add(new img(ctx, om));
		//om.add(new img(ctx, om, {src: 'assets/opera.gif'}));
		//om.add(new le(ctx, {x: 100, y: 300, h: 200, w: 10, c1:{dx:-10}, c2:{dx:10}}));
	};

	update = function() { om.update(); };
	draw = function() {	vp.renderScene(); /*context.clearRect(0, 0, context.canvas.width, context.canvas.height); om.draw();*/ };

	this.run = function() {	update(); draw();	};
	this.stop = function () { clearInterval(this._intervalID); };

	this.init();
	this._intervalID = setInterval(this.run, 1000/this.fps);
}

// CALLBACKS
function showPropertiesPanelForObject(obj) {
  // make panel visible
  $("#opticsSandbox-"+obj.constructor.name+"Panel").addClass("visible");

  // tie properties panel to object variables
  var panel_id, input_class;
  for (key in Object.keys(obj)) {
    var key_name = Object.keys(obj)[key];
    panel_id = ["#opticsSandbox-", obj.constructor.name, "Panel"].join("");
    input_class = ["input.opticsSandbox", obj.constructor.name, key_name].join(".");

    // remove pre-existing callbacks tied to property updates in this field
    $([panel_id, input_class].join(" ")).off("input change");

    // load value from selected object for displaying
    $([panel_id, input_class].join(" ")).val(obj[Object.keys(obj)[key]]);

    // associate callback to edit object property on field updates
    $([panel_id, input_class].join(" ")).on("input change", function (event) {
      console.log(obj.constructor.name, ".", event.target.className.match(/[^ ]+$/mg)[0], ": ", obj[event.target.className.match(/[^ ]+$/mg)[0]]);

      // update other fields which redirect to the same variable
      $('.'+event.target.className.split(' ').join('.')).val(event.target.value);
      // strip the variable name from the input element's class and use it to update the selected object
      obj[event.target.className.match(/[^ ]+$/mg)[0]] = event.target.value;
    });
  }
}
function hidePropertiesPanels() {
  $(".opticsSandbox-propertiesPanel").removeClass("visible");
}

// OBJECTS
function objectManager(context, properties) { 		// object manager
	this.env = {refidx: 1.0};
  this.objs = {};

	this.containsType = function(type) {
		return this.objs.hasOwnProperty(type);
	};

	this.add = function(obj) {
		if (!this.containsType(obj.constructor.name)) {	this.objs[obj.constructor.name] = []; }
		this.objs[obj.constructor.name].push(obj);
	};

	this.getType = function(type) {
		return this.objs[type];
	};

	this.get = function(type, idx) {
		return (this.objs[type])[idx];
	};

	this.update = function () {
		for (var obj_type in this.objs)
			for (var obj_idx = 0; obj_idx < this.objs[obj_type].length; obj_idx++)
				if (this.objs[obj_type][obj_idx].update) this.objs[obj_type][obj_idx].update();
	};

	this.draw = function() {
		for (var i in this.objs) this.objs[i].map(function(item) { item.draw(); });
    for (var i in this.objs) this.objs[i].map(function(item) { item.drawHandles(); });
	};
}
function keyHandler(context, om, mh) {       // keyboard manager
  var handleKeyDown = function(event) {
    switch (event.code) {
      case "KeyE":
        om.add(new OpticalElement(context, {x: mh.posWorld.x, y: mh.posWorld.y, h: 500, w: 1, c1:{dx:-80}, c2:{dx:80}}));
        break;
      case "KeyS":
        om.add(new ls(context, om, {x: mh.posWorld.x, y: mh.posWorld.y, raycolor: 'rgba(236, 236, 64, 0.5)', rays: 12}));
        break;
      case "Delete":
        delete mh.selectedHandles.parent;
        break;
      case "KeyH":
        $(".opticsSandbox-helpPanel").addClass("visible");
        break;
    }
  };

  var handleKeyUp = function(event) {
    switch (event.code) {
    case "KeyH":
      $(".opticsSandbox-helpPanel").removeClass("visible");
      break;
    }
  };

	console.log('adding key listener');
	context.canvas.addEventListener("keydown", handleKeyDown, false);
  context.canvas.addEventListener("keyup", handleKeyUp, false);
}
function mouseHandler(context, om, vp) {				    // mouse manager
	var selectedHandles = [];

	var lastMouseLeftDownWorld = {x:0, y:0}; this.lastMouseLeftDownWorld = lastMouseLeftDownWorld;
	var lastMouseLeftUpWorld = {x:0, y:0}; this.lastMouseLeftUpWorld = lastMouseLeftUpWorld;
  var lastMouseMiddleDownWorld = {x:0, y:0}; this.lastMouseMiddleDownWorld = lastMouseMiddleDownWorld;
  var lastMouseMiddleUpWorld = {x:0, y:0}; this.lastMouseMiddleUpWorld = lastMouseMiddleUpWorld;
	var lastMove = {x:0, y:0}; this.lastMove = lastMove;
	var leftMouseDown = false; this.leftMouseDown = leftMouseDown;
  var middleMouseDown = false; this.middleMouseDown = middleMouseDown;
	var pos = {x:0, y:0}; this.pos = pos;
  var posWorld = {x:0, y:0}; this.posWorld = posWorld;

  function setSelection(handles) {
    clearSelection();
    if (handles.constructor.name == 'mouseHandle') { handles.active = true; selectedHandles.push(handles);
    } else for (var h in handles) { handles[h].active = true; selectedHandles.push(handles[h]); }

    if (selectedHandles.length == 1) {
      showPropertiesPanelForObject(selectedHandles[0].parentObject)
    }
    return true;
  };
  function addToSelection(handles) {
    if (handles.constructor.name == 'mouseHandle') { handles.active = true; selectedHandles.push(handles); }
    else for (var h in handles) { h.active = true; selectedHandles.push(handles[h]); }
    return true;
  };
  function clearSelection() {
    for (var h in selectedHandles) selectedHandles[h].active = false;
    selectedHandles = [];

    hidePropertiesPanels();
    return true;
  };

	this.handleMouseDown = function(event) {
    world_point = vp.transform.untransformPoint(event.clientX, event.clientY);

    switch(event.button) {
      case 0:
        // upkeep
        lastMouseLeftDownWorld.x = world_point[0];
        lastMouseLeftDownWorld.y = world_point[1];
        leftMouseDown = true;

        // object manager interaction
        object_interactions_handled = false;
        // allow selection of a child handles within an object
  			for (var h = 0; h < selectedHandles.length; h++)
  				for (var hph = selectedHandles[h].parentObject.mouseHandles.length-1; hph >= 1 ; hph--)
  					if (selectedHandles[h].parentObject.mouseHandles[hph].pointWithin(world_point[0], world_point[1])) {
              setSelection(selectedHandles[h].parentObject.mouseHandles[hph]);
              object_interactions_handled = true;
  					}

        // retain all objects selected if a parent object is being moved as part of a group
        if (!object_interactions_handled) {
    			var keep_selection = false;
    			for (var h = 0; h < selectedHandles.length; h++)
    				if (selectedHandles[h].pointWithin(world_point[0], world_point[1])) {
              keep_selection = true;
              object_interactions_handled = true;
            }
    			if (!keep_selection) clearSelection();
        }

        // selection of a new object
        if (!object_interactions_handled)
      		for (var obj_type in om.objs)
      			for (var obj_idx = 0; obj_idx < om.objs[obj_type].length; obj_idx++)
      				if (!!om.objs[obj_type][obj_idx].pointWithin &&
                  om.objs[obj_type][obj_idx].pointWithin(world_point[0], world_point[1])) {
      					setSelection(om.objs[obj_type][obj_idx].mouseHandles[0]);
                object_interactions_handled = true;
      				}
        break;
      case 1:
        // upkeep
        lastMouseMiddleDownWorld.x = world_point[0];
        lastMouseMiddleDownWorld.y = world_point[1];
        middleMouseDown = true;
        event.target.style.cursor = 'move';
        break;
    }
  };
	this.handleMouseUp = function(event) {
    world_point = vp.transform.untransformPoint(event.clientX, event.clientY);

    // left mouse up
    switch(event.button) {
      case 0:
        // upkeep
        lastMouseLeftUpWorld.x = world_point[0];
        lastMouseLeftUpWorld.y = world_point[1];
        leftMouseDown = false;

        // object interaction
        if (selectedHandles.length === 0) {
          var newSelectionHandles = [];
          for (var obj_type in om.objs)
            for (var obj_idx = 0; obj_idx < om.objs[obj_type].length; obj_idx++)
              if (!!om.objs[obj_type][obj_idx].mouseHandles &&
                  om.objs[obj_type][obj_idx].mouseHandles[0].x >= Math.min(lastMouseLeftDownWorld.x, posWorld.x) &&
                  om.objs[obj_type][obj_idx].mouseHandles[0].x <= Math.max(lastMouseLeftDownWorld.x, posWorld.x) &&
                  om.objs[obj_type][obj_idx].mouseHandles[0].y >= Math.min(lastMouseLeftDownWorld.y, posWorld.y) &&
                  om.objs[obj_type][obj_idx].mouseHandles[0].y <= Math.max(lastMouseLeftDownWorld.y, posWorld.y)) {

                newSelectionHandles.push(om.objs[obj_type][obj_idx].mouseHandles[0]);
              }

          if (newSelectionHandles.length > 0) {
            setSelection(newSelectionHandles);
          } else
            clearSelection();
        }

        break;
      case 1:
        // upkeep
        lastMouseMiddleUpWorld.x = world_point[0];
        lastMouseMiddleUpWorld.y = world_point[1];
        middleMouseDown = false;
        event.target.style.cursor = 'auto';
        break;
    }
  };
	this.handleMouseMove = function(event) {
    // upkeep
    lastMove.x = pos.x;
    pos.x = event.clientX;
    lastMove.y = pos.y;
    pos.y = event.clientY;

    pos_world = vp.transform.untransformPoint(pos.x, pos.y);
    posWorld.x = pos_world[0];
    posWorld.y = pos_world[1];

    // object interaction
    if (selectedHandles.length > 0 && leftMouseDown)
      for (var h = 0; h < selectedHandles.length; h++) {
        lastMove_world = vp.transform.untransformPoint(lastMove.x, lastMove.y);
        selectedHandles[h].offset(pos_world[0] - lastMove_world[0], pos_world[1] - lastMove_world[1]);
      }

    // viewport interaction
    if (middleMouseDown) {
      event.target.style.cursor = 'move';
      vp.offsetScreenSpace(pos.x - lastMove.x, pos.y - lastMove.y);
    }
  };
  this.handleMouseWheel = function(event) {
    vp.applyZoom(Math.pow(1.1, -event.deltaY * 0.01));
  }

	this.draw = function(transform) {
		if (leftMouseDown && selectedHandles.length <= 0) {
			this.drawSelectionBox();
		}
	};
	this.drawSelectionBox = function(transform) {
		context.fillStyle = 'rgba(100, 128, 255, 0.2)';
		context.beginPath();
		context.rect(lastMouseLeftDownWorld.x, lastMouseLeftDownWorld.y,
                 this.posWorld.x - lastMouseLeftDownWorld.x, this.posWorld.y - lastMouseLeftDownWorld.y);
		context.fill();
	};

  console.log('adding mouse listener');
	context.canvas.addEventListener("mousedown", this.handleMouseDown, false);
	context.canvas.addEventListener("mouseup", this.handleMouseUp, false);
	context.canvas.addEventListener("mousemove", this.handleMouseMove, false);
  context.canvas.addEventListener("mousewheel", this.handleMouseWheel, false);
}
function mouseHandle(in_context, in_parent, properties) { 	// mouse handle
	var ctx = in_context;
	this.parentObject = in_parent;
	this.x = properties && !(properties.x === undefined) ? properties.x : 0;
	this.y = properties && !(properties.y === undefined) ? properties.y : 0;
	this.r = properties && !(properties.r === undefined) ? properties.r : 6;
	this.ang = properties && !(properties.ang === undefined) ? properties.ang : 0;
	this.fillColor = properties && !(properties.fillColor === undefined) ? properties.fillColor : '#EEEEEE';
	this.fixHori = properties && !(properties.fixHori === undefined) ? properties.fixHori : false;
	this.fixVert = properties && !(properties.fixVert === undefined) ? properties.fixVert : false;
	this.fixAng = properties && !(properties.fixAng === undefined) ? properties.fixAng : null;
	this.active = properties && !(properties.active === undefined) ? properties.active : false;
	this.visible = properties && !(properties.visible === undefined) ? properties.visible : true;
	this.useParentCollision = properties && !(properties.useParentCollision === undefined) ? properties.useParentCollision : false;
	this.inheritFix = properties && !(properties.inheritFix === undefined) ? properties.inheritFix : false;
	this.children = [];

	this.pointWithin = function(in_x, in_y) {
		if (this.useParentCollision)
			return this.parentObject.pointWithin(in_x, in_y);
		else
			return Math.pow(this.x-in_x,2)+Math.pow(this.y-in_y,2) < Math.pow(this.r,2);
	};

	this.moveTo = function(new_x, new_y, obeyFix) {
		for (var c = 0; c < this.children.length; c++) this.children[c].offset(new_x-this.x, new_y-this.y, this.children[c].inheritFix);

		if (obeyFix !== null && !obeyFix) {
			this.x = new_x; this.y = new_y;
		} else if (this.fixAng !== null) {
			var b = (new_x < this.x ? Math.PI : 0) + Math.atan(new_y-this.y/new_x-this.x);
			var d = Math.sqrt(Math.pow(new_x-this.x,2)+Math.pow(new_y-this.y,2));
			this.x = this.x + d * Math.cos(b-this.fixAng)*Math.cos(this.fixAng);
			this.y = this.y + d * Math.cos(b-this.fixAng)*Math.sin(this.fixAng);
		} else {
			if (!this.fixVert) this.x = new_x;
			if (!this.fixHori) this.y = new_y;
		}
	};

	this.rotateTo = function(new_ang, about_x, about_y, obeyFix) {
		if (this.children.length > 0)
      for (var c = 0; c < this.children.length; c++)
        this.children[c].rotateTo(new_ang, about_x, about_y, this.children[c].inheritFix);

		this.ang = new_ang;
		if (this.x != about_x || this.y != about_y) {
			var d = Math.sqrt(Math.pow(this.x-about_x, 2)+Math.pow(this.y-about_y,2));
			this.x = about_x + d * Math.cos(this.ang);
			this.y = about_y + d * Math.sin(this.ang);
		}
	};

	this.offset = function(offset_x, offset_y, obeyFix) {
		if (this.children.length > 0)
      for (var c = 0; c < this.children.length; c++)
        this.children[c].offset(offset_x, offset_y, this.children[c].inheritFix);

		if (obeyFix !== null && !obeyFix) {
			this.x = this.x + offset_x; this.y = this.y + offset_y;
	  } else if (this.fixAng !== null) {
			var b = (offset_x < 0 ? Math.PI : 0) + Math.atan(offset_y/offset_x);
			var d = Math.sqrt(Math.pow(offset_x,2)+Math.pow(offset_y,2));
			this.x = this.x + d * Math.cos(b-this.fixAng)*Math.cos(this.fixAng);
			this.y = this.y + d * Math.cos(b-this.fixAng)*Math.sin(this.fixAng);
		} else {
				if (!this.fixVert) this.x = this.x + offset_x;
				if (!this.fixHori) this.y = this.y + offset_y;
		}
	};

	this.fix = function(in_fixHori, in_fixVert) {
		this.fixHori = in_fixHori;
		this.fixVert = in_fixVert;
	};

	this.draw = function() {
		if ((this.active || this.parentObject.mouseHandles[0].active) && this.visible) {
			ctx.beginPath();
			ctx.fillStyle = this.fillColor;
			ctx.strokeStyle = '#444444';
			ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.stroke();
		}
	};

	this.addChild = function(mouseHandleChild) {
		this.children.push(mouseHandleChild);
	};
}
function Viewport(context, properties) {
  this.x = properties && !(properties.x === undefined) ? properties.x : context.canvas.width * 0.5;
  this.y = properties && !(properties.y === undefined) ? properties.y : context.canvas.height * 0.5;
  this.zoom = properties && !(properties.zoom === undefined) ? properties.zoom : 1.0;
  this.transform = new Transform();
  this.clearStyle = properties && !(properties.clearStyle === undefined) ? properties.clearStyle : null;
  this.scene = [];

  this.addToScene = function(obj) {
    this.scene.push(obj);
  };

  this.offset = function(offset_x, offset_y) {
    this.x += offset_x;
    this.y += offset_y;
    this.updateTransformation(context);
  };

  this.applyZoom = function(zoom) {
    this.zoom *= zoom;
    this.updateTransformation(context);
  };

  this.offsetScreenSpace = function(offset_x, offset_y) {
    this.offset(offset_x / this.zoom, offset_y / this.zoom);
  };

  this.renderScene = function() {
    // draw background with no transformation
    context.resetTransform();
    if (!this.clearStyle) {
      var defaultClearStyle = context.createRadialGradient(context.canvas.width / 2.0, context.canvas.height / 2.0, 0,
                                                           context.canvas.width / 2.0, context.canvas.height / 2.0, Math.max(context.canvas.width, context.canvas.height));
      defaultClearStyle.addColorStop(0, "rgb(64,64,64)");
      defaultClearStyle.addColorStop(1, "rgb(0,0,0)");
      context.fillStyle = defaultClearStyle;
    } else { context.fillStyle = this.clearColor; }
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    context.transform(this.transform.m[0], this.transform.m[1], this.transform.m[2],
                      this.transform.m[3], this.transform.m[4], this.transform.m[5]);
    for (obj in this.scene) this.scene[obj].draw(this.transform);
  };

  this.updateTransformation(context);
}
Viewport.prototype.updateTransformation = function(context) {
  this.transform.reset();
  this.transform.translate(context.canvas.width*0.5, context.canvas.height*0.5);
  this.transform.scale(this.zoom, this.zoom);
  this.transform.translate(-context.canvas.width*0.5, -context.canvas.height*0.5);
  this.transform.translate(this.x, this.y);
}

function grid(context, properties) {
  this.majorIncrement = 250;
  this.minorIncrement = 50;
  this.majorColor = 'rgba(200,200,200,0.3)';
  this.minorColor = 'rgba(200,200,200,0.1)';

  this.draw = function(transform) {
    vp_min_xy = transform.untransformPoint(0, 0);
    vp_max_xy = transform.untransformPoint(context.canvas.width, context.canvas.height);

    // draw major lines
    context.strokeStyle = this.majorColor;
    // vertical
    for (var x = Math.floor(vp_min_xy[0] / this.majorIncrement); x <= Math.ceil(vp_max_xy[0] / this.majorIncrement); x++) {
      context.beginPath();
      context.moveTo(x * this.majorIncrement, vp_min_xy[1]);
      context.lineTo(x * this.majorIncrement, vp_max_xy[1]);
      context.stroke();
    }
    // horizontal
    for (var y = Math.floor(vp_min_xy[1] / this.majorIncrement); y <= Math.ceil(vp_max_xy[1] / this.majorIncrement); y++) {
      context.beginPath();
      context.moveTo(vp_min_xy[0], y * this.majorIncrement);
      context.lineTo(vp_max_xy[0], y * this.majorIncrement);
      context.stroke();
    }

    // draw minor lines
    context.strokeStyle = this.minorColor;
    // vertical
    for (var x = Math.floor(vp_min_xy[0] / this.minorIncrement); x <= Math.ceil(vp_max_xy[0] / this.minorIncrement); x++) {
      context.beginPath();
      context.moveTo(x * this.minorIncrement, vp_min_xy[1]);
      context.lineTo(x * this.minorIncrement, vp_max_xy[1]);
      context.stroke();
    }
    // horizontal
    for (var y = Math.floor(vp_min_xy[1] / this.minorIncrement); y <= Math.ceil(vp_max_xy[1] / this.minorIncrement); y++) {
      context.beginPath();
      context.moveTo(vp_min_xy[0], y * this.minorIncrement);
      context.lineTo(vp_max_xy[0], y * this.minorIncrement);
      context.stroke();
    }

    // draw x, y
    context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    context.beginPath();
    context.moveTo(vp_min_xy[0], 0);
    context.lineTo(vp_max_xy[0], 0);
    context.stroke();

    context.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    context.beginPath();
    context.moveTo(0, vp_min_xy[1]);
    context.lineTo(0, vp_max_xy[1]);
    context.stroke();
  };
}

function OpticalElement(context, properties) {
  // initialization
  this.context = context;
	this.x = properties && !(properties.x === undefined) ? properties.x : 0;
	this.y = properties && !(properties.y === undefined) ? properties.y : 0;
	this.h = properties && !(properties.h === undefined) ? properties.h : 100;
	this.w = properties && !(properties.w === undefined) ? properties.w : 10;
	this.c1 = {dx: properties && !(properties.c1.dx === undefined) ? properties.c1.dx : -20};
	this.c2 = {dx: properties && !(properties.c2.dx === undefined) ? properties.c2.dx : 20};
	this.refidx = properties && !(properties.refidx === undefined) ? properties.refidx : 2.15;
	this.mouseHandles = [];

	this.initMouseHandles = function() {
		this.mouseHandles = [];
		this.mouseHandles.push(new mouseHandle(context, this, {useParentCollision: true}));
		this.mouseHandles.push(new mouseHandle(context, this));
		this.mouseHandles.push(new mouseHandle(context, this));
		this.mouseHandles.push(new mouseHandle(context, this));

		this.mouseHandles[0].moveTo(this.x, this.y);
		this.mouseHandles[1].moveTo(this.x+this.w/2, this.y-this.h/2);
		this.mouseHandles[2].moveTo(this.x-this.w/2+this.c1.dx, this.y);
		this.mouseHandles[2].fix(true, false);
		this.mouseHandles[3].moveTo(this.x+this.w/2+this.c2.dx, this.y);
		this.mouseHandles[3].fix(true, false);

		this.mouseHandles[0].addChild(this.mouseHandles[1]);
		this.mouseHandles[0].addChild(this.mouseHandles[2]);
		this.mouseHandles[0].addChild(this.mouseHandles[3]);
		this.mouseHandles[0].visible = false;
	};

	this.initMouseHandles();
}
OpticalElement.prototype.update = function () {
  // update geometry from mouse handle positions
  this.x = this.mouseHandles[0].x;
  this.y = this.mouseHandles[0].y;
  this.w = (this.mouseHandles[1].x-this.mouseHandles[0].x)*2;
  this.h = (this.mouseHandles[0].y-this.mouseHandles[1].y)*2;
  this.c1.dx = this.mouseHandles[2].x-2*this.mouseHandles[0].x+this.mouseHandles[1].x;
  this.mouseHandles[2].y = this.mouseHandles[0].y;
  this.c2.dx = this.mouseHandles[3].x-this.mouseHandles[1].x;
  this.mouseHandles[3].y = this.mouseHandles[0].y;

  // update additional circle parameters from 'dx' handle
  this.updateCircleGeometry();
}
OpticalElement.prototype.updateCircleGeometry = function () {
  this.c1.x  = this.x-this.w/2+this.c1.dx/2-Math.pow(this.h, 2)/this.c1.dx*0.125;
  this.c1.y  = this.y;
  this.c1.r  = Math.abs(this.x-this.w/2+this.c1.dx-this.c1.x);
  this.c1.a1 = (this.c1.dx < 0 ? Math.PI : 0) - Math.atan(-(this.h/2)/((this.x-this.w/2)-this.c1.x));
  this.c1.a2 = (this.c1.dx < 0 ? Math.PI : 0) - Math.atan((this.h/2)/((this.x-this.w/2)-this.c1.x));

  this.c2.x  = this.x+this.w/2+this.c2.dx/2-Math.pow(this.h, 2)/this.c2.dx*0.125;
  this.c2.y  = this.y;
  this.c2.r  = Math.abs(this.x+this.w/2+this.c2.dx-this.c2.x);
  this.c2.a1 = (this.c2.dx < 0 ? Math.PI : 0) - Math.atan((this.h/2)/((this.x+this.w/2)-this.c2.x));
  this.c2.a2 = (this.c2.dx < 0 ? Math.PI : 0) - Math.atan(-(this.h/2)/((this.x+this.w/2)-this.c2.x));
};
OpticalElement.prototype.draw = function () {
  this.context.lineWidth=0.5;
  this.context.fillStyle='rgba(128, 164, 255, 0.6)';

  this.context.beginPath();
  this.context.arc(this.c2.x, this.c2.y, this.c2.r,
    this.c2.a1,
    this.c2.a2,
    this.c2.dx < 0);
  this.context.arc(this.c1.x, this.c1.y, this.c1.r,
    this.c1.a1,
    this.c1.a2,
    this.c1.dx > 0);
  this.context.lineTo(this.x+this.w/2, this.y-this.h/2);
  this.context.fill();
}
OpticalElement.prototype.drawHandles = function() {
  for (var i = 0; i < this.mouseHandles.length; i++) this.mouseHandles[i].draw();
};
OpticalElement.prototype.pointWithin = function(x, y) {
  var within = 1;
  within = within * (this.c1.dx < 0 ? (Math.pow(x-this.c1.x,2)+Math.pow(y-this.c1.y,2) < Math.pow(this.c1.r, 2) ? 1 : 0) : (Math.pow(x-this.c1.x,2)+Math.pow(y-this.c1.y,2) > Math.pow(this.c1.r, 2) ? 1 : 0));
  within = within * (this.c2.dx < 0 ? (Math.pow(x-this.c2.x,2)+Math.pow(y-this.c2.y,2) > Math.pow(this.c2.r, 2) ? 1 : 0) : (Math.pow(x-this.c2.x,2)+Math.pow(y-this.c2.y,2) < Math.pow(this.c2.r, 2) ? 1 : 0));
  within = within * (y <= this.y + this.h/2) * (y >= this.y - this.h/2);
  within = within * (x <= this.x + Math.max(this.w/2, this.w/2 + this.c2.dx)) * (x >= this.x - Math.max(this.w/2, this.w/2 - this.c1.dx));
  return within;
}


function ls(context, om, properties) { 			     	// light source
	var ctx = context;

	this.type = properties && !(properties.type === undefined) ? properties.type : 'sun';
	this.spray = properties && !(properties.spray === undefined) ? properties.spray : 3.0;
	this.w = properties && !(properties.w === undefined) ? properties.w : 5;
	this.x = properties && !(properties.x === undefined) ? properties.x : 500;
	this.y = properties && !(properties.y === undefined) ? properties.y : 200;
	this.r = properties && !(properties.r === undefined) ? properties.r : 10;
	this.rays = properties && !(properties.rays === undefined) ? properties.rays   : 24;
	this.raycolor = properties && !(properties.raycolor === undefined) ? properties.raycolor : '';
	this.ang = properties && !(properties.ang === undefined) ? properties.ang : Math.PI;
	this.dist = properties && !(properties.dist === undefined) ? properties.dist : null;
	this.mouseHandles = null;

	this.update = function() {
		this.x = this.mouseHandles[0].x;
		this.y = this.mouseHandles[0].y;

		this.ang = (this.mouseHandles[1].x < this.mouseHandles[0].x ? Math.PI : 0) + Math.atan((this.mouseHandles[1].y-this.mouseHandles[0].y)/(this.mouseHandles[1].x-this.mouseHandles[0].x));
		this.spray = Math.min(1, Math.max(-0.2, (Math.sqrt(Math.pow(this.mouseHandles[1].x-this.mouseHandles[0].x,2)+Math.pow(this.mouseHandles[1].y-this.mouseHandles[0].y,2))-100)*0.005));
		this.w   = Math.sqrt(Math.pow(this.mouseHandles[2].x-this.mouseHandles[0].x,2)+Math.pow(this.mouseHandles[2].y-this.mouseHandles[0].y,2))*2;

		this.mouseHandles[0].rotateTo(this.ang, this.mouseHandles[0].x, this.mouseHandles[0].y, false);
		//this.mouseHandles[2].fixAng = this.ang + Math.PI*0.5;
	};
	this.initMouseHandles = function() {
		this.mouseHandles = [];
		this.mouseHandles.push(new mouseHandle(ctx,this,{x:this.x, y:this.y, r:this.r, visible:false, useParentCollision:true})); // 0 - origin
		this.mouseHandles.push(new mouseHandle(ctx,this,{x:this.x+Math.cos(this.ang)*200*this.spray/Math.PI, y:this.y+Math.sin(this.ang)*200*this.spray/Math.PI})); // 1 - angle & spray
		this.mouseHandles.push(new mouseHandle(ctx,this,{x:this.x-Math.sin(this.ang)*this.w/2, y:this.y-Math.sin(this.ang)*this.w/2})); // 2 - width

		this.mouseHandles[0].addChild(this.mouseHandles[1]);
		this.mouseHandles[0].addChild(this.mouseHandles[2]);
	};
	this.pointWithin = function(x, y) {
		return Math.pow(x-this.x,2)+Math.pow(y-this.y,2)<=Math.pow(this.r,2);
	};
	this.drawHandles = function() {
		for (var i = 0; i < this.mouseHandles.length; i++) this.mouseHandles[i].draw();
	};
	this.draw = function() {
    switch(this.type) {
		  case 'sun':
			  this.drawRaysSun(om.getType('OpticalElement'));
        break;
		  case 'spot':
			  this.drawRaysSpot(om.getType('OpticalElement'));
        break;
		}

		ctx.lineWidth = 0.5;
		ctx.fillStyle = (this.raycolor === '' ? '#FFFFAA' : this.raycolor);

		ctx.beginPath();
		ctx.moveTo(this.x+this.r, this.y);
    ctx.fillStyle = om.clearColor;
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.fillStyle = (this.raycolor === '' ? '#FFFFAA' : this.raycolor);
		ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, false);
		ctx.fill();
	};
	this.drawRaySeg = function(les, ori, ang, sens) {
		var ori_new = ori;
		var ang_new = ang;
		var p_int = null; var t_int = null; var nr_int = null;

		ctx.beginPath();
		ctx.moveTo(ori.x, ori.y);

		// determine closest intersection with lens and calculate point of intersection, tangent, direction and refractive index
		var minlen = Infinity;
    var d = 0; var ap1 = 0; var ap2 = 0; var amax = 0; var amin = 0; var i; var int_le; var p;
		for (i = 0, int_le = 0; i < (typeof(les) == 'undefined' ? 0 : les.length); i++, int_le = 0) {
			//top (line)
			p = intersectionLineLine(les[i].x-les[i].w/2, les[i].y-les[i].h/2, les[i].x+les[i].w/2, les[i].y-les[i].h/2, ori.x, ori.y, ori.x+Math.cos(ang), ori.y+Math.sin(ang));
			if (p != null && p.x >= les[i].x-les[i].w/2 && p.x <= les[i].x+les[i].w/2 && (p.x == ori.x || Math.sign(p.x-ori.x) == Math.sign(Math.cos(ang))) && (p.y == ori.y || Math.sign(p.y-ori.y) == Math.sign(Math.sin(ang)))) {
        d = (p.x-ori.x)*Math.cos(ang)+(p.y-ori.y)*Math.sin(ang);
				if (d >= sens && d < minlen) { int_le = 1; minlen = d; p_int = {x:p.x, y:p.y}; t_int = p.t1; }
			}

			//bottom (line)
			p = intersectionLineLine(les[i].x-les[i].w/2, les[i].y+les[i].h/2, les[i].x+les[i].w/2, les[i].y+les[i].h/2, ori.x, ori.y, ori.x+Math.cos(ang), ori.y+Math.sin(ang));
			if (p != null && p.x >= les[i].x-les[i].w/2 && p.x <= les[i].x+les[i].w/2 && (p.x == ori.x || Math.sign(p.x-ori.x) == Math.sign(Math.cos(ang))) && (p.y == ori.y ||  Math.sign(p.y-ori.y) == Math.sign(Math.sin(ang)))) {
				d = (p.x-ori.x)*Math.cos(ang)+(p.y-ori.y)*Math.sin(ang);
				if (d >= sens && d < minlen) { int_le = 1; minlen = d; p_int = {x:p.x, y:p.y}; t_int = p.t1; }
			}

			// left arc (circle)
			p = intersectionLineCircle(ori.x, ori.y, ori.x+Math.cos(ang), ori.y+Math.sin(ang), les[i].c1.x, les[i].c1.y, les[i].c1.r);
			if (p != null) {
				ap1 = Math.acos((p.p1.x-les[i].c1.x)/Math.sqrt(Math.pow(p.p1.x-les[i].c1.x, 2)+Math.pow(p.p1.y-les[i].c1.y, 2)));
				ap2 = Math.acos((p.p2.x-les[i].c1.x)/Math.sqrt(Math.pow(p.p2.x-les[i].c1.x, 2)+Math.pow(p.p2.y-les[i].c1.y, 2)));
				amax = les[i].c1.dx > 0 ? les[i].c1.a1 : les[i].c1.a2;
				amin = les[i].c1.dx > 0 ? les[i].c1.a2 : les[i].c1.a1;
				if (angleBetween(ap1, amin, amax)) {
					d = (p.p1.x-ori.x)*Math.cos(ang)+(p.p1.y-ori.y)*Math.sin(ang);
					if (d >= sens && d < minlen) { int_le = 1; minlen = d; p_int = {x:p.p1.x, y:p.p1.y}; t_int = p.p1.t; }
				} else if (angleBetween(ap2, amin, amax)) {
					d = (p.p2.x-ori.x)*Math.cos(ang)+(p.p2.y-ori.y)*Math.sin(ang);
					if (d >= sens && d < minlen) { int_le = 1; minlen = d; p_int = {x:p.p2.x, y:p.p2.y}; t_int = p.p2.t; }
				}
			}

			// right arc (circle)
			p = intersectionLineCircle(ori.x, ori.y, ori.x+Math.cos(ang), ori.y+Math.sin(ang), les[i].c2.x, les[i].c2.y, les[i].c2.r);
			if (p != null) {
				ap1 = Math.acos((p.p1.x-les[i].c2.x)/Math.sqrt(Math.pow(p.p1.x-les[i].c2.x, 2)+Math.pow(p.p1.y-les[i].c2.y, 2)));
				ap2 = Math.acos((p.p2.x-les[i].c2.x)/Math.sqrt(Math.pow(p.p2.x-les[i].c2.x, 2)+Math.pow(p.p2.y-les[i].c2.y, 2)));
				amax = les[i].c2.dx < 0 ? les[i].c2.a1 : les[i].c2.a2;
				amin = les[i].c2.dx < 0 ? les[i].c2.a2 : les[i].c2.a1;
				if (angleBetween(ap1, amin, amax)) {
					d = (p.p1.x-ori.x)*Math.cos(ang)+(p.p1.y-ori.y)*Math.sin(ang);
					if (d >= sens && d < minlen) { int_le = 1; minlen = d; p_int = {x:p.p1.x, y:p.p1.y}; t_int = p.p1.t; }
				} else if (angleBetween(ap2, amin, amax)) {
					d = (p.p2.x-ori.x)*Math.cos(ang)+(p.p2.y-ori.y)*Math.sin(ang);
					if (d >= sens && d < minlen) { int_le = 1; minlen = d; p_int = {x:p.p2.x, y:p.p2.y}; t_int = p.p2.t; }
				}
			}

			// update the refractive index ratio if this element was intersected with a new closest intersection
			if (int_le)
        nr_int = Math.pow(les[i].refidx / 1.0, les[i].pointWithin(p_int.x + Math.cos(ang) * sens, p_int.y + Math.sin(ang) * sens) ? -1 : 1);
		}

		// draw segment
		ctx.lineTo(ori.x+Math.cos(ang)*(minlen == Infinity ? 10000 : minlen), ori.y+Math.sin(ang)*(minlen == Infinity ? 10000 : minlen));
		ctx.stroke();

		// turn red and draw next segment after passing through something
		if (minlen != Infinity) {
			// calculate outgoing angle after contact
			ori_new = p_int;
			var ang_incoming = Math.PI * 0.5 - (ang - t_int + Math.PI * 0.5) % Math.PI;
			var asin_in = nr_int * Math.sin(ang_incoming);
			if (Math.abs(asin_in) > 1) {
				return;
        // ang_new = (ang + Math.PI) + 2 * ang_incoming; // used for internal reflection of rays
			} else {
				var ang_outgoing = Math.asin(asin_in);
				ang_new = ang + ang_incoming - ang_outgoing;
			}

			// Some troubleshooting geometry
			if (0) {
				ctx.beginPath();
				ctx.strokeStyle = '#BBBBBB';
				ctx.moveTo(p_int.x - Math.cos(t_int) * 40, p_int.y - Math.sin(t_int) * 40);
				ctx.lineTo(p_int.x + Math.cos(t_int) * 40, p_int.y + Math.sin(t_int) * 40);
				ctx.stroke();

				/*
				// Draw surface tangent angle
				ctx.beginPath();
				ctx.strokeStyle = '#FF4444';
				var ang_base = Math.min(0, t_int);
				var ang_arc = Math.max(0, t_int);
				ctx.arc(p_int.x, p_int.y, 20, ang_base, ang_arc, false);
				ctx.stroke();

				// Draw incoming ray angle
				ctx.beginPath();
				ctx.strokeStyle = '#44FF44';
				var ang_base = 0;
				var ang_arc = Math.abs(Math.PI * 0.5 - ((ang + Math.PI * 0.5) % Math.PI));
				ctx.arc(p_int.x, p_int.y, 18, ang_base, ang_arc, false);
				ctx.stroke();
				*/

				// Draw incoming ray contact angle
				/*
				ctx.beginPath()
				ctx.strokeStyle = '#4444FF';
				var ang_base = 0;
				var ang_arc = Math.PI * 0.5 - (ang - t_int + Math.PI * 0.5) % Math.PI;
				ctx.arc(p_int.x, p_int.y, 15, ang_base, ang_arc, false);
				ctx.stroke();
				*/
			}

			this.drawRaySeg(les, ori_new, ang_new, sens);
		}
	};
	this.drawRaysSun = function(les) {
		for (var i = 0; i < this.rays; i++) {
			ctx.lineWidth = 0.5;
			ctx.fillStyle = 'none';
			ctx.strokeStyle = (this.raycolor === '' ? HSVtoHEX(i/this.rays, 0.3, 1.0) : this.raycolor);
			this.drawRaySeg(les, {x:this.x, y:this.y}, i/this.rays*2*Math.PI, 0.0001);
		}
	};
	this.drawRaysSpot = function(les) {
		for (var i = 0; i < this.rays; i++) {
			ctx.lineWidth = 0.5;
			ctx.fillStyle = 'none';
			ctx.strokeStyle = (this.raycolor === '' ? HSVtoHEX(i/this.rays, 0.3, 1.0) : this.raycolor);
			this.drawRaySeg(les,
                      {x:this.x+Math.sin(this.ang)*this.w*(i-(this.rays-1)*0.5)/this.rays,
                       y:this.y-Math.cos(this.ang)*this.w*(i-(this.rays-1)*0.5)/this.rays},
                      this.ang+this.spray*Math.PI*((this.rays-1)*0.5-i)/this.rays, 0.0001);
		}
	};

	this.initMouseHandles();
}
function img(context, objectManager, properties) {			     	// image light source
	var om = objectManager;
	var img = new Image();
	img.src = properties && !!properties.src ? properties.src	: 'assets/img_the_scream.jpg';
	var ready = false;

	img.onload = function () {
		ready = true;
	};

	this.draw = function() {
		if (ready) {
			context.drawImage(img, 10, 10);
		}
	};
}

// GEOMETRY HELPER FUNCTIONS
function intersectionLineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
	var invdenom = ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
	if (invdenom == 0) { return null; } else { invdenom = 1/invdenom; }
	return {
		x:((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))*invdenom,
		y:((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))*invdenom,
		t1: (Math.atan((y2-y1)/(x2-x1)) + Math.PI * 0.5 ) % Math.PI,
		t2: (Math.atan((y4-y3)/(x4-x3)) + Math.PI * 0.5) % Math.PI };
}
function intersectionLineCylinder(l, c) {
	// line
	l.p1.x = !!l.p1.x ? l.p1.x : 0;	l.p2.x = !!l.p2.x ? l.p2.x : 0;
	l.p1.y = !!l.p1.y ? l.p1.y : 0;	l.p2.y = !!l.p2.y ? l.p2.y : 0;
	l.p1.z = !!l.p1.z ? l.p1.z : 0; l.p2.z = !!l.p2.z ? l.p2.z : 0;

	// cylinder
	c.o.x = !!c.o.x ? c.o.x : 0; c.a.x = !!c.a.x ? c.a.x : 0;
	c.o.y = !!c.o.y ? c.o.y : 0; c.a.y = !!c.a.y ? c.a.y : 0;
	c.o.z = !!c.o.z ? c.o.z : 0; c.a.z = !!c.a.z ? c.a.z : 0;
	c.r = !!c.r ? c.r : 0;


}
function intersectionLineCircle(x1, y1, x2, y2, cx, cy, cr) {
	var ab = {x:x2-x1, y:y2-y1}; var ac = {x:cx-x1, y:cy-y1};
	var dot = ab.x*ac.x+ab.y*ac.y;
	var ad = {x:dot*ab.x, y:dot*ab.y};
	var min_d2 = {x:ad.x-ac.x, y:ad.y-ac.y}; min_d2 = Math.pow(min_d2.x, 2)+Math.pow(min_d2.y, 2);
	if (min_d2 > Math.pow(cr,2)) { return null; }
	var s = Math.sqrt(Math.pow(cr, 2) - min_d2);
	return {
		p1:{
			x:x1+ab.x*(dot-s),
			y:y1+ab.y*(dot-s),
			t:Math.atan((y1+ab.y*(dot-s)-cy)/(x1+ab.x*(dot-s)-cx))
		}, p2:{
			x:x1+ab.x*(dot+s),
			y:y1+ab.y*(dot+s),
			t:Math.atan((y1+ab.y*(dot+s)-cy)/(x1+ab.x*(dot+s)-cx))
		} };
}
function angleBetween(a, btw_min, btw_max) {
	return (btw_max > btw_min ? a >= btw_min && a <= btw_max : a >= btw_max && a <= btw_min);
}

// COLOR HELPER FUNCTIONS
function HSVtoHEX(h, s, v) {
	var color_rgb = HSVtoRGB(h, s, v);
	return RGBtoHEX(color_rgb.r, color_rgb.g, color_rgb.b);
}
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s; v = h.v; h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
function RGBtoHEX(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// TRANSFORMATION TRACKER
// credit: https://github.com/simonsarris/Canvas-tutorials/blob/master/transform.js
function Transform() {
  this.reset();
}
Transform.prototype.reset = function() {
  this.m = [1,0,0,1,0,0];
};
Transform.prototype.multiply = function(matrix) {
  var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
  var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

  var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
  var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

  var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
  var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

  this.m[0] = m11;
  this.m[1] = m12;
  this.m[2] = m21;
  this.m[3] = m22;
  this.m[4] = dx;
  this.m[5] = dy;
};
Transform.prototype.invert = function() {
  var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
  var m0 = this.m[3] * d;
  var m1 = -this.m[1] * d;
  var m2 = -this.m[2] * d;
  var m3 = this.m[0] * d;
  var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
  var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
  this.m[0] = m0;
  this.m[1] = m1;
  this.m[2] = m2;
  this.m[3] = m3;
  this.m[4] = m4;
  this.m[5] = m5;
};
Transform.prototype.rotate = function(rad) {
  var c = Math.cos(rad);
  var s = Math.sin(rad);
  var m11 = this.m[0] * c + this.m[2] * s;
  var m12 = this.m[1] * c + this.m[3] * s;
  var m21 = this.m[0] * -s + this.m[2] * c;
  var m22 = this.m[1] * -s + this.m[3] * c;
  this.m[0] = m11;
  this.m[1] = m12;
  this.m[2] = m21;
  this.m[3] = m22;
};
Transform.prototype.translate = function(x, y) {
  this.m[4] += this.m[0] * x + this.m[2] * y;
  this.m[5] += this.m[1] * x + this.m[3] * y;
};
Transform.prototype.scale = function(sx, sy) {
  this.m[0] *= sx;
  this.m[1] *= sx;
  this.m[2] *= sy;
  this.m[3] *= sy;
};
Transform.prototype.transformPoint = function(px, py) {
  var x = px;
  var y = py;
  px = x * this.m[0] + y * this.m[2] + this.m[4];
  py = x * this.m[1] + y * this.m[3] + this.m[5];
  return [px, py];
};
Transform.prototype.untransformPoint = function(px, py) {
  var x = px;
  var y = py;
  var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
  px =  x * this.m[3] * d - y * this.m[2] * d + d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
  py = -x * this.m[1] * d + y * this.m[0] * d + d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
  return [px, py];
}
