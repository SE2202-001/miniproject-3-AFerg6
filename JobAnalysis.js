//definining document elements
const fileInput = document.getElementById("fileInput");
const fileStatusText = document.getElementById("fileStatus");
const filterMenu = document.getElementById("filterMenu");
const container = document.getElementById('jobListContainer'); 
const sortBox = document.getElementById('Sort');
const filterButton = document.getElementById('FilterButton');
const levelFilter = document.getElementById('Level');
const typeFilter = document.getElementById('Type');
const skillFilter = document.getElementById('Skill');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popupMessage');
const closeButton = document.getElementById('closeButton');

//define global variables
let jobsList = [];
let fullJobList;
let prevSort;

//event listener to change the ui when a json file is loaded
fileInput.addEventListener('change', function(event){
  var userFile = event.target.files[0];
  var fileParts= userFile.name.split(".");
  var fileExtension = fileParts[1];
  
  
  //varifies json file and prompts user to input correct filetype otherwise
  if(fileExtension != "json"){
    fileStatusText.textContent = "Incorrect file type please select a json file";
    fileStatusText.style.display = "block";
    filterMenu.style.display = "none";
  }else{
    //displays menu for filters and hides error message line
    fileStatusText.textContent = "";
    fileStatusText.style.display = "none";
    filterMenu.style.display = "block";

    //reader to read input file
    const reader = new FileReader();

    reader.onload = function(event) {
      //tries to load input file and throws error on issue
      try {

          jobsList = JSON.parse(event.target.result); // Parse JSON directly
          jobsList = filterDupes(jobsList); //filters out dupes
          fullJobList = JSON.parse(JSON.stringify(jobsList)); //creates a deep copy to reset list after being filtered
          sortList(jobsList);
          
          //resets filters to defaults 
          levelFilter.innerHTML = `<option value="all">All</option>`;
          typeFilter.innerHTML = `<option value="all">All</option>`;
          skillFilter.innerHTML = `<option value="all">All</option>`;

          //gets list of filters for each category
          let filterLists = getFilters(jobsList);
          let levelList = [...filterLists[0]];
          let typeList = [...filterLists[1]];
          let skillList = [...filterLists[2]];
          
          //adds filters to respective dropdown
          levelList.forEach(str => {
            let option = document.createElement("option");
            option.value = str;
            option.textContent = str;
            levelFilter.appendChild(option);
          });

          typeList.forEach(str => {
            let option = document.createElement("option");
            option.value = str;
            option.textContent = str;
            typeFilter.appendChild(option);
          });

          skillList.forEach(str => {
            let option = document.createElement("option");
            option.value = str;
            option.textContent = str;
            skillFilter.appendChild(option);
          });

      } catch (error) {
        //error handeling 
        console.error('Error parsing JSON:', error);
        fileStatusText.textContent = "There was an error loading this file please try another file";
        fileStatusText.style.display = "block";
        filterMenu.style.display = "none";
      }
    };

    reader.onerror = function() {
      console.error('Error reading file:', reader.error);
    };
  
    reader.readAsText(userFile); // Read the file as text
  }  
});

//sorts list to follow current option on dropdown
sortBox.addEventListener('change', () => sortList(jobsList));

//filters list on clicked
filterButton.addEventListener('click', function(){
  jobsList = JSON.parse(JSON.stringify(fullJobList)); //resests list to full unfiltered list 
  
  //sets filters equal to value in filter dropdowns
  const filters = {
    type: typeFilter.value,  
    level: levelFilter.value,             
    skill: skillFilter.value               
  };
  
  //filters list based on filters obj
  //filter with value all is ignored in filter
  const filteredJobs = jobsList.filter(job => 
    (filters.type !== 'all' ? job.Type === filters.type : true) &&
    (filters.level !== 'all' ? job.Level === filters.level : true) &&
    (filters.skill !== 'all' ? job.Skill === filters.skill : true)
  );

  //deep clones filtered list and makes clone joblist to prevent accidental linking of lists
  //displays new list
  jobsList = JSON.parse(JSON.stringify(filteredJobs));
  displayJobs(jobsList);
  
});

//event to close popup
closeButton.addEventListener('click', function() {
  popup.style.display = 'none'; // Hide the popup by setting display to none
});
//adds each job as an element to the list html element
function displayJobs(inpList) {
  container.innerHTML = ''; // Clear previous content

  //creates element to hold jobs
  const ul = document.createElement('ul');
  ul.classList.add('job-list');

  //adds each job to ul element
  inpList.forEach(job => {
    const li = document.createElement('li');
    li.classList.add('job-item');

    li.innerHTML = `
      <div class="job-title">${job["Title"]}</div>
      <div class="job-details">
        ${job["Type"]} - <span class="job-level">${job["Level"]}</span>
      </div>
    `;

    li.addEventListener('click', function() {
      showPopup(job);  
    });

    ul.appendChild(li);
  });

  container.appendChild(ul);


}

//filters out duplicate jobs so only one is posted
function filterDupes(inpList) {
  // Verify that input is an array
  if (!Array.isArray(inpList)) {
    throw new TypeError("Input must be an array.");
  }

  // Define list to hold filtered list and index of duplicate items to skip over
  let filteredList = [];
  let skipIndex = new Set();

  // Iterate through the list
  for (let i = 0; i < inpList.length; i++) {

    // Skip over items that have been flagged as duplicates
    if (skipIndex.has(i)) continue;

    let objA = inpList[i];

    // Compare with subsequent items
    for (let j = i + 1; j < inpList.length; j++) {

      // Skip over items that have been flagged as duplicates
      if (skipIndex.has(j)) continue;

      let objB = inpList[j];

      // If an object is a duplicate, add its index to the skipIndex
      if (Object.keys(objA).every(key => objA[key] === objB[key])) {
        skipIndex.add(j); // Flag as duplicate
      }
    }

    // Add the non-duplicate object to the filtered list
    filteredList.push(objA);
  }

  return filteredList;
}

//sorts inputted list
function sortList(inpList) {
  let currentSort = sortBox.value;
  if (currentSort === prevSort) return; // skips sorting if same sort is chosen

  if (currentSort === "Newest") {
    //to sort with alpha subsort must first sort by alpha then sort by posted time
    switch(prevSort){
      //invert to be alpha
      case "ZA":
        inpList.reverse();
        break;

        //no need to sort
      case "AZ":
        break;

      //must be sorted by oldest therefore must be resorted by alpha 
      default:
        inpList.sort((a, b) => compareTo(a["Title"].toLowerCase(), b["Title"].toLowerCase()));
        break;
    }

    //sort by posted date 
    inpList.sort((a, b) => compareTo(dateToStandard(a["Posted"]), dateToStandard(b["Posted"])));


  }else if(currentSort == "Oldest"){
    //to sort with alphabetical subsorting 
    //first sorted to inverse alpha, then sorted to date(newest) and flipped making oldest and aplha sub sorted
    switch(prevSort){
      
      //flips to be in reverse alpha
      case "AZ":
        inpList.reverse();
        break;

      //already in reverse alpha
      case "ZA":
        break;

      //have to reset to inverse alpha if not already in any alpha sorting
      default:
        inpList.sort((a, b) => compareTo(a["Title"].toLowerCase(), b["Title"].toLowerCase()));
        inpList.reverse();
        break;
    }

    //sort by posted date then invert
    inpList.sort((a, b) => compareTo(dateToStandard(a["Posted"]), dateToStandard(b["Posted"])));
    inpList.reverse();
    



  } else if (currentSort === "AZ" || currentSort === "ZA") {
    // Sort alphabetically (case-insensitive), but skip if already sorted alphabetically
    if (prevSort !== "AZ" && prevSort !== "ZA") {
      inpList.sort((a, b) => compareTo(a["Title"].toLowerCase(), b["Title"].toLowerCase()));
    }

    // Reverse the list if switching to "ZA" or if switching from "ZA" to "AZ"
    if (currentSort === "ZA" || (currentSort === "AZ" && prevSort === "ZA")) {
      inpList.reverse();
    }
  }

  //displays sorted list and updates previous sort
  displayJobs(inpList);
  prevSort = currentSort;
}

//converts given date to a standard unit of minutes for sorting
function dateToStandard(date) {
  let dateParts = date.split(" ");
  let value = parseInt(dateParts[0], 10); 
  let unit = dateParts[1];

  switch (unit) {
    case "minute":
    case "minutes":
      return value;  //dont need to convert to minutes
    case "hour":
    case "hours":
      return value * 60;  //converts hours to min
    case "day":
    case "days":
      return value * 24 * 60; //converts days to hours to min
    default:
      return 0; // Handle unexpected units
  }
}

//basic compareto function
function compareTo(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

//looks through inputed list to get avalible filters
function getFilters(inpList) {
  //made sets to auto filter out dupes
  let levelSet = new Set();
  let typeSet = new Set();
  let skillSet = new Set();

  //adds filtered properties to filter sets
  for (let i = 0; i < inpList.length; i++) {
    let job = inpList[i];
    levelSet.add(job["Level"]);
    typeSet.add(job["Type"]);
    skillSet.add(job["Skill"]);
  }

  return  [levelSet, typeSet, skillSet];
}

function showPopup(job) {
  //setup text for popup
  popupMessage.textContent = `
      Title: ${job.Title}
      Type: ${job.Type}
      Level: ${job.Level}
      Estimated Time: ${job["Estimated Time"]}
      Skill: ${job.Skill}
      Detail: ${job.Detail}\n
      Job Link: ${job["Job Page Link"]}\n
      Posted: ${job.Posted}\n
  `;
  popup.style.display = 'flex';  // Show the popup

}