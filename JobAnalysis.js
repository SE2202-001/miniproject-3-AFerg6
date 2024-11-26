let fileInput = document.getElementById("fileInput");
let fileStatusText = document.getElementById("fileStatus")

fileInput.addEventListener('change', function(){
    var file = target.file;
    var extension = target.extension;

    if(file != null){
        fileStatusText.textContent("file loaded");
    }else{
        fileStatusText.textContent("no file loaded");
    }
})