// Sparx Auto-Completer Main Logic
// Developed by MV$ and D1C1PHER

// Global variables
let isRunning = false;
let questionBank = {};
let currentQuestion = null;

// Initialize the extension when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main functionality
    initSparxAutoCompleter();
});

/**
 * Main initialization function
 */
function initSparxAutoCompleter() {
    console.log("Sparx Auto-Completer v1.0 initialized");
    
    // Load stored answers from local storage if available
    loadQuestionBank();
    
    // Add event listeners for page changes in Sparx
    setupMutationObserver();
    
    // Add UI controls
    addControlPanel();
    
    // Initial check if we're on a Sparx page
    checkAndProcessSparxPage();
}

/**
 * Sets up a MutationObserver to detect changes in the DOM
 * This helps capture when new questions are loaded
 */
function setupMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (isRunning && isSparxPage()) {
                checkAndProcessSparxPage();
            }
        });
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

/**
 * Checks if the current page is a Sparx Math page
 */
function isSparxPage() {
    return window.location.hostname.includes("sparx") || 
        document.title.toLowerCase().includes("sparx") ||
        document.querySelector(".sparx-question-container") !== null;
}

/**
 * Main processing function that checks for questions and processes them
 */
function checkAndProcessSparxPage() {
    if (!isSparxPage()) return;
    
    console.log("Detected Sparx page, looking for questions...");
    
    const questionElement = document.querySelector(".question-content, .sparx-question");
    if (!questionElement) {
        console.log("No question found on this page");
        return;
    }
    
    // Extract the question text
    const questionText = extractQuestionText(questionElement);
    if (!questionText) return;
    
    currentQuestion = {
        text: questionText,
        element: questionElement
    };
    
    console.log("Question detected:", questionText);
    
    // Check if we already have an answer for this question
    if (questionBank[questionText]) {
        console.log("Answer found in database:", questionBank[questionText]);
        fillAnswer(questionBank[questionText]);
    } else {
        // Try to solve the question
        solveQuestion(questionText);
    }
}

/**
 * Extracts the text from a question element
 */
function extractQuestionText(element) {
    // Remove any hidden elements that might contain solution hints
    const clonedElement = element.cloneNode(true);
    const hiddenElements = clonedElement.querySelectorAll(".hidden, .solution, .hint");
    hiddenElements.forEach(el => el.remove());
    
    // Get the text content
    let text = clonedElement.textContent.trim();
    
    // Clean up the text to make it more consistent
    text = text.replace(/\s+/g, ' ');
    
    return text;
}

/**
 * Attempts to solve a math question using various strategies
 */
function solveQuestion(questionText) {
    console.log("Attempting to solve question:", questionText);
    
    // First, check if it's a simple arithmetic problem
    const arithmeticResult = solveArithmetic(questionText);
    if (arithmeticResult !== null) {
        saveAndFillAnswer(questionText, arithmeticResult);
        return;
    }
    
    // Check if it's an algebra problem
    const algebraResult = solveAlgebra(questionText);
    if (algebraResult !== null) {
        saveAndFillAnswer(questionText, algebraResult);
        return;
    }
    
    // Check if it's a geometry problem
    const geometryResult = solveGeometry(questionText);
    if (geometryResult !== null) {
        saveAndFillAnswer(questionText, geometryResult);
        return;
    }
    
    console.log("Could not solve question automatically");
    notifySolveFailure();
}

/**
 * Attempt to solve basic arithmetic from the question
 */
function solveArithmetic(questionText) {
    // Extract numbers and operations from the question
    const numberPattern = /(-?\d+\.?\d*)/g;
    const numbers = questionText.match(numberPattern);
    
    if (!numbers || numbers.length < 2) return null;
    
    // Look for keywords to determine operation
    if (questionText.includes("add") || questionText.includes("sum") || questionText.includes("plus")) {
        return parseFloat(numbers[0]) + parseFloat(numbers[1]);
    } else if (questionText.includes("subtract") || questionText.includes("minus") || questionText.includes("difference")) {
        return parseFloat(numbers[0]) - parseFloat(numbers[1]);
    } else if (questionText.includes("multiply") || questionText.includes("product") || questionText.includes("times")) {
        return parseFloat(numbers[0]) * parseFloat(numbers[1]);
    } else if (questionText.includes("divide") || questionText.includes("quotient")) {
        return parseFloat(numbers[0]) / parseFloat(numbers[1]);
    }
    
    return null;
}

/**
 * Attempt to solve algebra problems
 */
function solveAlgebra(questionText) {
    // This would be a more complex implementation
    // For now, we'll just handle basic equations like "x + 5 = 10"
    
    // Check if it's a simple equation
    const equationMatch = questionText.match(/([a-z])\s*\+\s*(\d+)\s*=\s*(\d+)/);
    if (equationMatch) {
        const variable = equationMatch[1];
        const addend = parseFloat(equationMatch[2]);
        const result = parseFloat(equationMatch[3]);
        return result - addend;
    }
    
    return null;
}

/**
 * Attempt to solve geometry problems
 */
function solveGeometry(questionText) {
    // Very simplified geometry solver
    
    // Check if it's asking for area of a rectangle
    if (questionText.includes("area") && questionText.includes("rectangle")) {
        const dimensions = questionText.match(/(\d+)\s*(?:cm|m)?\s*by\s*(\d+)\s*(?:cm|m)?/);
        if (dimensions) {
            return parseFloat(dimensions[1]) * parseFloat(dimensions[2]);
        }
    }
    
    // Check if it's asking for area of a circle
    if (questionText.includes("area") && questionText.includes("circle")) {
        const radius = questionText.match(/radius\s*(?:of|is|=)?\s*(\d+\.?\d*)/);
        if (radius) {
            return Math.PI * Math.pow(parseFloat(radius[1]), 2);
        }
    }
    
    return null;
}

/**
 * Saves the answer to the question bank and fills it in the UI
 */
function saveAndFillAnswer(question, answer) {
    console.log(`Saving answer "${answer}" for question "${question}"`);
    questionBank[question] = answer;
    saveQuestionBank();
    fillAnswer(answer);
}

/**
 * Fills the answer into the input field on the page
 */
function fillAnswer(answer) {
    // Find answer input field
    const answerInput = document.querySelector("input.answer-field, input.sparx-answer");
    
    if (answerInput) {
        // Set the value
        answerInput.value = answer;
        
        // Trigger input events to ensure Sparx recognizes the change
        const inputEvent = new Event('input', { bubbles: true });
        answerInput.dispatchEvent(inputEvent);
        
        // Focus the input to make it look more natural
        answerInput.focus();
        
        // Optionally auto-submit if the auto-submit option is enabled
        if (getSettings().autoSubmit) {
            const submitButton = document.querySelector("button.submit, .sparx-submit-btn");
            if (submitButton) {
                setTimeout(() => {
                    submitButton.click();
                }, 500 + Math.random() * 1000); // Add random delay to appear more human
            }
        }
        
        console.log("Answer filled successfully");
    } else {
        console.log("Could not find answer input field");
    }
}

/**
 * Shows a notification that the question couldn't be solved
 */
function notifySolveFailure() {
    // Create a notification element if it doesn't exist
    let notification = document.getElementById("sparx-auto-notification");
    if (!notification) {
        notification = document.createElement("div");
        notification.id = "sparx-auto-notification";
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.right = "20px";
        notification.style.backgroundColor = "#ff6b6b";
        notification.style.color = "white";
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "5px";
        notification.style.zIndex = "9999";
        document.body.appendChild(notification);
    }
    
    notification.textContent = "Could not automatically solve this question";
    notification.style.display = "block";
    
    // Hide the notification after 3 seconds
    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

/**
 * Adds the control panel to the page
 */
function addControlPanel() {
    const controlPanel = document.createElement("div");
    controlPanel.id = "sparx-auto-control";
    controlPanel.style.position = "fixed";
    controlPanel.style.top = "70px";
    controlPanel.style.right = "20px";
    controlPanel.style.backgroundColor = "#333";
    controlPanel.style.color = "white";
    controlPanel.style.padding = "10px";
    controlPanel.style.borderRadius = "5px";
    controlPanel.style.zIndex = "1000";
    
    // Add toggle button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = isRunning ? "Disable Auto-Completer" : "Enable Auto-Completer";
    toggleButton.style.padding = "5px 10px";
    toggleButton.style.marginBottom = "10px";
    toggleButton.style.width = "100%";
    toggleButton.addEventListener("click", () => {
        isRunning = !isRunning;
        toggleButton.textContent = isRunning ? "Disable Auto-Completer" : "Enable Auto-Completer";
        
        if (isRunning) {
            checkAndProcessSparxPage();
        }
        
        saveSettings({...getSettings(), enabled: isRunning});
    });
    
    // Auto-submit checkbox
    const autoSubmitLabel = document.createElement("label");
    autoSubmitLabel.style.display = "block";
    autoSubmitLabel.style.marginBottom = "10px";
    
    const autoSubmitCheckbox = document.createElement("input");
    autoSubmitCheckbox.type = "checkbox";
    autoSubmitCheckbox.checked = getSettings().autoSubmit;
    autoSubmitCheckbox.addEventListener("change", () => {
        saveSettings({...getSettings(), autoSubmit: autoSubmitCheckbox.checked});
    });
    
    autoSubmitLabel.appendChild(autoSubmitCheckbox);
    autoSubmitLabel.appendChild(document.createTextNode(" Auto-submit answers"));
    
    // Build the control panel
    controlPanel.appendChild(toggleButton);
    controlPanel.appendChild(autoSubmitLabel);
    
    // Add status indicator
    const statusIndicator = document.createElement("div");
    statusIndicator.id = "sparx-status";
    statusIndicator.style.textAlign = "center";
    statusIndicator.style.fontSize = "12px";
    statusIndicator.textContent = "Ready";
    
    controlPanel.appendChild(statusIndicator);
    document.body.appendChild(controlPanel);
    
    // Update status periodically
    setInterval(() => {
        const statusElement = document.getElementById("sparx-status");
        if (statusElement) {
            statusElement.textContent = isRunning ? 
                (isSparxPage() ? "Running on Sparx page" : "Running (not on Sparx page)") : 
                "Disabled";
        }
    }, 1000);
}

/**
 * Load the question bank from local storage
 */
function loadQuestionBank() {
    try {
        const saved = localStorage.getItem("sparxQuestionBank");
        if (saved) {
            questionBank = JSON.parse(saved);
            console.log(`Loaded ${Object.keys(questionBank).length} questions from storage`);
        }
    } catch (error) {
        console.error("Error loading question bank:", error);
        questionBank = {};
    }
}

/**
 * Save the question bank to local storage
 */
function saveQuestionBank() {
    try {
        localStorage.setItem("sparxQuestionBank", JSON.stringify(questionBank));
    } catch (error) {
        console.error("Error saving question bank:", error);
    }
}

/**
 * Get user settings with defaults
 */
function getSettings() {
    try {
        const saved = localStorage.getItem("sparxAutoSettings");
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
    
    return {
        enabled: false,
        autoSubmit: false
    };
}

/**
 * Save user settings
 */
function saveSettings(settings) {
    try {
        localStorage.setItem("sparxAutoSettings", JSON.stringify(settings));
    } catch (error) {
        console.error("Error saving settings:", error);
    }
}

// Apply saved settings on load
const savedSettings = getSettings();
isRunning = savedSettings.enabled;