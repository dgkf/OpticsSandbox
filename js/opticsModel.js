function opticsModel(canvas, context) {
  var vp = new Viewport(context);
	var om = new ObjectManager(context);
  var mh = new MouseHandler(context, om, vp);
  var kh = new KeyHandler(context, om, mh);
  vp.addToScene(new Grid(context));
  vp.addToScene(om);
  vp.addToScene(mh);
	this.fps = 60;

	this.init = function() {
		om.add(new OpticalElement(context, {x: 0, y: 0, h: 200, w: 5, c1:{dx:-30}, c2:{dx:30} }));
		om.add(new LightSource(context, om, {x: 250, y: 0, raycolor: 'rgba(236, 236, 64, 0.8)', rays: 12, type:'spot'}));
		//om.add(new img(ctx, om));
		//om.add(new img(ctx, om, {src: 'assets/opera.gif'}));
		//om.add(new le(ctx, {x: 100, y: 300, h: 200, w: 10, c1:{dx:-10}, c2:{dx:10}}));
	};

	update = function() { om.update(); };
	draw = function() {	vp.renderScene(); };

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
  for (var key in Object.keys(obj)) {
    var key_name = Object.keys(obj)[key];
    panel_id = ["#opticsSandbox-", obj.constructor.name, "Panel"].join("");
    input_class = ["input.opticsSandbox", obj.constructor.name, key_name].join(".");

    // remove pre-existing callbacks tied to property updates in this field
    $([panel_id, input_class].join(" ")).off("input change");

    // load value from selected object for displaying
    $([panel_id, input_class].join(" ")).val(obj[Object.keys(obj)[key]]);

    // associate callback to edit object property on field updates
    $([panel_id, input_class].join(" ")).on("input change", function (event) {
      // update other fields which redirect to the same variable
      $('.'+event.target.className.split(' ').join('.')).val(event.target.value);
      // strip the variable name from the input element's class and use it to update the selected object
      obj[event.target.className.match(/[^ ]+$/mg)[0]] = event.target.value;
      if (obj.updateMouseHandles !== undefined) obj.updateMouseHandles();
    });
  }
}
function hidePropertiesPanels() {
  $(".opticsSandbox-propertiesPanel").removeClass("visible");
}

// SOME BOILERPLATE OBJECTS
function Point2D(x, y) {
  this.x = x;
  this.y = y;
}
Point2D.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
}
Point2D.prototype.toVector2D = function() {
  return new Vector2D(this.x, this.y);
};
Point2D.prototype.plus = function(other_Point2D) {
  return new Point2D(this.x + other_Point2D.x, this.y + other_Point2D.y);
};
Point2D.prototype.minus = function(other_Point2D) {
  return {x: this.x - other_Point2D.x, y: this.y - other_Point2D.y};
};
Point2D.prototype.distanceTo = function(other_Point2D) {
  return Math.sqrt(Math.pow(this.x-other_Point2D.x, 2.0)+Math.pow(this.y-other_Point2D.y, 2.0));
}
Point2D.prototype.distanceSquaredTo = function(other_Point2D) {
  return Math.pow(this.x-other_Point2D.x, 2.0)+Math.pow(this.y-other_Point2D.y, 2.0);
}
Point2D.prototype.applyConstraint = function(constraint) {
  return constraint.applyTo(this)
};
function Vector2D(x, y) {
  this.x = x;
  this.y = y;
}
Vector2D.prototype.fromPoint = function(point) {
  this.x = point.x;
  this.y = point.y;
};
Vector2D.prototype.mag = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
Vector2D.prototype.negate = function() {
  return new Vector2D(-this.x, -this.y);
}
Vector2D.prototype.normalize = function() {
  var mag_inv = 1/Vector2D.prototype.mag.call(this);
  return new Vector2D(this.x * mag_inv, this.y * mag_inv);
};
Vector2D.prototype.times = function(scalar) {
  return new Vector2D(this.x * scalar, this.y * scalar);
};
Vector2D.prototype.divide = function(scalar) {
  scalar = 1/scalar;
  return new Vector2D(this.x * scalar, this.y * scalar);
};
Vector2D.prototype.log2 = function() {
  return new Vector2D(Math.log2(this.x), Math.log2(this.y));
};
Vector2D.prototype.log10 = function() {
  return new Vector2D(Math.log10(this.x), Math.log10(this.y));
};
Vector2D.prototype.log = function(scalar) {
  return new Vector2D(Math.log(this.x)/Math.log(scalar), Math.log(this.y)/Math.log(scalar));
}
Vector2D.prototype.pow = function(scalar) {
  return new Vector2D(Math.pow(this.x, scalar), Math.pow(this.y, scalar));
};
Vector2D.prototype.plus = function(other_Vector2D) {
  return new Vector2D(this.x + other_Vector2D.x, this.y + other_Vector2D.y);
};
Vector2D.prototype.minus = function(other_Vector2D) {
  return new Vector2D(this.x - other_Vector2D.x, this.y - other_Vector2D.y);
};
Vector2D.prototype.dot = function(other_Vector2D) {
  return this.x * other_Vector2D.x + this.y * other_Vector2D.y;
};
Vector2D.prototype.cross = function(other_Vector2D) {
  return this.x * other_Vector2D.y - this.y * other_Vector2D.x;
};
Vector2D.prototype.projectAlong = function(other_Vector2D) {
  return Vector2D.prototype.times.call(other_Vector2D,
           Vector2D.prototype.dot.call(this,
             Vector2D.prototype.divide.call(other_Vector2D,
               Vector2D.prototype.mag.call(other_Vector2D))));
};
Vector2D.prototype.projectAlongUnitVector = function(other_unit_Vector2D) {
  return Vector2D.prototype.times.call(other_Vector2D,
           Vector2D.prototype.dot.call(this, other_unit_Vector2D));
};
Vector2D.prototype.angleBetween = function(other_Vector2D) {
  return (this.y > other_Vector2D.y ? -1 : 1) * Math.acos(Vector2D.prototype.dot.call(Vector2D.prototype.normalize.call(this), Vector2D.prototype.normalize.call(other_Vector2D)));
}
Vector2D.prototype.distanceAlong = function(other_Vector2D) {
  return Vector2D.prototype.dot.call(this, other_Vector2D);
}
function Ray2D(point2D, vector2D) {
  this.point = point2D;
  this.vector = vector2D;
}
Ray2D.prototype.fromPointAngle = function(point, angle) {
  this.point = new Point2D(point.x, point.y);
  this.vector = new Vector2D(Math.cos(angle), Math.sin(angle));
}
Ray2D.prototype.getAngle = function() {
  return Math.atan(this.vector.y/this.vector.x) + (this.vector.x > 0 ? 0 : Math.PI)
}
Ray2D.prototype.nearestPointOnRay = function(other_point2D) {
  var origin_to_op2D = new Vector2D(other_point2D.x - this.point.x, other_point2D.y - this.point.y);
  return Point2D.prototype.plus.call(this.point,
           Vector2D.prototype.projectAlong.call(origin_to_op2D, this.vector));
}

// OBJECTS
function ObjectManager(context, properties) { 		// object manager
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
    var i;
		for (i in this.objs) this.objs[i].map(function(item) { item.draw(); });
    for (i in this.objs) this.objs[i].map(function(item) { item.drawHandles(); });
	};
}
function KeyHandler(context, om, mh) {       // keyboard manager
  var handleKeyDown = function(event) {
    switch (event.code) {
      case "KeyE":
        om.add(new OpticalElement(context, {x: mh.posWorld.x, y: mh.posWorld.y, h: 500, w: 1, c1:{dx:-80}, c2:{dx:80}}));
        break;
      case "KeyS":
        om.add(new LightSource(context, om, {x: mh.posWorld.x, y: mh.posWorld.y, raycolor: 'rgba(236, 236, 64, 0.5)', rays: 12}));
        break;
      case "Delete":
        delete mh.selectedHandles.parent;
        break;
      case "KeyH":
        $(".opticsSandbox-helpPanel").addClass("visible");
        break;
      case "Backslash":
        debugger;
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
function MouseHandler(context, om, vp) {				    // mouse manager
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
    if (handles.constructor.name == 'mouseHandle' || handles.constructor.name == 'MouseHandle') {
      handles.active = true; selectedHandles.push(handles);
    } else for (var h in handles) { handles[h].active = true; selectedHandles.push(handles[h]); }

    if (selectedHandles.length == 1)
      showPropertiesPanelForObject(selectedHandles[0].parentObject);

    event.target.style.cursor = 'move';
    return true;
  }
  function addToSelection(handles) {
    if (handles.constructor.name == 'mouseHandle') { handles.active = true; selectedHandles.push(handles); }
    else for (var h in handles) { h.active = true; selectedHandles.push(handles[h]); }
    return true;
  }
  function clearSelection() {
    for (var h in selectedHandles) selectedHandles[h].active = false;
    selectedHandles = [];

    hidePropertiesPanels();
    return true;
  }

	this.handleMouseDown = function(event) {
    var world_point = vp.transform.untransformPoint(event.clientX, event.clientY);

    switch(event.button) {
      case 0:
        // upkeep
        lastMouseLeftDownWorld.x = world_point[0];
        lastMouseLeftDownWorld.y = world_point[1];
        leftMouseDown = true;

        // object manager interaction
        var object_interactions_handled = false;
        // allow selection of a child handles within an object
  			for (var h = 0; h < selectedHandles.length; h++)
  				for (var hph = selectedHandles[h].parentObject.mouseHandles.length-1; hph >= 1 ; hph--) {
  					if (selectedHandles[h].parentObject.mouseHandles[hph].pointWithin(world_point[0], world_point[1])) {
              setSelection(selectedHandles[h].parentObject.mouseHandles[hph]);
              object_interactions_handled = true;
  					}
          }

        // retain all objects selected if a parent object is being moved as part of a group
        if (!object_interactions_handled) {
    			var keep_selection = false;
    			for (h = 0; h < selectedHandles.length; h++) {
    				if (selectedHandles[h].pointWithin(world_point[0], world_point[1])) {
              keep_selection = true;
              event.target.style.cursor = 'move';
              object_interactions_handled = true;
            }
          }
    			if (!keep_selection) clearSelection();
        }

        // selection of a new object
        if (!object_interactions_handled)
      		for (var obj_type in om.objs) {
      			for (var obj_idx = 0; obj_idx < om.objs[obj_type].length; obj_idx++) {
      				if (om.objs[obj_type][obj_idx].pointWithin(world_point[0], world_point[1])) {
      					setSelection(om.objs[obj_type][obj_idx].mouseHandles[0]);
                object_interactions_handled = true;
      				}
            }
          }
        break;
      case 1:
        // upkeep
        lastMouseMiddleDownWorld.x = world_point[0];
        lastMouseMiddleDownWorld.y = world_point[1];
        middleMouseDown = true;
        event.target.style.cursor = '-webkit-grabbing';
        if (event.target.style.cursor !== '-webkit-grabbing') event.target.style.cursor = '-moz-grabbing';
        break;
    }
  };
	this.handleMouseUp = function(event) {
    var world_point = vp.transform.untransformPoint(event.clientX, event.clientY);

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
                  om.objs[obj_type][obj_idx].mouseHandles[0].position.x >= Math.min(lastMouseLeftDownWorld.x, posWorld.x) &&
                  om.objs[obj_type][obj_idx].mouseHandles[0].position.x <= Math.max(lastMouseLeftDownWorld.x, posWorld.x) &&
                  om.objs[obj_type][obj_idx].mouseHandles[0].position.y >= Math.min(lastMouseLeftDownWorld.y, posWorld.y) &&
                  om.objs[obj_type][obj_idx].mouseHandles[0].position.y <= Math.max(lastMouseLeftDownWorld.y, posWorld.y)) {

                newSelectionHandles.push(om.objs[obj_type][obj_idx].mouseHandles[0]);
              }

          if (newSelectionHandles.length > 0) {
            setSelection(newSelectionHandles);
          } else
            clearSelection();
        }

        event.target.style.cursor = 'default';
        break;
      case 1:
        // upkeep
        lastMouseMiddleUpWorld.x = world_point[0];
        lastMouseMiddleUpWorld.y = world_point[1];
        middleMouseDown = false;
        event.target.style.cursor = 'default';
        break;
    }
  };
	this.handleMouseMove = function(event) {
    // upkeep
    lastMove.x = pos.x;
    pos.x = event.clientX;
    lastMove.y = pos.y;
    pos.y = event.clientY;

    var pos_world = vp.transform.untransformPoint(pos.x, pos.y);
    var lastMove_world = vp.transform.untransformPoint(lastMove.x, lastMove.y);
    posWorld.x = pos_world[0];
    posWorld.y = pos_world[1];

    // object interaction
    if (selectedHandles.length > 0 && leftMouseDown)
      for (var h = 0; h < selectedHandles.length; h++) {
        selectedHandles[h].offset(posWorld.x - lastMove_world[0], posWorld.y - lastMove_world[1]);
      }

    // viewport interaction
    if (middleMouseDown) {
      vp.offsetScreenSpace(pos.x - lastMove.x, pos.y - lastMove.y);
    }
  };
  this.handleMouseWheel = function(event) {
    vp.applyZoom(Math.pow(1.1, -event.deltaY * 0.01));
  };

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
function MouseHandle(context, parent, properties) {
  this.context = context;
  this.parentObject = parent;
  this.children = [];

  this.r = properties && properties.r !== undefined ? properties.r : 5;
  this.position = new Point2D(properties && properties.x !== undefined ? properties.x : 0,
                              properties && properties.y !== undefined ? properties.y : 0);

  this.active = properties && properties.angle !== undefined ? properties.angle : false;
  this.visible = properties && properties.visible !== undefined ? properties.visible : true;
  this.useParentCollision = properties && properties.useParentCollision !== undefined ? properties.useParentCollision : false;

  this.constraints = [];
  this.callbacks = [];
  this.bindings = [];
}
MouseHandle.prototype.update = function() {
  this.applyConstraints();
  this.applyCallbacks();
}
MouseHandle.prototype.offset = function(x, y) {
  this.position.x += x;
  this.position.y += y;
  this.update();

  for (var c = 0; c < this.children.length; c++)
    this.children[c].offset(x, y);

  return this;
};
MouseHandle.prototype.moveTo = function(x, y) {
  offset = new Vector2D(x - this.position.x, y - this.position.y);
  this.position.x = x;
  this.position.y = y;

  for (var c = 0; c < this.children.length; c++)
    this.children[c].offset(offset.x, offset.y);

  return this;
}
MouseHandle.prototype.initProperty = function(name, value) {
  this['_'+name] = value;
  return this;
}
MouseHandle.prototype.applyBindings = function() {
  for (var b = 0; b < this.bindings.length; b++)
    // call it passing this object as the this parameter if it is unbound
    if (this.bindings[b].hasOwnProperty('prototype'))
      this.bindings[b].call(this);
    else
      this.bindings[b]();

  return this;
}
MouseHandle.prototype.addPropertyBinding = function(binding) {
  this.bindings.push(binding);
  return this;
}
MouseHandle.prototype.applyConstraints = function() {
  for (var c = 0; c < this.constraints.length; c++) {
    this.position.applyConstraint(this.constraints[c]);
  }

  return this;
}
MouseHandle.prototype.addConstraint = function(constraint) {
  this.constraints.push(constraint.bindUnboundFunctionsTo(this));
  return this;
}
MouseHandle.prototype.applyCallbacks = function() {
  for (var c = 0; c < this.callbacks.length; c++)
    // call it passing this object as the this parameter if it is unbound
    if (this.callbacks[c].hasOwnProperty('prototype'))
      this.callbacks[c].call(this);
    else
      this.callbacks[c]();

  return this;
}
MouseHandle.prototype.addCallback = function(callback) {
  this.callbacks.push(callback);
  return this;
}
MouseHandle.prototype.addChild = function(child) {
  this.children.push(child);
  return this;
}
MouseHandle.prototype.addParent = function(parent) {
  parent.addChild(this);
  return this;
}
MouseHandle.prototype.draw = function() {
  if ((this.active || this.parentObject.mouseHandles[0].active) && this.visible) {
    this.context.beginPath();
    this.context.fillStyle = '#EEEEEE';
    this.context.strokeStyle = '#444444';
    this.context.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2, false);
    this.context.fill();
    this.context.stroke();
  }
};
MouseHandle.prototype.pointWithin = function(x, y)  {
  if (this.useParentCollision)
    return this.parentObject.pointWithin(x, y);
  else
    return Math.pow(this.position.x-x,2)+Math.pow(this.position.y-y,2) < Math.pow(this.r,2);
};
function Viewport(context, properties) {
  this.x = properties && properties.x !== undefined ? properties.x : context.canvas.width * 0.5;
  this.y = properties && properties.y !== undefined ? properties.y : context.canvas.height * 0.5;
  this.zoom = properties && properties.zoom !== undefined ? properties.zoom : 1.0;
  this.transform = new Transform();
  this.clearStyle = properties && properties.clearStyle !== undefined ? properties.clearStyle : null;
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
    for (var obj in this.scene) this.scene[obj].draw(this.transform);
  };

  this.updateTransformation(context);
}
Viewport.prototype.updateTransformation = function(context) {
  this.transform.reset();
  this.transform.translate(context.canvas.width*0.5, context.canvas.height*0.5);
  this.transform.scale(this.zoom, this.zoom);
  this.transform.translate(-context.canvas.width*0.5, -context.canvas.height*0.5);
  this.transform.translate(this.x, this.y);
};

function Constraint() {}
Constraint.prototype.applyTo = function(point) {
  return point;
}
Constraint.prototype.bindUnboundFunctionsTo = function(bindTarget) {
  function bindUnboundFunctionProperties(obj) {
    for (var k = 0; k < Object.keys(obj).length; k++)
      // recursively call functio to evaluate nested objects' functions
      if (typeof obj[Object.keys(obj)[k]] === 'object')
        bindUnboundFunctionProperties(obj[Object.keys(obj)[k]]);
      // evaluate any bound functions for this constraint
      else if (typeof obj[Object.keys(obj)[k]] === 'function' && obj[Object.keys(obj)[k]].hasOwnProperty('prototype'))
        obj[Object.keys(obj)[k]] = obj[Object.keys(obj)[k]].bind(bindTarget);
  }

  bindUnboundFunctionProperties(this);
  return this;
}
Constraint.prototype.evaluateFunctionalProperties = function() {
  function eval_props(obj) {
    var timestamp = {};

    for (var k = 0; k < Object.keys(obj).length; k++)
      // recursively call functio to evaluate nested objects' functions
      if (typeof obj[Object.keys(obj)[k]] === 'object')
        timestamp[Object.keys(obj)[k]] = eval_props(obj[Object.keys(obj)[k]]);
      // evaluate any functions for this constraint given current properties for all dependent objects
      else if (typeof obj[Object.keys(obj)[k]] === 'function')
        timestamp[Object.keys(obj)[k]] = obj[Object.keys(obj)[k]].call();
      // otherwise just copy the value over
      else
        timestamp[Object.keys(obj)[k]] = obj[Object.keys(obj)[k]]

    return timestamp;
  }

  return eval_props(this);
}
function XYConstraint(min_x, min_y, max_x, max_y) {
  // min and max in form of {x: -, y: -} - inputs can be bound functions to constrict to dynamic values
  this.x = {min: min_x !== null ? min_x : -Infinity, max: max_x !== null ? max_x : Infinity};
  this.y = {min: min_y !== null ? min_y : -Infinity, max: max_y !== null ? max_y : Infinity};
}
XYConstraint.prototype = Object.create(Constraint.prototype);
XYConstraint.prototype.applyTo = function(point) {
  var timestamp = this.evaluateFunctionalProperties();
  point.x = Math.max(Math.min(point.x, timestamp.x.max), timestamp.x.min);
  point.y = Math.max(Math.min(point.y, timestamp.y.max), timestamp.y.min);
  return point;
};
function RayConstraint(ray) {
  this.ray = ray;
}
RayConstraint.prototype = Object.create(Constraint.prototype);
RayConstraint.prototype.applyTo = function(point) {
  var timestamp = this.evaluateFunctionalProperties();
  var point_out = Ray2D.prototype.nearestPointOnRay.call(timestamp.ray, point);
  point.x = point_out.x;
  point.y = point_out.y;
  return point;
};
function DistanceConstraint(point, min_distance, max_distance) {
  this.point = point;
  this.distance = {min: min_distance, max: max_distance};
}
DistanceConstraint.prototype = Object.create(Constraint.prototype);
DistanceConstraint.prototype.applyTo = function(point) {
  var point_constrained;
  var timestamp = this.evaluateFunctionalProperties();
  var d = Point2D.prototype.distanceSquaredTo.call(point, timestamp.point);

  // this isn't quite working - I think it's related to a faulty input :\
  if (d > Math.pow(timestamp.distance.max, 2.0)) {
    point_constrained = Vector2D.prototype.plus.call(
                          Vector2D.prototype.times.call(
                            Vector2D.prototype.normalize.call(
                              Vector2D.prototype.minus.call(point, timestamp.point)),
                            timestamp.distance.max),
                          timestamp.point);
    point.x = point_constrained.x;
    point.y = point_constrained.y;
  } else if (d < Math.pow(timestamp.distance.min, 2.0)) {
    point_constrained = Vector2D.prototype.plus.call(
                          Vector2D.prototype.times.call(
                            Vector2D.prototype.normalize.call(
                              Vector2D.prototype.minus.call(point, timestamp.point)),
                          timestamp.distance.min),
                        timestamp.point);
    point.x = point_constrained.x;
    point.y = point_constrained.y;
  }

  return point;
}

function Grid(context, properties) {
  this.context = context;
  this.majorToMinorFoldChange = 5;
  this.majorBaseIncrement = 1250;
  this.tiersToDraw = 3;
  this.color = new rgba(200, 200, 200, 0.3);
}
Grid.prototype.draw = function(transform) {
  var scaleFoldChange = (new Vector2D(transform.m[0], transform.m[3])).log(this.majorToMinorFoldChange).negate();
  var vp_min_xy = transform.untransformPoint(0, 0);
  var vp_max_xy = transform.untransformPoint(this.context.canvas.width, this.context.canvas.height);
  var increment_x = this.majorBaseIncrement * Math.pow(this.majorToMinorFoldChange, Math.floor(scaleFoldChange.x));
  var increment_y = this.majorBaseIncrement * Math.pow(this.majorToMinorFoldChange, Math.floor(scaleFoldChange.y));
  this.context.lineWidth = 1 * Math.pow(this.majorToMinorFoldChange, scaleFoldChange.x);

  var i;
  for (var tier = 0; tier < this.tiersToDraw; tier++) {
    this.context.strokeStyle = this.color.atOpacityFactor(Math.pow(0.5, tier) - Math.pow(0.5, tier + (tier == this.tiersToDraw - 1 ? 0 : 1)) * (scaleFoldChange.x-Math.floor(scaleFoldChange.x)));

    // vertical
    for (i = Math.floor(vp_min_xy[0] / increment_x); i <= Math.ceil(vp_max_xy[0] / increment_x); i++) {
      this.context.beginPath();
      this.context.moveTo(i * increment_x, vp_min_xy[1]);
      this.context.lineTo(i * increment_x, vp_max_xy[1]);
      this.context.stroke();
    }

    // horizontal
    for (i = Math.floor(vp_min_xy[1] / increment_y); i <= Math.ceil(vp_max_xy[1] / increment_y); i++) {
      this.context.beginPath();
      this.context.moveTo(vp_min_xy[0], i * increment_y);
      this.context.lineTo(vp_max_xy[0], i * increment_y);
      this.context.stroke();
    }

    increment_x /= this.majorToMinorFoldChange;
    increment_y /= this.majorToMinorFoldChange;
  }

  // draw x, y
  this.context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  this.context.beginPath();
  this.context.moveTo(vp_min_xy[0], 0);
  this.context.lineTo(vp_max_xy[0], 0);
  this.context.stroke();

  this.context.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  this.context.beginPath();
  this.context.moveTo(0, vp_min_xy[1]);
  this.context.lineTo(0, vp_max_xy[1]);
  this.context.stroke();
};
function OpticalElement(context, properties) {
  // initialization
  this.context = context;
	this.x = properties && properties.x !== undefined ? properties.x : 0;
	this.y = properties && properties.y !== undefined ? properties.y : 0;
	this.h = properties && properties.h !== undefined ? properties.h : 100;
	this.w = properties && properties.w !== undefined ? properties.w : 10;
	this.c1 = {dx: properties && properties.c1.dx !== undefined ? properties.c1.dx : -20};
	this.c2 = {dx: properties && properties.c2.dx !== undefined ? properties.c2.dx : 20};
	this.refidx = properties && properties.refidx !== undefined ? properties.refidx : 2.15;
	this.mouseHandles = [];

	this.initMouseHandles = function() {
    // center position (inherits this collision)
		this.mouseHandles.push(
      new MouseHandle(context, this, {x: this.x, y: this.y, useParentCollision: true, visible: false})
        .addCallback((function() {
            this.x = this.mouseHandles[0].position.x;
            this.y = this.mouseHandles[0].position.y; }).bind(this))
    );
    // top right corner of base rectangle
    this.mouseHandles.push(
      new MouseHandle(context, this, {x: this.x + this.w/2, y: this.y - this.h/2})
        .addParent(this.mouseHandles[0])
        .addConstraint(new XYConstraint(
          (function() { return this.x; }).bind(this), //min_x
          -Infinity, //min_y
          Infinity, // max_x
          (function() { return this.y; }).bind(this))) // max_y
        .addCallback((function() {
          this.w = (this.mouseHandles[1].position.x-this.mouseHandles[0].position.x)*2;
          this.h = this.h = (this.mouseHandles[0].position.y-this.mouseHandles[1].position.y)*2; }).bind(this))
        .addCallback((function() {
          this.mouseHandles.slice(2,4).map(function(i) { i.update(); }); }).bind(this))
    );
    // left arc handle
    this.mouseHandles.push(
      new MouseHandle(context, this, {x: this.x + this.w/2 + this.c1.dx, y: this.y})
        .addParent(this.mouseHandles[0])
        .addConstraint(new XYConstraint(
          (function() { return this.x - this.w/2 - (this.h-0.001)/2 }).bind(this), // min_x
          (function() { return this.y; }).bind(this), // min_y
          (function() { return Math.min(this.x - this.w/2 + (this.h-0.001)/2, this.x + this.w/2 + this.c2.dx) }).bind(this), // max_x
          (function() { return this.y; }).bind(this))) // max_y
        .addCallback((function() {
          this.c1.dx = this.mouseHandles[2].position.x-2*this.mouseHandles[0].position.x+this.mouseHandles[1].position.x;
          this.c1.x  = this.x-this.w/2+this.c1.dx/2-Math.pow(this.h, 2)/this.c1.dx*0.125;
          this.c1.y  = this.y;
          this.c1.r  = Math.abs(this.x-this.w/2+this.c1.dx-this.c1.x);
          this.c1.a1 = (this.c1.dx < 0 ? Math.PI : 0) - Math.atan(-(this.h/2)/((this.x-this.w/2)-this.c1.x));
          this.c1.a2 = (this.c1.dx < 0 ? Math.PI : 0) - Math.atan((this.h/2)/((this.x-this.w/2)-this.c1.x)); }).bind(this))
    );
    // right arc handle
    this.mouseHandles.push(
      new MouseHandle(context, this, {x: this.x + this.w/2 + this.c2.dx, y: this.y})
        .addParent(this.mouseHandles[0])
        .addConstraint(new XYConstraint(
          (function() { return Math.max(this.x + this.w/2 - (this.h-0.001)/2, this.x - this.w/2 + this.c1.dx) }).bind(this), // min_x
          (function() { return this.y; }).bind(this), // min_y
          (function() { return this.x + this.w/2 + (this.h-0.01)/2 }).bind(this), // max_x
          (function() { return this.y; }).bind(this))) //max_y
        .addCallback((function() {
          this.c2.dx = this.mouseHandles[3].position.x-this.mouseHandles[1].position.x;
          this.c2.x  = this.x+this.w/2+this.c2.dx/2-Math.pow(this.h, 2)/this.c2.dx*0.125;
          this.c2.y  = this.y;
          this.c2.r  = Math.abs(this.x+this.w/2+this.c2.dx-this.c2.x);
          this.c2.a1 = (this.c2.dx < 0 ? Math.PI : 0) - Math.atan((this.h/2)/((this.x+this.w/2)-this.c2.x));
          this.c2.a2 = (this.c2.dx < 0 ? Math.PI : 0) - Math.atan(-(this.h/2)/((this.x+this.w/2)-this.c2.x)); }).bind(this))
    );
    this.mouseHandles[2].applyCallbacks(); // run this once on initialization to initialize .c1 properties
    this.mouseHandles[3].applyCallbacks(); // run this once on initialization to initialize .c2 properties
  };
	this.initMouseHandles();
}
OpticalElement.prototype.draw = function () {
  this.context.lineWidth=0.5;
  this.context.fillStyle='rgba(128, 164, 255, 0.6)';

  this.context.beginPath();
  this.context.moveTo(this.x+this.w*0.5, this.y-this.h*0.5);
  if (Math.abs(this.c2.r) > 100000) this.context.lineTo(this.x+this.w*0.5, this.y+this.h*0.5);
  else this.context.arc(this.c2.x, this.c2.y, this.c2.r, this.c2.a1, this.c2.a2, this.c2.dx < 0);
  this.context.lineTo(this.x-this.w*0.5, this.y+this.h*0.5);
  if (Math.abs(this.c1.r) > 100000) this.context.lineTo(this.x-this.w*0.5, this.y-this.h*0.5);
  else this.context.arc(this.c1.x, this.c1.y, this.c1.r, this.c1.a1, this.c1.a2, this.c1.dx > 0);
  //this.context.lineTo(this.x+this.w/2, this.y-this.h/2);
  this.context.fill();
};
OpticalElement.prototype.drawHandles = function() {
  for (var i = 0; i < this.mouseHandles.length; i++) this.mouseHandles[i].draw();
};
OpticalElement.prototype.pointWithin = function(x, y) {
  if (y < this.y - this.h*0.5) return 0; // above lens
  if (y > this.y + this.h*0.5) return 0; // below lens
  if (x < this.x - this.w*0.5 + Math.min(this.c1.dx, 0)) return 0; // left of anything
  if (x > this.x + this.w*0.5 + Math.max(this.c2.dx, 0)) return 0; // right of anything

  if (this.c1.dx < 0 && // left circle is convex
      x < this.x - this.w*0.5 && // x is left of the left edge of the base rectangle
      Math.pow(x-this.c1.x,2)+Math.pow(y-this.c1.y,2) > Math.pow(this.c1.r, 2)) // outside the left circle
      return 0;

  if (this.c1.dx > 0 && // left circle is concave
      Math.pow(x-this.c1.x,2)+Math.pow(y-this.c1.y,2) < Math.pow(this.c1.r, 2)) // inside the left circle
      return 0;

  if (this.c2.dx > 0 && // right circle is convex
      x > this.x + this.w*0.5 && // x is right of the right edge of the base rectangle
      Math.pow(x-this.c2.x,2)+Math.pow(y-this.c2.y,2) > Math.pow(this.c2.r, 2)) // outside the right circle
      return 0;

  if (this.c2.dx < 0 && // right circle is concave
      Math.pow(x-this.c2.x,2)+Math.pow(y-this.c2.y,2) < Math.pow(this.c2.r, 2)) // inside the right circle
      return 0;

  return 1;
};
function LightSource(context, objectManager, properties) {
	this.context = context;
  this.objectManager = objectManager;

	this.type = properties && properties.type !== undefined ? properties.type : 'sun';
	this.position = new Point2D(properties && properties.x !== undefined ? properties.x : 500,
	                            properties && properties.y !== undefined ? properties.y : 200);
	this.r = properties && properties.r !== undefined ? properties.r : 10;
	this.rays = properties && properties.rays !== undefined ? properties.rays   : 24;
	this.raycolor = properties && properties.raycolor !== undefined ? properties.raycolor : '';
	this.ang = properties && properties.ang !== undefined ? properties.ang : Math.PI;
  this.spray = properties && properties.spray !== undefined ? properties.spray : 0.1;
  this.spread = properties && properties.w !== undefined ? properties.w : 10;
	this.mouseHandles = [];

  this.initMouseHandles = function() {
    // origin - uses parent collision
    this.mouseHandles.push(new MouseHandle(context, this, {r: this.r, visible: false, useParentCollision: true})
      .addPropertyBinding(function() {
        this.position.x = this.parentObject.position.x;
        this.position.y = this.parentObject.position.y; })
      .addCallback(function() {
        this.parentObject.position.x = this.position.x;
        this.parentObject.position.y = this.position.y; })
    );

    // ray spread (width of offset orthogonal to angle of projection)
		this.mouseHandles.push(new MouseHandle(context, this)
      .addParent(this.mouseHandles[0])
      .addPropertyBinding(function() {
        this.position.x = this.parentObject.position.x - Math.sin(this.parentObject.ang) * this.parentObject.spread;
        this.position.y = this.parentObject.position.y + Math.cos(this.parentObject.ang) * this.parentObject.spread; })
      .addConstraint(new RayConstraint(
        new Ray2D(
          new Point2D(
            (function() { return this.position.x; }).bind(this),
            (function() { return this.position.y; }).bind(this)),
          new Vector2D(
            (function() { return -Math.sin(this.ang); }).bind(this),
            (function() { return  Math.cos(this.ang); }).bind(this)))))
      .addCallback(function() {
        this.parentObject.spread = Vector2D.prototype.distanceAlong.call(
                                     Vector2D.prototype.minus.call(this.parentObject.position, this.position),
                                     {x: Math.sin(this.parentObject.ang), y: -Math.cos(this.parentObject.ang)}); })
    );

    // ray spray (difference in max and min ray angle) &
    // rotation
		this.mouseHandles.push(new MouseHandle(context, this, {x: 0, y: 0})
      .addParent(this.mouseHandles[0])
      .initProperty('sprayScalar', 0.05) // value used for scaling distance from light to angle
      .addPropertyBinding(function() {
        this.position.x = this.parentObject.position.x + Math.cos(this.parentObject.ang) * (2 * Math.PI - this.parentObject.spray) / this._sprayScalar;
        this.position.y = this.parentObject.position.y + Math.sin(this.parentObject.ang) * (2 * Math.PI -  this.parentObject.spray) / this._sprayScalar; })
      .addConstraint(new DistanceConstraint(
        new Point2D(
          (function() { return this.position.x; }).bind(this),
          (function() { return this.position.y; }).bind(this)),
        0,
        function() { return (Math.PI * 2) / this._sprayScalar; } ))
      .addCallback(function() {
        this.parentObject.spray = Math.PI * 2 - Point2D.prototype.distanceTo.call(this.parentObject.position, this.position) * this._sprayScalar;
        this.parentObject.ang = Vector2D.prototype.angleBetween.call({x: 1, y: 0},
          Vector2D.prototype.minus.call(this.position, this.parentObject.position)); })
    );
	};

	this.initMouseHandles();
  this.updateMouseHandles();
}
LightSource.prototype.updateMouseHandles = function() {
  for (var h = 0; h < this.mouseHandles.length; h++) this.mouseHandles[h].applyBindings();
}
LightSource.prototype.pointWithin = function(x, y) {
   return Math.pow(x-this.position.x,2)+Math.pow(y-this.position.y,2)<=Math.pow(this.r,2);
};
LightSource.prototype.draw = function() {
  switch(this.type) {
    case 'sun':
      this.drawRaysSun(this.objectManager.getType('OpticalElement'));
      break;
    case 'spot':
      this.drawRaysSpot(this.objectManager.getType('OpticalElement'));
      break;
  }

  this.context.lineWidth = 0.5;
  this.context.fillStyle = (this.raycolor === '' ? '#FFFFAA' : this.raycolor);

  this.context.beginPath();
  this.context.moveTo(this.position.x+this.r, this.position.y);
  this.context.fillStyle = this.objectManager.clearColor;
  this.context.arc(this.position.x, this.position.y, this.r, 0, 2*Math.PI, false);
  this.context.fill();
  this.context.fillStyle = (this.raycolor === '' ? '#FFFFAA' : this.raycolor);
  this.context.arc(this.position.x, this.position.y, this.r, 0, 2*Math.PI, false);
  this.context.fill();
};
LightSource.prototype.drawRaySeg = function(OpticalElements, origin, angle, sensitivity, allowInternalRefraction) {
  var origin_new = origin;
  var angle_new = angle;
  var p_int = null; var t_int = null; var nr_int = null; var d = 0; var ap1 = 0; var ap2 = 0; var amax = 0; var amin = 0; var i; var intElem; var p;

  var minlen = Infinity;
  this.context.beginPath();
  this.context.moveTo(origin.x, origin.y);

  // determine closest intersection with lens and calculate point of intersection, tangleent, direction and refractive index
  if (typeof OpticalElements !== undefined) {
    for (i = 0, intElem = false; i < OpticalElements.length; i++, intElem = false) {
      //top (line)
      p = intersectionLineLine(OpticalElements[i].x-OpticalElements[i].w/2, OpticalElements[i].y-OpticalElements[i].h/2, OpticalElements[i].x+OpticalElements[i].w/2, OpticalElements[i].y-OpticalElements[i].h/2, origin.x, origin.y, origin.x+Math.cos(angle), origin.y+Math.sin(angle));
      if (p !== null && p.x >= OpticalElements[i].x-OpticalElements[i].w/2 && p.x <= OpticalElements[i].x+OpticalElements[i].w/2 && (p.x == origin.x || Math.sign(p.x-origin.x) == Math.sign(Math.cos(angle))) && (p.y == origin.y || Math.sign(p.y-origin.y) == Math.sign(Math.sin(angle)))) {
        d = (p.x-origin.x)*Math.cos(angle)+(p.y-origin.y)*Math.sin(angle);
        if (d >= sensitivity && d < minlen) { intElem = true; minlen = d; p_int = {x:p.x, y:p.y}; t_int = p.t1; }
      }

      //bottom (line)
      p = intersectionLineLine(OpticalElements[i].x-OpticalElements[i].w/2, OpticalElements[i].y+OpticalElements[i].h/2, OpticalElements[i].x+OpticalElements[i].w/2, OpticalElements[i].y+OpticalElements[i].h/2, origin.x, origin.y, origin.x+Math.cos(angle), origin.y+Math.sin(angle));
      if (p !== null && p.x >= OpticalElements[i].x-OpticalElements[i].w/2 && p.x <= OpticalElements[i].x+OpticalElements[i].w/2 && (p.x == origin.x || Math.sign(p.x-origin.x) == Math.sign(Math.cos(angle))) && (p.y == origin.y ||  Math.sign(p.y-origin.y) == Math.sign(Math.sin(angle)))) {
        d = (p.x-origin.x)*Math.cos(angle)+(p.y-origin.y)*Math.sin(angle);
        if (d >= sensitivity && d < minlen) { intElem = true; minlen = d; p_int = {x:p.x, y:p.y}; t_int = p.t1; }
      }

      // left arc (circle)
      p = intersectionLineCircle(origin.x, origin.y, origin.x+Math.cos(angle), origin.y+Math.sin(angle), OpticalElements[i].c1.x, OpticalElements[i].c1.y, OpticalElements[i].c1.r);
      if (p !== null) {
        ap1 = Math.acos((p.p1.x-OpticalElements[i].c1.x)/Math.sqrt(Math.pow(p.p1.x-OpticalElements[i].c1.x, 2)+Math.pow(p.p1.y-OpticalElements[i].c1.y, 2)));
        ap2 = Math.acos((p.p2.x-OpticalElements[i].c1.x)/Math.sqrt(Math.pow(p.p2.x-OpticalElements[i].c1.x, 2)+Math.pow(p.p2.y-OpticalElements[i].c1.y, 2)));
        amax = OpticalElements[i].c1.dx > 0 ? OpticalElements[i].c1.a1 : OpticalElements[i].c1.a2;
        amin = OpticalElements[i].c1.dx > 0 ? OpticalElements[i].c1.a2 : OpticalElements[i].c1.a1;
        if (angleBetween(ap1, amin, amax)) {
          d = (p.p1.x-origin.x)*Math.cos(angle)+(p.p1.y-origin.y)*Math.sin(angle);
          if (d >= sensitivity && d < minlen) { intElem = true; minlen = d; p_int = {x:p.p1.x, y:p.p1.y}; t_int = p.p1.t; }
        }
        if (angleBetween(ap2, amin, amax)) {
          d = (p.p2.x-origin.x)*Math.cos(angle)+(p.p2.y-origin.y)*Math.sin(angle);
          if (d >= sensitivity && d < minlen) { intElem = true; minlen = d; p_int = {x:p.p2.x, y:p.p2.y}; t_int = p.p2.t; }
        }
      }

      // right arc (circle)
      p = intersectionLineCircle(origin.x, origin.y, origin.x+Math.cos(angle), origin.y+Math.sin(angle), OpticalElements[i].c2.x, OpticalElements[i].c2.y, OpticalElements[i].c2.r);
      if (p !== null) {
        ap1 = Math.acos((p.p1.x-OpticalElements[i].c2.x)/Math.sqrt(Math.pow(p.p1.x-OpticalElements[i].c2.x, 2)+Math.pow(p.p1.y-OpticalElements[i].c2.y, 2)));
        ap2 = Math.acos((p.p2.x-OpticalElements[i].c2.x)/Math.sqrt(Math.pow(p.p2.x-OpticalElements[i].c2.x, 2)+Math.pow(p.p2.y-OpticalElements[i].c2.y, 2)));
        amax = OpticalElements[i].c2.dx < 0 ? OpticalElements[i].c2.a1 : OpticalElements[i].c2.a2;
        amin = OpticalElements[i].c2.dx < 0 ? OpticalElements[i].c2.a2 : OpticalElements[i].c2.a1;
        if (angleBetween(ap1, amin, amax)) {
          d = (p.p1.x-origin.x)*Math.cos(angle)+(p.p1.y-origin.y)*Math.sin(angle);
          if (d >= sensitivity && d < minlen) { intElem = true; minlen = d; p_int = {x:p.p1.x, y:p.p1.y}; t_int = p.p1.t; }
        }
        if (angleBetween(ap2, amin, amax)) {
          d = (p.p2.x-origin.x)*Math.cos(angle)+(p.p2.y-origin.y)*Math.sin(angle);
          if (d >= sensitivity && d < minlen) { intElem = true; minlen = d; p_int = {x:p.p2.x, y:p.p2.y}; t_int = p.p2.t; }
        }
      }

      // update the refractive index ratio if this element was intersected with a new closest intersection
      if (intElem) {
        nr_int = Math.pow(OpticalElements[i].refidx / 1.0, OpticalElements[i].pointWithin(p_int.x + Math.cos(angle) * sensitivity, p_int.y + Math.sin(angle) * sensitivity) ? -1 : 1);
      }
    }
  }

  // draw segment
  this.context.lineTo(origin.x+Math.cos(angle)*(minlen == Infinity ? 100000 : minlen), origin.y+Math.sin(angle)*(minlen == Infinity ? 100000 : minlen));
  this.context.stroke();

  // turn red and draw next segment after passing through something
  if (minlen != Infinity) {
    // calculate outgoing anglele after contact
    origin_new = p_int;
    var angle_incoming = Math.PI * 0.5 - (angle - t_int + Math.PI * 1.5) % Math.PI;
    var asin_in = nr_int * Math.sin(angle_incoming);
    if (Math.abs(asin_in) > 1) {
      if (allowInternalRefraction)
        angle_new = (angle + Math.PI) + 2 * angle_incoming; // used for internal reflection of rays
      else
        return null;
    } else {
      var angle_outgoing = Math.asin(asin_in);
      angle_new = angle + angle_incoming - angle_outgoing;
    }

    // Some troubOpticalElementshooting geometry
    if (0) {
      this.context.beginPath();
      this.context.strokeStyle = '#BBBBBB';
      this.context.moveTo(p_int.x - Math.cos(t_int) * 40, p_int.y - Math.sin(t_int) * 40);
      this.context.lineTo(p_int.x + Math.cos(t_int) * 40, p_int.y + Math.sin(t_int) * 40);
      this.context.stroke();

      // Draw surface tangleent angle
      this.context.beginPath();
      this.context.strokeStyle = '#FF4444';
      var angle_base = Math.min(0, t_int);
      var angle_arc = Math.max(0, t_int);
      this.context.arc(p_int.x, p_int.y, 20, angle_base, angle_arc, false);
      this.context.stroke();

      // Draw incoming ray angle
      this.context.beginPath();
      this.context.strokeStyle = '#44FF44';
      var angle_base = 0;
      var angle_arc = Math.abs(Math.PI * 0.5 - ((angle + Math.PI * 0.5) % Math.PI));
      this.context.arc(p_int.x, p_int.y, 18, angle_base, angle_arc, false);
      this.context.stroke();

      // Draw incoming ray contact angle
      this.context.beginPath()
      this.context.strokeStyle = '#4444FF';
      var angle_base = 0;
      var angle_arc = Math.PI * 0.5 - (angle - t_int + Math.PI * 0.5) % Math.PI;
      this.context.arc(p_int.x, p_int.y, 15, angle_base, angle_arc, false);
      this.context.stroke();
    }
    this.drawRaySeg(OpticalElements, origin_new, angle_new, sensitivity, allowInternalRefraction);
  }
};
LightSource.prototype.drawRaysSun = function(OpticalElements) {
  for (var i = 0; i < this.rays; i++) {
    this.context.lineWidth = 0.5;
    this.context.fillStyle = 'none';
    this.context.strokeStyle = (this.raycolor === '' ? HSVtoHEX(i/this.rays, 0.3, 1.0) : this.raycolor);
    this.drawRaySeg(OpticalElements, {x:this.position.x, y:this.position.y}, i/this.rays*2*Math.PI, 0.0001, false);
  }
};
LightSource.prototype.drawRaysSpot = function(OpticalElements) {
  for (var i = 0; i < this.rays; i++) {
    this.context.lineWidth = 0.5;
    this.context.fillStyle = 'none';
    this.context.strokeStyle = (this.raycolor === '' ? HSVtoHEX(i/this.rays, 0.3, 1.0) : this.raycolor);
    this.drawRaySeg(OpticalElements,
                    {x:this.position.x+Math.sin(this.ang)*this.spread*2*(i-(this.rays-1)*0.5)/this.rays,
                     y:this.position.y-Math.cos(this.ang)*this.spread*2*(i-(this.rays-1)*0.5)/this.rays},
                    this.ang+this.spray*((this.rays-1)*0.5-i)/this.rays, 0.0001, false);
  }
};
LightSource.prototype.drawHandles = function() {
  for (var i = 0; i < this.mouseHandles.length; i++) this.mouseHandles[i].draw();
};
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
	if (invdenom === 0) { return null; } else { invdenom = 1/invdenom; }
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
};

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
function rgba(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}
rgba.prototype.toString = function() {
  if (this.a === undefined) return 'rgb('+this.r+','+this.g+','+this.b+')';
  else return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
}
rgba.prototype.atOpacity = function(opacity) {
  return new rgba(this.r, this.g, this.b, opacity);
}
rgba.prototype.atOpacityFactor = function(factor) {
  return new rgba(this.r, this.g, this.b, this.a !== undefined ? this.a * factor : factor);
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
};
