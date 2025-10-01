const object = document.getElementById('inflating-object');
const button = document.getElementById('hold-button');
const timerDisplay = document.getElementById('timer');

// Game parameters
const MAX_TIME_MS = 3000; // Object pops after 3.000 seconds
const INITIAL_SIZE = 50; // In pixels (scale 1)
const MAX_SIZE = 200; // In pixels (scale 4)

let isInflating = false;
let startTime = 0; 
let animationFrameId; // Stores the ID for requestAnimationFrame

/**
 * Utility function to format milliseconds into 00.000 string
 */
function formatTime(ms) {
    const totalSeconds = ms / 1000;
    const seconds = Math.floor(totalSeconds);
    const milliseconds = Math.floor((totalSeconds - seconds) * 1000);
    
    const secStr = String(seconds).padStart(2, '0');
    const msStr = String(milliseconds).padStart(3, '0');
    
    return `${secStr}.${msStr}`;
}

/**
 * THE CORE ANIMATION AND TIMER LOOP (Uses requestAnimationFrame for accuracy)
 */
function updateInflation(timestamp) {
    // If startTime is 0, this is the very first frame of inflation.
    if (!startTime) {
        startTime = timestamp;
    }
    
    const elapsedTime = timestamp - startTime;
    
    if (elapsedTime >= MAX_TIME_MS) {
        // Pop time reached!
        stopInflation();
        popObject();
        return;
    }

    // 1. Update Stopwatch Display
    timerDisplay.textContent = formatTime(elapsedTime);

    // 2. Update Object Size (Scaling the object using CSS variables)
    const progress = elapsedTime / MAX_TIME_MS; // Value from 0.0 to 1.0
    const scaleFactor = 1 + (MAX_SIZE / INITIAL_SIZE - 1) * progress; // Scales from 1 to 4
    
    object.style.setProperty('--scale-factor', scaleFactor);

    // Continue the animation loop
    animationFrameId = requestAnimationFrame(updateInflation);
}


/**
 * START INFLATION - Triggered on mousedown/touchstart
 */
function startInflation(event) {
    // Prevent starting if already inflating or popped
    if (isInflating || object.classList.contains('popped')) return;
    
    isInflating = true;
    startTime = 0; // Will be set by the first frame of updateInflation
    
    object.classList.remove('popped');
    object.classList.add('is-inflating');
    button.textContent = 'INFLATING... RELEASE CAREFULLY';
    
    // Start the accurate animation loop
    animationFrameId = requestAnimationFrame(updateInflation);
    
    // Prevents mobile touch scroll/zoom issues
    event.preventDefault(); 
}

/**
 * STOP INFLATION - Triggered on mouseup/touchend
 */
function stopInflation() {
    if (!isInflating) return;
    
    isInflating = false;
    cancelAnimationFrame(animationFrameId); // Stop the animation loop

    // The time the player released the button is the final time
    const finalTime = Date.now() - (startTime ? startTime : Date.now()); 
    timerDisplay.textContent = formatTime(finalTime);

    object.classList.remove('is-inflating');
    
    // Check if the object is too big and should have popped (error state for player)
    // NOTE: If MAX_TIME is reached, popObject is called first, so this won't run.
    if (finalTime > MAX_TIME_MS) {
         // This is technically impossible due to the MAX_TIME check in updateInflation, 
         // but included for conceptual completeness.
    } else {
        button.textContent = 'STOPPED. Hold Again?';
    }
}

/**
 * POP OBJECT - Triggered when MAX_TIME_MS is reached
 */
function popObject() {
    isInflating = false;
    cancelAnimationFrame(animationFrameId);
    
    // Set final timer to the pop time
    timerDisplay.textContent = formatTime(MAX_TIME_MS);

    // Apply the 'popped' class for the visual effect
    object.classList.remove('is-inflating');
    object.classList.add('popped');
    
    button.textContent = 'POP! You hit the limit! Start Over?';
    
    // Optional: Reset the object after a short delay
    setTimeout(resetGame, 2000);
}

function resetGame() {
    object.classList.remove('popped');
    object.style.setProperty('--scale-factor', 1); // Reset size by setting scale to 1
    timerDisplay.textContent = formatTime(0);
    button.textContent = 'HOLD TO INFLATE';
}


// --- EVENT LISTENERS (Handles both mouse and touch for phone/web) ---

// Start Inflation (Mouse Down and Touch Start)
button.addEventListener('mousedown', startInflation);
button.addEventListener('touchstart', startInflation);

// Stop Inflation (Mouse Up and Touch End)
button.addEventListener('mouseup', stopInflation);
button.addEventListener('touchend', stopInflation);

// Stop Inflation if mouse/finger leaves the button area (Crucial for mobile)
button.addEventListener('mouseleave', () => {
    if (isInflating && event.buttons === 0) { // Check if mouse button is not pressed
        stopInflation();
    }
});
button.addEventListener('touchcancel', stopInflation); // For interrupted touches
