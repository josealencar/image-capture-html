(function() {
  var FileSaver = require('file-saver');
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = window.innerWidth;    // We will scale the photo width to this
  var height = window.innerHeight;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var startagain = null;
  var savepic = null;
  var devicesAvailable = null;
  var deviceUse = null;
  var canShowSwitchCamera = false;

  function startCapture(constrains) {
    navigator.getMedia(
      constrains,
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
      
        video.setAttribute('width', window.innerWidth);
        video.setAttribute('height', window.innerHeight);
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
        streaming = true;
      }
    }, false);
  }

  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');
    startagain = document.getElementById('startagain');
    savepic = document.getElementById('savepic');
    switchcamera = document.getElementById('switchcamera');

    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

    
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
				devicesAvailable = devices.filter(function(device) {
					var deviceLabel = device.label.split(',')[1];
					if (device.kind == "videoinput") {
						return device;
					}
				});

				if (devicesAvailable.length > 1) {
          deviceUse = 1;
					var constraints = {
						video: {
							mandatory: {
								sourceId: devicesAvailable[1].deviceId ? devicesAvailable[1].deviceId : null
							}
						},
						audio: false
					};

					startCapture(constraints);
				}
				else if (devicesAvailable.length) {
          deviceUse = 0;
					var constraints = {
						video: {
							mandatory: {
								sourceId: devicesAvailable[0].deviceId ? devicesAvailable[0].deviceId : null
							}
						},
						audio: false
					};

					startCapture(constraints);
				}
				else {
					startCapture({video:true});
				}
			})
			.catch(function (error) {
				console.error("Error occurred : ", error);
    });

    startbutton.addEventListener('click', function(ev){
      takepicture();
      ev.preventDefault();
    }, false);

    startagain.addEventListener('click', function(ev){
      showTakePicture();
      ev.preventDefault();
    }, false);

    savepic.addEventListener('click', function(ev){
      savePicture();
      ev.preventDefault();
    }, false);

    switchcamera.addEventListener('click', function(ev){
      switchCamera();
      ev.preventDefault();
    }, false);
    
    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
  
  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
      showPhoto();
    } else {
      clearphoto();
    }
  }

  // Custom
  function enableSwitchCamera() {
    document.getElementById('switchcamera').style.display = 'inline-block';
  }

  function disableSwitchCamera() {
    document.getElementById('switchcamera').style.display = 'none';
  }

  function showPhoto() {
    document.getElementById('output').style.display = 'block';
    document.getElementById('camera').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';

    var elementsToShow = document.getElementsByClassName('btn-show');
    for (var i = 0; i < elementsToShow.length; i++) {
      elementsToShow[i].style.display = 'inline-block';
    }

    var elementsToHide = document.getElementsByClassName('btn-pic');
    for (var o = 0; o < elementsToHide.length; o++) {
      elementsToHide[o].style.display = 'none';
    }
    disableSwitchCamera();
  }

  function showTakePicture() {
    document.getElementById('output').style.display = 'none';
    document.getElementById('camera').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    var elementsToShow = document.getElementsByClassName('btn-pic');
    for (var i = 0; i < elementsToShow.length; i++) {
      elementsToShow[i].style.display = 'inline-block';
    }

    var elementsToHide = document.getElementsByClassName('btn-show');
    for (var o = 0; o < elementsToHide.length; o++) {
      elementsToHide[o].style.display = 'none';
    }

    if (canShowSwitchCamera) {
      enableSwitchCamera();
    }
  }

  function savePicture() {
    ctx = canvas.getContext("2d");
    // draw to canvas...
    canvas.toBlob(function(blob) {
        FileSaver.saveAs(blob, "exemplo.png");
    });
  }

  function switchCamera() {
    if (devicesAvailable.length > 0) {
      switch (deviceUse) {
        case 0:
          deviceUse = 1;
          var constraints = {
						video: {
							mandatory: {
								sourceId: devicesAvailable[1].deviceId ? devicesAvailable[1].deviceId : null
							}
						},
						audio: false
					};

					startCapture(constraints);
          break;
        case 1:
          deviceUse = 0;
          var constraints = {
						video: {
							mandatory: {
								sourceId: devicesAvailable[0].deviceId ? devicesAvailable[0].deviceId : null
							}
						},
						audio: false
					};

					startCapture(constraints);
          break;
        default:
          break;
      }
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();