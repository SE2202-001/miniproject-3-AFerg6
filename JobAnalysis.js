//definining document elements
let fileInput = document.getElementById("fileInput");
let fileStatusText = document.getElementById("fileStatus");
let filterMenu = document.getElementById("filterMenu");


// class job {
//     constructor
// }


//event listener to change the ui when a json file is loaded
fileInput.addEventListener('change', function(event){
    var userFile = event.target.files[0];
    var fileParts= userFile.name.split(".");
    var fileExtension = fileParts[1];
    
    //varifies json file and prompts user to input correct filetype otherwise
    if(fileExtension != "json"){
        fileStatusText.textContent = "Incorrect file type please select a json file";
        fileStatusText.style.display = "block";
        filterMenu.style.display = "block";
    }else{
        fileStatusText.textContent = "";
        fileStatusText.style.display = "none";
        filterMenu.style.display = "flex";



        const reader = new FileReader();



    }
    
})