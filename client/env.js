var env = function(){ // Container function, invoked immediately.

  // Basic Objects
  var camera, scene, renderer, effect;
  var geometry, material, mesh;
  var controls; // VR camera controls
  var controlObj; // camera holder / head object

  var FPControls = new THREE.FPControls(); // Add FP Controls library

  // Collision
  var objects = [];
  var raycaster;

  overLay();
  init();
  animate();

  // Movement bools
  var controlsEnabled = true;
  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var rotateLeft = false;
  var rotateRight = false;

  // Animation
  var prevTime = performance.now();
  var velocity = new THREE.Vector3();

  // Set up basic scene
  function init() {

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor( 0xffffff ); // Set Sky Color

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    // Camera, effect = VR dual cameras
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    effect = new THREE.VREffect( renderer );
    effect.setSize( window.innerWidth, window.innerHeight );

    /* 
      Mouse Controls

      controls = new THREE.PointerLockControls( camera );
      scene.add(controls.getObject());
    */

    // Head
    controlObj = new THREE.Object3D();
    controlObj.add( camera ); // add camera to the head
    scene.add(controlObj);

    // Attach VR Controls to camera
    controls = new THREE.VRControls (camera);

   // Lighting
    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    window.addEventListener( 'resize', onWindowResize, false );

    // Add Key event listeners
    var onKeyDown = function ( event ) {

      switch ( event.keyCode ) {

        case 69: // e
          rotateRight = true;
          break;

        case 81: // q
          rotateLeft = true;
          break;

        case 38: // up
        case 87: // w
          moveForward = true;
          break;

        case 37: // left
        case 65: // a
          moveLeft = true; break;

        case 40: // down
        case 83: // s
          moveBackward = true;
          break;

        case 39: // right
        case 68: // d
          moveRight = true;
          break;

        case 32: // space
          if ( canJump === true ) velocity.y += 150;
          canJump = false;
          break;

        case 86: // v
          toggleVR();
          break;

      }

    };

    var onKeyUp = function ( event ) {

      switch( event.keyCode ) {

        case 69: // e
          rotateRight = false;
          break;

        case 81: // q
          rotateLeft = false;
          break;

        case 38: // up
        case 87: // w
          moveForward = false;
          break;

        case 37: // left
        case 65: // a
          moveLeft = false;
          break;

        case 40: // down
        case 83: // s
          moveBackward = false;
          break;

        case 39: // right
        case 68: // d
          moveRight = false;
          break;
      }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );    


    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    // floor
    geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    // Add bumpiness to floor
    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
      var vertex = geometry.vertices[ i ];
      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;
    }

    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
      var face = geometry.faces[ i ];
      face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    }

    var floorMaterial = new THREE.MeshBasicMaterial( {color: 0x228c14} );

    floorMesh = new THREE.Mesh( geometry, floorMaterial );
    floorMesh.position.y = -40;
    scene.add( floorMesh );

    var geo = new THREE.BoxGeometry(20,20,20);
    var material = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading });
    var mesh = new THREE.Mesh(geo,material);
    mesh.position.x = -10;
    mesh.position.z = -40;
    scene.add(mesh);
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // renderer.setSize( window.innerWidth, window.innerHeight );
    effect.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    requestAnimationFrame( animate );
    VRMovement();
    effect.render( scene, camera );
    controls.update();
    
    // KeyboardMovement();
    // renderer.render(scene, camera);
  };


  function VRMovement(){
      if ( controlsEnabled ) {
      raycaster.ray.origin.copy( camera.position );
      raycaster.ray.origin.y -= 10;

      var intersections = raycaster.intersectObjects( objects );

      var isOnObject = intersections.length > 0;

      var time = performance.now();
      var delta = ( time - prevTime ) / 1000;

      velocity.x -= velocity.x * 4.0 * delta;
      velocity.z -= velocity.z * 4.0 * delta;

      // velocity.y -= 9.8 * 35.0 * delta; // 35.0 = mass

      var speed = 400.0;

      if ( moveForward ) velocity.z -= speed * delta;
      if ( moveBackward ) velocity.z += speed * delta;
      if ( moveLeft ) velocity.x -= speed * delta;
      if ( moveRight ) velocity.x += speed * delta;

      // Manual rotation
      if ( rotateLeft ) {
        controlObj.rotation.y += delta;
      }
      if ( rotateRight ) {
        controlObj.rotation.y -= delta;
      }


      if(moveForward || moveBackward || moveLeft || moveRight){ // IF MOVING
      }

      if ( isOnObject === true ) {
        velocity.y = Math.max( 0, velocity.y );
        canJump = true;
      }

      controlObj.translateX( velocity.x * delta );
      controlObj.translateY( velocity.y * delta );
      controlObj.translateZ( velocity.z * delta );

      if ( controlObj.position.y < 10  || controlObj.position.y > 10) {
        velocity.y = 0;
        controlObj.position.y = 10;
        canJump = true;
      }

      prevTime = time;

    }
  };


  function KeyboardMovement(){
    if ( controlsEnabled ) {
      raycaster.ray.origin.copy( controls.getObject().position );
      raycaster.ray.origin.y -= 10;

      var intersections = raycaster.intersectObjects( objects );

      var isOnObject = intersections.length > 0;

      var time = performance.now();
      var delta = ( time - prevTime ) / 1000;

      velocity.x -= velocity.x * 4.0 * delta;
      velocity.z -= velocity.z * 4.0 * delta;

      velocity.y -= 9.8 * 35.0 * delta; // 35.0 = mass

      var speed = 400.0;

      if ( moveForward ) velocity.z -= speed * delta;
      if ( moveBackward ) velocity.z += speed * delta;
      if ( moveLeft ) velocity.x -= speed * delta;
      if ( moveRight ) velocity.x += speed * delta;

      if(moveForward || moveBackward || moveLeft || moveRight){ // IF MOVING

      }


      if ( isOnObject === true ) {
        velocity.y = Math.max( 0, velocity.y );
        canJump = true;
      }

      controls.getObject().translateX( velocity.x * delta );
      controls.getObject().translateY( velocity.y * delta );
      controls.getObject().translateZ( velocity.z * delta );

      if ( controls.getObject().position.y < 10 ) {

        velocity.y = 0;
        controls.getObject().position.y = 10;

        canJump = true;
      }

      prevTime = time;

    }
  };

  function overLay(){
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );

    blocker.style.display = 'none';
    instructions.style.display = 'none';

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

      var element = document.body;

      var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

          controlsEnabled = true;
          controls.enabled = true;

          blocker.style.display = 'none';

        } else {

          controls.enabled = false;

          blocker.style.display = '-webkit-box';
          blocker.style.display = '-moz-box';
          blocker.style.display = 'box';

          instructions.style.display = '';

        }

      }

      var pointerlockerror = function ( event ) {

        instructions.style.display = '';

      }

      // Hook pointer lock state change events
      document.addEventListener( 'pointerlockchange', pointerlockchange, false );
      document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
      document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

      document.addEventListener( 'pointerlockerror', pointerlockerror, false );
      document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
      document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

      instructions.addEventListener( 'click', function ( event ) {

        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        if ( /Firefox/i.test( navigator.userAgent ) ) {

          var fullscreenchange = function ( event ) {
            if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

              document.removeEventListener( 'fullscreenchange', fullscreenchange );
              document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
              
              element.requestPointerLock();
            }
          }

          document.addEventListener( 'fullscreenchange', fullscreenchange, false );
          document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

          element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

          element.requestFullscreen();

        } else {

          element.requestPointerLock();

        }

      }, false );

    } else {

      instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }
  };

}();
