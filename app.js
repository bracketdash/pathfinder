const container = document.querySelector(".container");
const button = document.querySelector(".button");
const statusBar = document.querySelector(".status-bar");

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

function solvePuzzle(puzzle, minValue, maxValue) {
  const clues = puzzle
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value !== null);
  if (clues.length === 0) {
    puzzle[0] = minValue;
    const visited = new Array(36).fill(false);
    visited[0] = true;
    if (buildPath(puzzle, 0, minValue, visited, maxValue)) {
      return true;
    }
    puzzle[0] = null;
    return false;
  }
  const startingClues = clues.filter((clue) => clue.value === minValue);
  if (startingClues.length > 0) {
    const startingClue = startingClues[0];
    const visited = new Array(36).fill(false);
    visited[startingClue.index] = true;
    return buildPath(puzzle, startingClue.index, minValue, visited, maxValue);
  }
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

function validateCluesWithRange(clues, minValue, maxValue, sequenceLength) {
  if (maxValue - minValue + 1 > sequenceLength) {
    return false;
  }
  if (clues.some((clue) => !Number.isInteger(clue.value))) {
    return false;
  }
  if (clues.some((clue) => clue.value < minValue || clue.value > maxValue)) {
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

function validateSolution(puzzle, minValue, maxValue) {
  for (let i = minValue; i <= maxValue; i++) {
    if (!puzzle.includes(i)) {
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
  if (puzzle.includes(null)) {
    return false;
  }
  return true;
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
  const lowestClueValue = clues[0].value;
  const highestClueValue = clues[clues.length - 1].value;
  const absoluteMinValue = Math.max(1, highestClueValue - 35);
  for (
    let candidateMinValue = lowestClueValue;
    candidateMinValue >= absoluteMinValue;
    candidateMinValue--
  ) {
    const candidateMaxValue = candidateMinValue + 35;
    if (candidateMaxValue < highestClueValue) {
      continue;
    }
    const puzzleCopy = [...puzzle];
    if (
      !validateCluesWithRange(clues, candidateMinValue, candidateMaxValue, 36)
    ) {
      continue;
    }
    if (solvePuzzle(puzzleCopy, candidateMinValue, candidateMaxValue)) {
      if (validateSolution(puzzleCopy, candidateMinValue, candidateMaxValue)) {
        if (!puzzleCopy.includes(null)) {
          return puzzleCopy;
        }
      }
    }
  }
  return null;
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
