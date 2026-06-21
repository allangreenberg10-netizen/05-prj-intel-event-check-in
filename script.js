const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const teamCountElements = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};
const teamRosterElements = {
  water: document.getElementById("waterRoster"),
  zero: document.getElementById("zeroRoster"),
  power: document.getElementById("powerRoster"),
};

let count = 0;
const maxCount = 50;
let goalCelebrated = false;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let recentCheckIns = [];
const storageKey = "intel-sustainability-summit-check-in";

function getDefaultState() {
  return {
    attendeeCount: 0,
    teamCounts: {
      water: 0,
      zero: 0,
      power: 0,
    },
    recentCheckIns: [],
    goalCelebrated: false,
  };
}

function readState() {
  try {
    const storedState = window.localStorage.getItem(storageKey);

    if (!storedState) {
      return getDefaultState();
    }

    const parsedState = JSON.parse(storedState);
    const defaultState = getDefaultState();

    return {
      attendeeCount: Number.isFinite(parsedState.attendeeCount)
        ? parsedState.attendeeCount
        : defaultState.attendeeCount,
      teamCounts: {
        water: Number.isFinite(parsedState.teamCounts?.water)
          ? parsedState.teamCounts.water
          : defaultState.teamCounts.water,
        zero: Number.isFinite(parsedState.teamCounts?.zero)
          ? parsedState.teamCounts.zero
          : defaultState.teamCounts.zero,
        power: Number.isFinite(parsedState.teamCounts?.power)
          ? parsedState.teamCounts.power
          : defaultState.teamCounts.power,
      },
      recentCheckIns: Array.isArray(parsedState.recentCheckIns)
        ? parsedState.recentCheckIns
        : defaultState.recentCheckIns,
      goalCelebrated: Boolean(parsedState.goalCelebrated),
    };
  } catch (error) {
    return getDefaultState();
  }
}

function saveState() {
  const state = {
    attendeeCount: count,
    teamCounts: getTeamCountsFromRoster(),
    recentCheckIns: recentCheckIns,
    goalCelebrated: goalCelebrated,
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    // Ignore storage errors so check-in still works.
  }
}

function getTeamCountsFromRoster() {
  const counts = {
    water: 0,
    zero: 0,
    power: 0,
  };

  for (let index = 0; index < recentCheckIns.length; index++) {
    const attendee = recentCheckIns[index];
    counts[attendee.team]++;
  }

  return counts;
}

function renderCounts() {
  teamCounts = getTeamCountsFromRoster();
  count = recentCheckIns.length;

  attendeeCount.textContent = String(count);
  progressBar.style.width = `${Math.min((count / maxCount) * 100, 100)}%`;
  teamCountElements.water.textContent = String(teamCounts.water);
  teamCountElements.zero.textContent = String(teamCounts.zero);
  teamCountElements.power.textContent = String(teamCounts.power);
}

function renderTeamRosters() {
  const teamKeys = ["water", "zero", "power"];

  if (
    !teamRosterElements.water ||
    !teamRosterElements.zero ||
    !teamRosterElements.power
  ) {
    return;
  }

  for (let index = 0; index < teamKeys.length; index++) {
    teamRosterElements[teamKeys[index]].innerHTML = "";
  }

  for (let index = 0; index < recentCheckIns.length; index++) {
    const attendee = recentCheckIns[index];
    const listItem = document.createElement("li");

    listItem.className = "team-roster-item";
    listItem.textContent = attendee.name;

    teamRosterElements[attendee.team].appendChild(listItem);
  }
}

function restoreSavedState() {
  const savedState = readState();

  recentCheckIns = savedState.recentCheckIns;
  count = recentCheckIns.length;
  teamCounts = getTeamCountsFromRoster();
  goalCelebrated = savedState.goalCelebrated;

  renderCounts();
  renderTeamRosters();

  if (goalCelebrated) {
    restoreWinningTeamHighlight();
  }
}

function showLightningBolts() {
  const boltCount = 20;

  for (let index = 0; index < boltCount; index++) {
    const bolt = document.createElement("span");
    bolt.className = "lightning-bolt";
    bolt.textContent = "⚡";
    bolt.style.left = `${Math.random() * 100}%`;
    bolt.style.top = `${Math.random() * 100}%`;
    bolt.style.fontSize = `${36 + Math.random() * 32}px`;
    bolt.style.animationDelay = `${index * 0.04}s`;
    bolt.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 50 - 25}deg)`;
    document.body.appendChild(bolt);

    window.setTimeout(function () {
      bolt.remove();
    }, 1400);
  }
}

function flashGreetingMessage(message) {
  greeting.textContent = message;
  greeting.style.display = "block";
  greeting.classList.remove("success-message", "flash-message");
  void greeting.offsetWidth;
  greeting.classList.add("success-message", "flash-message");
}

function showWelcomeFlash(message) {
  const welcomeFlash = document.createElement("div");
  welcomeFlash.className = "welcome-flash-overlay";
  welcomeFlash.innerHTML = `
    <div class="welcome-flash-content">
      <span class="welcome-flash-kicker">Welcome</span>
      <h2>${message}</h2>
    </div>
  `;
  document.body.appendChild(welcomeFlash);

  window.setTimeout(function () {
    welcomeFlash.classList.add("is-visible");
  }, 20);

  window.setTimeout(function () {
    welcomeFlash.classList.remove("is-visible");

    window.setTimeout(function () {
      welcomeFlash.remove();
    }, 450);
  }, 1850);
}

function clearWinningTeamHighlight() {
  const winningCards = document.querySelectorAll(".team-card.winning-team");

  for (let index = 0; index < winningCards.length; index++) {
    winningCards[index].classList.remove("winning-team");
  }
}

function restoreWinningTeamHighlight() {
  const teamCards = document.querySelectorAll(".team-card");
  let winningCount = -1;
  let winningCards = [];

  clearWinningTeamHighlight();

  for (let index = 0; index < teamCards.length; index++) {
    const card = teamCards[index];
    const countElement = card.querySelector(".team-count");
    const currentCount = parseInt(countElement.textContent, 10);

    if (currentCount > winningCount) {
      winningCount = currentCount;
      winningCards = [card];
    } else if (currentCount === winningCount) {
      winningCards.push(card);
    }
  }

  for (let index = 0; index < winningCards.length; index++) {
    winningCards[index].classList.add("winning-team");
  }
}

function showConfetti() {
  const colors = ["#0071c5", "#00aeef", "#ffd400", "#ffffff", "#7dd3fc"];
  const confettiCount = 100;

  for (let index = 0; index < confettiCount; index++) {
    const confetti = document.createElement("span");
    confetti.className = "confetti-piece";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `-${10 + Math.random() * 20}%`;
    confetti.style.backgroundColor = colors[index % colors.length];
    confetti.style.animationDelay = `${Math.random() * 0.4}s`;
    confetti.style.animationDuration = `${2.4 + Math.random() * 0.8}s`;
    confetti.style.setProperty("--drift", `${Math.random() * 240 - 120}px`);
    document.body.appendChild(confetti);

    window.setTimeout(function () {
      confetti.remove();
    }, 3400);
  }
}

function celebrateGoal() {
  if (goalCelebrated) {
    return;
  }

  goalCelebrated = true;

  const teamCards = document.querySelectorAll(".team-card");
  let winningCount = -1;
  let winningCards = [];

  clearWinningTeamHighlight();

  for (let index = 0; index < teamCards.length; index++) {
    const card = teamCards[index];
    const countElement = card.querySelector(".team-count");
    const currentCount = parseInt(countElement.textContent, 10);

    if (currentCount > winningCount) {
      winningCount = currentCount;
      winningCards = [card];
    } else if (currentCount === winningCount) {
      winningCards.push(card);
    }
  }

  for (let index = 0; index < winningCards.length; index++) {
    winningCards[index].classList.add("winning-team");
  }

  greeting.textContent =
    "Goal reached! Celebration time for the Intel Team Sustainability Summit.";
  greeting.style.display = "block";
  greeting.classList.remove("success-message", "flash-message");
  void greeting.offsetWidth;
  greeting.classList.add("success-message", "flash-message");

  showWelcomeFlash("Attendance goal reached! Celebrate the winning team!");
  showConfetti();
  saveState();
}

restoreSavedState();

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const teamOption = teamSelect.selectedOptions[0];

  if (name === "" || !teamOption || teamSelect.value === "") {
    return;
  }

  const team = teamSelect.value;
  const teamName = teamOption.textContent;
  const teamCounter = document.getElementById(`${team}Count`);

  count++;
  recentCheckIns.push({
    name: name,
    team: team,
    teamName: teamName,
  });
  renderCounts();
  renderTeamRosters();

  if (teamCounter) {
    teamCounter.textContent = String(teamCounts[team]);
  }

  saveState();

  flashGreetingMessage(
    `Welcome to the Intel Team Sustainability Summit, ${name} from ${teamName}!`,
  );

  showWelcomeFlash(`Welcome to the Intel Team Sustainability Summit, ${name}!`);

  showLightningBolts();

  if (count >= maxCount) {
    celebrateGoal();
  }

  form.reset();
  nameInput.focus();
});
