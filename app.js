const container = document.querySelector(".container");
const button = document.querySelector(".button");
const statusBar = document.querySelector(".status-bar");

function solve() {
  // TODO
}

function handleClick() {
  const inputs = [...document.querySelectorAll("input")];
  const clues = inputs.map(({ value }) => parseInt(value, 10));
  if (clues.every((clue) => isNaN(clue))) {
    statusBar.className = "status-bar";
    return;
  }
  statusBar.className = "status-bar thinking";
  setTimeout(() => {
    const solution = solve(clues);
    if (!solution) {
      statusBar.className = "status-bar invalid";
      return;
    }
    inputs.forEach((input, index) => {
      input.value = solution[index];
    });
    statusBar.className = "status-bar complete";
  }, 50);
}

container.innerHTML = '<input type="number" />'.repeat(36);

button.addEventListener("click", handleClick);
