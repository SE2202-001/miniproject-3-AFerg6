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
    fileStatusText.textContent = "";
    fileStatusText.style.display = "none";
    filterMenu.style.display = "block";

    const reader = new FileReader();

    reader.onload = function(event) {
      try {
          jobsList = JSON.parse(event.target.result); // Parse JSON directly
          jobsList = filterDupes(jobsList); //filters out dupes
          fullJobList = JSON.parse(JSON.stringify(jobsList)); //creates a deep copy to reset list after being filtered
          sortList(jobsList);
          
          levelFilter.innerHTML = `<option value="all">All</option>`;
          typeFilter.innerHTML = `<option value="all">All</option>`;
          skillFilter.innerHTML = `<option value="all">All</option>`;

          let filterLists = getFilters(jobsList);
          let levelList = [...filterLists[0]];
          let typeList = [...filterLists[1]];
          let skillList = [...filterLists[2]];
          
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

sortBox.addEventListener('change', () => sortList(jobsList));

filterButton.addEventListener('click', function(){
  jobsList = JSON.parse(JSON.stringify(fullJobList)); //resests list to full unfiltered list 
  
  const filters = {
    type: typeFilter.value,  
    level: levelFilter.value,             
    skill: skillFilter.value               
  };
  
  const filteredJobs = jobsList.filter(job => 
    (filters.type !== 'all' ? job.Type === filters.type : true) &&
    (filters.level !== 'all' ? job.Level === filters.level : true) &&
    (filters.skill !== 'all' ? job.Skill === filters.skill : true)
  );

  jobsList = JSON.parse(JSON.stringify(filteredJobs));
  displayJobs(jobsList);
  
});

function displayJobs(inpList) {
  container.innerHTML = ''; // Clear previous content

  const ul = document.createElement('ul');
  ul.classList.add('job-list');

  inpList.forEach(job => {
    const li = document.createElement('li');
    li.classList.add('job-item');

    li.innerHTML = `
      <div class="job-title">${job["Title"]}</div>
      <div class="job-details">
        ${job["Type"]} - <span class="job-level">${job["Level"]}</span>
      </div>
    `;

    ul.appendChild(li);
  });

  container.appendChild(ul);

  

}

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

function sortList(inpList) {
  let currentSort = sortBox.value;
  if (currentSort === prevSort) return;

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
      
      case "AZ":
        inpList.reverse();
        break;

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


  

  displayJobs(inpList);
  prevSort = currentSort;
}

function listSorter(inpList, method) {
  if (method === "alpha") {
    inpList.sort((a, b) => compareTo(a["Title"].toLowerCase(), b["Title"].toLowerCase()));
  } else if (method === "date") {
    inpList.sort((a, b) => compareTo(dateToStandard(a["Posted"]), dateToStandard(b["Posted"])));
  }
}

function dateToStandard(date) {
  let dateParts = date.split(" ");
  let value = parseInt(dateParts[0], 10); 
  let unit = dateParts[1];

  switch (unit) {
    case "minute":
    case "minutes":
      return value; 
    case "hour":
    case "hours":
      return value * 60;
    case "day":
    case "days":
      return value * 24 * 60;
    default:
      return 0; // Handle unexpected units
  }
}

function compareTo(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function getFilters(inpList) {
  let levelSet = new Set();
  let typeSet = new Set();
  let skillSet = new Set();

  for (let i = 0; i < inpList.length; i++) {
    let job = inpList[i];
    levelSet.add(job["Level"]);
    typeSet.add(job["Type"]);
    skillSet.add(job["Skill"]);
  }

  return  [levelSet, typeSet, skillSet];
}