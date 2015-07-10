THREE.FPControls = function(){

  

  this.events = function(){
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
  }

  this.events();

};
    