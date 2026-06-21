
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

Handle form submission
form.addEventListener("submit", function (event){}
event.preventDefault();

Get form values
const name = nameInput.value;
const team = teamSelect

console.log(name, team);
