let correctWord;
let guesses = [];
let currentGuess = "";
let validWords = [];

document.getElementById('hint-icon').onclick = async () => {
    const response = await fetch('/new_word'); // Minta kata baru beserta deskripsinya dari server
    const data = await response.json();
    const description = data.description; // Ambil deskripsi dari response
    
    document.getElementById('message').textContent = `Hint: ${description}`; // Tampilkan deskripsi di #message
};

// Fetch new word and valid words
async function fetchNewWord() {
    const response = await fetch('/new_word');
    const data = await response.json();
    correctWord = data.word.toUpperCase(); // Pastikan kata dalam huruf besar
    const description = data.description; // Ambil deskripsi kata

    document.getElementById('message').textContent = `Hint: ${description}`; // Tampilkan deskripsi sebagai hint
    await fetchValidWords(); // Fetch valid words dari server
}

async function fetchValidWords() {
    const response = await fetch('/valid_words');
    const data = await response.json();
    validWords = data.words; // Store valid words for checking
}

function createGrid() {
    const grid = document.getElementById('grid');
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function createKeyboard() {
    const keyboardContainer = document.getElementById('keyboard');
    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    rows.forEach((row, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');

        // For the third row, add the BACKSPACE key before 'Z'
        if (index === 2) {
            const backspaceKey = document.createElement('button');
            backspaceKey.classList.add('key', 'key-backspace');
            backspaceKey.textContent = '⌫'; // Backspace symbol
            backspaceKey.onclick = deleteLetter;
            rowDiv.appendChild(backspaceKey); // Add BACKSPACE before other keys
        }

        // Create keys for each letter in the row
        row.split('').forEach(letter => {
            const key = document.createElement('button');
            key.classList.add('key');
            key.textContent = letter;
            key.onclick = () => handleKeyPress(letter);
            rowDiv.appendChild(key);
        });

        // For the third row, after all letters, add the ENTER key
        if (index === 2) {
            const enterKey = document.createElement('button');
            enterKey.classList.add('key', 'key-enter');
            enterKey.textContent = 'Enter';
            enterKey.onclick = checkGuess;
            rowDiv.appendChild(enterKey); // Add ENTER at the end
        }

        keyboardContainer.appendChild(rowDiv);
    });
}




function handleKeyPress(letter) {
    if (letter === 'ENTER') {
        checkGuess();
    } else if (letter === 'BACKSPACE') {
        deleteLetter();
    } else if (currentGuess.length < 5) {
        currentGuess += letter;
    }
    updateGrid();
}

async function checkGuess() {
    if (currentGuess.length === 5) {
        const response = await fetch('/check_guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guess: currentGuess }),
        });

        const data = await response.json();
        const feedback = data.feedback;
        const row = document.querySelectorAll('.row')[guesses.length];
        
        // Apply flip animation with feedback
        feedback.forEach((status, index) => {
            setTimeout(() => {
                const cell = row.childNodes[index];
                cell.classList.add('flip'); // Add flip animation when checking
                if (status === 'green') {
                    cell.style.backgroundColor = 'green';
                } else if (status === 'yellow') {
                    cell.style.backgroundColor = 'yellow';
                } else {
                    cell.style.backgroundColor = 'gray';
                }
            }, index * 300); // Delay flip effect for better visibility
        });

        guesses.push(currentGuess);
        currentGuess = ""; // Reset guess

        if (data.result === 'correct') {
            alert("Congratulations! You've guessed the word correctly.");
        }
        
        updateGrid();
    }
}



function deleteLetter() {
    currentGuess = currentGuess.slice(0, -1);
    updateGrid();
}

function updateGrid() {
    const rows = document.querySelectorAll('.row');
    rows[guesses.length].childNodes.forEach((cell, index) => {
        if (currentGuess[index]) {
            cell.textContent = currentGuess[index] || '';
            cell.classList.add('scale'); // Add scale animation while typing
            setTimeout(() => {
                cell.classList.remove('scale'); // Remove the scale animation after it completes
            }, 200);
        } else {
            cell.textContent = '';
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    fetchNewWord();
    createGrid();
    createKeyboard();
});
