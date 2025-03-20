const container = document.querySelector(".container");
const button = document.querySelector(".button");
const statusBar = document.querySelector(".status-bar");

function validateClues(clues, minValue, maxValue, sequenceLength) {
  if (maxValue - minValue + 1 > sequenceLength) {
    return false;
  }
  if (clues.some((clue) => !Number.isInteger(clue.value))) {
    return false;
  }
  const values = clues.map((clue) => clue.value);
  if (new Set(values).size !== values.length) {
    return false;
  }
  clues.sort((a, b) => a.value - b.value);
  for (let i = 0; i < clues.length - 1; i++) {
    if (clues[i].value + 1 === clues[i + 1].value) {
      if (!areAdjacent(clues[i].index, clues[i + 1].index)) {
        return false;
      }
    }
  }
  return true;
}

function areAdjacent(index1, index2) {
  const row1 = Math.floor(index1 / 6);
  const col1 = index1 % 6;
  const row2 = Math.floor(index2 / 6);
  const col2 = index2 % 6;
  return (
    (row1 === row2 && Math.abs(col1 - col2) === 1) ||
    (col1 === col2 && Math.abs(row1 - row2) === 1)
  );
}

function validateSolution(puzzle, minValue, maxValue) {
  const expectedSequence = [];
  for (let i = minValue; i <= maxValue; i++) {
    expectedSequence.push(i);
  }
  for (const value of expectedSequence) {
    if (!puzzle.includes(value)) {
      return false;
    }
  }
  for (let i = minValue; i < maxValue; i++) {
    const index1 = puzzle.indexOf(i);
    const index2 = puzzle.indexOf(i + 1);
    if (!areAdjacent(index1, index2)) {
      return false;
    }
  }
  return true;
}

function solvePuzzle(puzzle, minValue, maxValue) {
  const clues = puzzle
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value !== null);
  clues.sort((a, b) => a.value - b.value);
  const lowestClue = clues[0];
  const visited = new Array(36).fill(false);
  visited[lowestClue.index] = true;
  if (lowestClue.value > minValue) {
    if (
      !buildBackwards(
        puzzle,
        lowestClue.index,
        lowestClue.value,
        visited,
        minValue
      )
    ) {
      return false;
    }
  }
  return buildPath(
    puzzle,
    lowestClue.index,
    lowestClue.value,
    visited,
    maxValue
  );
}

function buildBackwards(puzzle, index, value, visited, minValue) {
  if (value === minValue) {
    puzzle[index] = value;
    return true;
  }
  const prevValue = value - 1;
  const prevIndex = puzzle.indexOf(prevValue);
  if (prevIndex !== -1) {
    if (areAdjacent(index, prevIndex)) {
      visited[prevIndex] = true;
      return buildBackwards(puzzle, prevIndex, prevValue, visited, minValue);
    } else {
      return false;
    }
  }
  const possibleMoves = getAdjacentCells(index).filter(
    (i) => !visited[i] && puzzle[i] === null
  );
  for (const prevIndex of possibleMoves) {
    puzzle[prevIndex] = prevValue;
    visited[prevIndex] = true;

    if (buildBackwards(puzzle, prevIndex, prevValue, visited, minValue)) {
      return true;
    }
    puzzle[prevIndex] = null;
    visited[prevIndex] = false;
  }
  return false;
}

function buildPath(puzzle, index, value, visited, maxValue) {
  if (value === maxValue) {
    puzzle[index] = value;
    return true;
  }
  const nextValue = value + 1;
  const nextIndex = puzzle.indexOf(nextValue);
  if (nextIndex !== -1) {
    if (areAdjacent(index, nextIndex)) {
      visited[nextIndex] = true;
      return buildPath(puzzle, nextIndex, nextValue, visited, maxValue);
    } else {
      return false;
    }
  }
  const possibleMoves = getAdjacentCells(index).filter(
    (i) => !visited[i] && puzzle[i] === null
  );
  for (const nextIndex of possibleMoves) {
    puzzle[nextIndex] = nextValue;
    visited[nextIndex] = true;
    if (buildPath(puzzle, nextIndex, nextValue, visited, maxValue)) {
      return true;
    }
    puzzle[nextIndex] = null;
    visited[nextIndex] = false;
  }
  return false;
}

function getAdjacentCells(index) {
  const row = Math.floor(index / 6);
  const col = index % 6;
  const adjacent = [];
  if (row > 0) adjacent.push(index - 6);
  if (col < 5) adjacent.push(index + 1);
  if (row < 5) adjacent.push(index + 6);
  if (col > 0) adjacent.push(index - 1);
  return adjacent;
}

function solve(grid) {
  const puzzle = [...grid];
  for (let i = 0; i < puzzle.length; i++) {
    if (isNaN(puzzle[i])) {
      puzzle[i] = null;
    }
  }
  if (puzzle.length !== 36) {
    return null;
  }
  const clues = puzzle
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value !== null);
  if (clues.length === 0) {
    return null;
  }
  clues.sort((a, b) => a.value - b.value);
  const minValue = clues[0].value;
  const maxValue = clues[clues.length - 1].value;
  const clueValues = clues.map((clue) => clue.value);
  for (let i = 0; i < clueValues.length - 1; i++) {
    if (clueValues[i + 1] - clueValues[i] > 1) {
      const expectedValue = clueValues[i] + 1;
      if (
        !puzzle.includes(expectedValue) &&
        puzzle.filter((cell) => cell === null).length === 0
      ) {
        return null;
      }
    }
  }
  const sequenceLength = 36;
  if (!validateClues(clues, minValue, maxValue, sequenceLength)) {
    return null;
  }
  if (!solvePuzzle(puzzle, minValue, maxValue)) {
    return null;
  }
  if (!validateSolution(puzzle, minValue, maxValue)) {
    return null;
  }
  return puzzle;
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
    // DEBUGGING
    console.log("clues:");
    console.log(clues);
    const solution = solve(clues);
    console.log("solution:");
    console.log(solution);
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
