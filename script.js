const ZERO_DIVISION_ERROR = "CANNOT DIVIDE BY 0";
const MAX_NUMBER_ERROR = "MAX NUMBER REACHED";
const MIN_NUMBER_ERROR = "MIN NUMBER REACHED";

const display = document.querySelector(".display");
const clearButton = document.querySelector(".clear");
const backspaceButton = document.querySelector(".backspace");
const equalButton = document.querySelector(".equal");

const operators = document.querySelectorAll(".operator");
const nonOperators = document.querySelectorAll("button:not(.operator)");
const valueButtons = document.querySelectorAll(".value");

let prevValue = null;
let displayValue = "0";
let currentOperator = null;
let hasError = false;

// Set active transition for non operator buttons
nonOperators.forEach((button) => {
  button.addEventListener("click", activateButton);
  button.addEventListener("transitionend", deactivateButton);
});

// Equal button has the same active transition as a non operator button
equalButton.addEventListener("transitionend", deactivateButton);

clearButton.addEventListener("click", clearAll);
backspaceButton.addEventListener("click", clearEntry);
valueButtons.forEach((button) => button.addEventListener("click", enterValue));
operators.forEach((operator) =>
  operator.addEventListener("click", activateOperator)
);

// Allow keyboard shortcuts
document.addEventListener("keydown", (event) => {
  const button = document.querySelector(`button[data-key="${event.key}"]`);
  if (!button) return;

  button.click();
});

// Ensure that button is inactive after key is released
document.addEventListener("keyup", (event) => {
  const button = document.querySelector(`button[data-key="${event.key}"]`);
  if (!button) return;

  button.dispatchEvent(new Event("transitionend"));
});

function enterValue() {
  if (hasError) return;

  // Start recording the second operand if there is an active operator
  const activeOperator = getActiveOperator();
  if (activeOperator) {
    prevValue = displayValue;
    displayValue = "0";
    currentOperator = activeOperator.textContent;
    activeOperator.classList.remove("active");
  }

  const value = displayValue + this.textContent;
  updateDisplay(value);
}

function activateOperator() {
  if (hasError) return;

  // Deactivate an active operator
  const activeOperator = getActiveOperator();
  if (activeOperator) {
    activeOperator.classList.remove("active");
    if (activeOperator === this) return;
  }

  // Calculate an unfinished operation
  if (currentOperator !== null) {
    const result = operate(currentOperator, +prevValue, +displayValue);
    prevValue = null;
    currentOperator = null;
    updateDisplay(result.toString());
  }

  this.classList.add("active");
}

function clearAll() {
  const activeOperator = getActiveOperator();
  if (activeOperator) {
    activeOperator.classList.remove("active");
  }

  prevValue = null;
  currentOperator = null;
  hasError = false;
  display.classList.remove("error");
  updateDisplay("0");
}

function clearEntry() {
  if (hasError) return;

  // Backspace button can also be used to deactivate an active operator
  const activeOperator = getActiveOperator();
  if (activeOperator) {
    activeOperator.classList.remove("active");
    return;
  }

  const value = displayValue.slice(0, -1);
  updateDisplay(value);
}

function activateButton() {
  this.classList.add("active");
}

function deactivateButton() {
  this.classList.remove("active");
}

function updateDisplay(value) {
  if (value === ZERO_DIVISION_ERROR) {
    displayError(value);
    return;
  }

  const hasTrailingDecimalPoint = value.endsWith(".");

  /*
    Strip trailing decimal point. This prevent value from being converted to
    NaN when it is already a decimal
  */
  if (hasTrailingDecimalPoint) value = value.slice(0, -1);

  let n = +value;

  // Truncate scientific notation and round decimals
  if (displayValue.includes("e")) {
    n = +n.toPrecision(3);
  } else {
    n = +n.toFixed(2);
  }

  // Prevent number from being too big or too small
  if (n > Number.MAX_SAFE_INTEGER) {
    displayError(MAX_NUMBER_ERROR);
    return;
  }
  if (n < Number.MIN_SAFE_INTEGER) {
    displayError(MIN_NUMBER_ERROR);
    return;
  }

  displayValue = n.toString();

  // Only display the trailing decimal point when it is valid
  if (hasTrailingDecimalPoint && !displayValue.includes(".")) {
    displayValue += ".";
  }

  display.textContent = displayValue;
}

function displayError(errorMsg) {
  hasError = true;
  displayValue = errorMsg;
  display.textContent = displayValue;
  display.classList.add("error");
}

function getActiveOperator() {
  return document.querySelector(".operator.active");
}

function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "×":
      return multiply(a, b);
    case "÷":
      return divide(a, b);
  }
}

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) return ZERO_DIVISION_ERROR;
  return a / b;
}
