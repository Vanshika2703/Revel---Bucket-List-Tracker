var width = 500;    // We will scale the photo width to this
var height = 0;     // This will be computed based on the input stream
var streaming = false;
var count = 0;
video = document.getElementById('video');
canvas = document.getElementById('canvas');
photo = document.getElementById('photo');
var startbutton = document.getElementById('startbutton');

function startup() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });

    video.addEventListener('canplay', function(ev){
        if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width); 
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
        }
    }, false);

    clearphoto();
}

function stopVideo(stream) {
    stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.stop();
        }
    });
    count = 0;
}

startbutton.addEventListener('click', function(ev){
    ++count;
    if(count==1){
        startup()
    }else{
        takepicture();
    }
    ev.preventDefault();
}, false);

document.getElementById("btnAttachment").addEventListener('click', function(event){
    if(streaming){
        streaming = false;
        stopVideo(video.srcObject);
    }
})

document.getElementById("saveInfo").addEventListener('click', function(event){
    if(streaming){
        streaming = false;
        stopVideo(video.srcObject);
    }
})

document.getElementById("uncheck").addEventListener('click', function(event){
    if(streaming){
        streaming = false;
        stopVideo(video.srcObject);
    }
})

function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    // photo.setAttribute('src', data);
  }

function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        var dataURL = canvas.toDataURL('image/png');

        var blobBin = atob(dataURL.split(',')[1]);
        var array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var blob=new Blob([new Uint8Array(array)], {type: 'image/png'});
        console.log("hecflekckck: ", blob);

        var file = blobToFile(blob, "custom_photo");
        console.log("ihawdiwaD: ", file);

        // var formdata = new FormData();
        // formdata.append("myNewFileName", file);
        // $.ajax({
        //     url: "uploadFile.php",
        //     type: "POST",
        //     data: formdata,
        //     processData: false,
        //     contentType: false,
        // }).done(function(respond){
        //     console.log("heckckckck: ", respond);
        //     alert(respond);
        //     fileSelected(respond);
        // });

        
        pictureTaken(file);
      
    //   photo.setAttribute('src', data);
    } else {
      clearphoto();
    }
  }

function blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}

