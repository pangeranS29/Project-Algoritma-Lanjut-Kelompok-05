let correctWord;
let guesses = [];
let currentGuess = "";
let validWords = [];
let hintAttemptsLeft = 3;

document.getElementById('hint-icon').onclick = async () => {
    if (hintAttemptsLeft > 0) {
        const response = await fetch('/get_hint'); // Minta hint dari server
        const data = await response.json();

        displayHintMessage(`Hint: ${data.hint}`); // Tampilkan hint di modal
        hintAttemptsLeft--; // Kurangi percobaan hint
    } else {
        alert("Anda telah menggunakan semua percobaan hint."); // Pemberitahuan jika tidak ada percobaan
    }
};

// Listen for physical keyboard input
document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase(); // Convert to uppercase to match the displayed keyboard
    if (key === 'ENTER') {
        checkGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        // Only accept letters A-Z for input and limit to 5 characters
        handleKeyPress(key);
    }
    updateGrid();
});

// Function to display hint message in a modal
function displayHintMessage(message) {
    const hintModal = document.getElementById('hint-modal');
    const hintMessageParagraph = document.getElementById('hint-message');
    
    hintMessageParagraph.textContent = message; // Set message text
    hintModal.style.display = 'block'; // Show modal

    // Add close functionality
    document.querySelector('.close-button').onclick = () => {
        hintModal.style.display = 'none'; // Hide modal when close button is clicked
    };

    // Optional: Hide modal when clicking outside of modal content
    window.onclick = (event) => {
        if (event.target == hintModal) {
            hintModal.style.display = 'none';
        }
    };
}

// Close modal when close button is clicked
document.querySelector('.close-button').onclick = () => {
    document.getElementById('hint-modal').style.display = 'none';
};

// Optional: Close modal when clicking outside the modal content
window.onclick = (event) => {
    if (event.target == document.getElementById('hint-modal')) {
        document.getElementById('hint-modal').style.display = 'none';
    }
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
            showWinnerPopup(); // Tampilkan popup winner
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


// Function to show the popup
function showPopup() {
    document.getElementById("gameInstructionsPopup").style.display = "block";
}

// Function to close the popup
function closePopup() {
    document.getElementById("gameInstructionsPopup").style.display = "none";
}



// Close popup when user clicks outside of it
window.onclick = function(event) {
    var popup = document.getElementById("gameInstructionsPopup");
    if (event.target === popup) {
        popup.style.display = "none";
    }
}

// Fungsi untuk mereset permainan
async function replayFunction() {
    // Bersihkan grid dan reset array tebakannya
    const grid = document.getElementById('grid');
    grid.innerHTML = ""; // Hapus grid lama
    guesses = []; // Reset tebakan sebelumnya
    currentGuess = ""; // Reset tebakan saat ini

    // Buat grid baru
    createGrid();

    // Ambil kata baru dari server
    await fetchNewWord();

    // Reset keyboard
    const keyboardContainer = document.getElementById('keyboard');
    keyboardContainer.innerHTML = ""; // Hapus keyboard lama
    createKeyboard();

    // Reset hint counter
    hintAttemptsLeft = 3;

    // Notifikasi untuk pengguna
    alert("Game telah di-reset. Selamat bermain!");
}


function showWinnerPopup() {
    const winnerModal = document.getElementById('winner-modal');
    winnerModal.style.display = 'block'; // Tampilkan modal

    // Tambahkan event untuk tombol tutup
    document.getElementById('winner-close-button').onclick = () => {
        winnerModal.style.display = 'none'; // Sembunyikan modal
    };

    // Tambahkan event untuk tombol "Main Lagi"
    document.getElementById('play-again-button').onclick = () => {
        winnerModal.style.display = 'none'; // Sembunyikan modal
        replayFunction(); // Reset game
    };

    // Tutup modal jika klik di luar konten
    window.onclick = (event) => {
        if (event.target == winnerModal) {
            winnerModal.style.display = 'none';
        }
    };
}







// Display the introductory modal when the page loads
document.addEventListener('DOMContentLoaded', () => {

    fetchNewWord();
    createGrid();
    createKeyboard();


    const introModal = document.getElementById('intro-modal');
    const startGameButton = document.getElementById('start-game-btn');
    const closeIntroButton = document.querySelector('close-intro-button');

    // Show the intro modal
    introModal.style.display = 'flex';

    // Hide the modal when clicking the start game button
    startGameButton.onclick = () => {
        introModal.style.display = 'none';
        fetchNewWord(); // Start the game by fetching a new word
    };

    // Also allow closing the modal with the close button
    closeIntroButton.onclick = () => {
        introModal.style.display = 'none';
        fetchNewWord(); // Start the game if closed with the close button

        
    };
     
});