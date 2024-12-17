let correctWord;
let guesses = [];
let currentGuess = "";
let validWords = [];
let hintAttemptsLeft = 3;

document.getElementById('hint-icon').onclick = async () => {
    if (hintAttemptsLeft > 0) {
        const response = await fetch('/get_hint'); 
        const data = await response.json();

        displayHintMessage(`Hint: ${data.hint}`); 
        hintAttemptsLeft--; 
    } else {
        alert("Anda telah menggunakan semua percobaan hint."); 
    }
};

// Listen for physical keyboard input
document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase(); 
    if (key === 'ENTER') {
        checkGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        
        handleKeyPress(key);
    }
    updateGrid();
});


function displayHintMessage(message) {
    const hintModal = document.getElementById('hint-modal');
    const hintMessageParagraph = document.getElementById('hint-message');
    
    hintMessageParagraph.textContent = message; 
    hintModal.style.display = 'block'; 

    
    document.querySelector('.close-button').onclick = () => {
        hintModal.style.display = 'none';   
    };

   
    window.onclick = (event) => {
        if (event.target == hintModal) {
            hintModal.style.display = 'none';
        }
    };
}



document.querySelector('.close-button').onclick = () => {
    document.getElementById('hint-modal').style.display = 'none';
};



window.onclick = (event) => {
    if (event.target == document.getElementById('hint-modal')) {
        document.getElementById('hint-modal').style.display = 'none';
    }
};


async function fetchNewWord() {
    const response = await fetch('/new_word');
    const data = await response.json();
    correctWord = data.word.toUpperCase(); 
    const description = data.description; 

    document.getElementById('message').textContent = `Hint: ${description}`; 
    await fetchValidWords(); 
}

async function fetchValidWords() {
    const response = await fetch('/valid_words');
    const data = await response.json();
    validWords = data.words; 
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

        
        if (index === 2) {
            const backspaceKey = document.createElement('button');
            backspaceKey.classList.add('key', 'key-backspace');
            backspaceKey.textContent = '⌫'; 
            backspaceKey.onclick = deleteLetter;
            rowDiv.appendChild(backspaceKey); 
        }

        
        row.split('').forEach(letter => {
            const key = document.createElement('button');
            key.classList.add('key');
            key.textContent = letter;
            key.onclick = () => handleKeyPress(letter);
            rowDiv.appendChild(key);
        });

        
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
        
        
        feedback.forEach((status, index) => {
            setTimeout(() => {
                const cell = row.childNodes[index];
                cell.classList.add('flip');
                if (status === 'green') {
                    cell.style.backgroundColor = 'green';
                } else if (status === 'yellow') {
                    cell.style.backgroundColor = 'yellow';
                } else {
                    cell.style.backgroundColor = 'gray';
                }
            }, index * 300); 
        });

        guesses.push(currentGuess);
        currentGuess = ""; 

        if (data.result === 'correct') {
            showWinnerPopup(); 
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
            cell.classList.add('scale'); 
            setTimeout(() => {
                cell.classList.remove('scale'); 
            }, 200);
        } else {
            cell.textContent = '';
        }
    });
}



function showPopup() {
    document.getElementById("gameInstructionsPopup").style.display = "block";
}


function closePopup() {
    document.getElementById("gameInstructionsPopup").style.display = "none";
}




window.onclick = function(event) {
    var popup = document.getElementById("gameInstructionsPopup");
    if (event.target === popup) {
        popup.style.display = "none";
    }
}


async function replayFunction() {
   
    const grid = document.getElementById('grid');
    grid.innerHTML = "";
    guesses = []; 
    currentGuess = ""; 

    
    createGrid();

   
    await fetchNewWord();

    
    const keyboardContainer = document.getElementById('keyboard');
    keyboardContainer.innerHTML = ""; 
    createKeyboard();

    
    hintAttemptsLeft = 3;

    
    alert("Game telah di-reset. Selamat bermain!");
}


function showWinnerPopup() {
    const winnerModal = document.getElementById('winner-modal');
    winnerModal.style.display = 'block'; 

    
    document.getElementById('winner-close-button').onclick = () => {
        winnerModal.style.display = 'none';
    };

    
    document.getElementById('play-again-button').onclick = () => {
        winnerModal.style.display = 'none'; 
        replayFunction(); 
    };

    
    window.onclick = (event) => {
        if (event.target == winnerModal) {
            winnerModal.style.display = 'none';
        }
    };
}







document.addEventListener('DOMContentLoaded', () => {

    fetchNewWord();
    createGrid();
    createKeyboard();


    const introModal = document.getElementById('intro-modal');
    const startGameButton = document.getElementById('start-game-btn');
    const closeIntroButton = document.querySelector('close-intro-button');

   
    introModal.style.display = 'flex';

   
    startGameButton.onclick = () => {
        introModal.style.display = 'none';
        fetchNewWord(); 
    };

    
    closeIntroButton.onclick = () => {
        introModal.style.display = 'none';
        fetchNewWord(); 
        
    };
     
});