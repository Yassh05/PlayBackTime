// Global Game State
let currentPage = 'home';
let currentTheme = 'dark';

// Rock Paper Scissors State
let rpsScore = { player: 0, computer: 0 };
let rpsIsPlaying = false;

// Tic Tac Toe State
let tttBoard = Array(9).fill(null);
let tttCurrentPlayer = 'X';
let tttWinner = null;
let tttScore = { X: 0, O: 0, ties: 0 };
let tttGameMode = 'pvp';

// Memory Game State
let memoryCards = [];
let memoryFlippedCards = [];
let memoryMoves = 0;
let memoryMatches = 0;
let memoryGameStarted = false;
let memoryGameCompleted = false;
let memoryTime = 0;
let memoryTimer = null;
let memoryBestTime = localStorage.getItem('memoryGameBestTime') ? parseInt(localStorage.getItem('memoryGameBestTime')) : null;

// Snake and Ladders State
let snlPlayers = [
    { id: 1, name: 'Player 1', position: 0, color: 'player-1' },
    { id: 2, name: 'Player 2', position: 0, color: 'player-2' }
];
let snlCurrentPlayerIndex = 0;
let snlDiceValue = null;
let snlIsRolling = false;
let snlWinner = null;
let snlGameMessage = '';

const snlSnakes = {
    16: 6, 47: 26, 49: 11, 56: 53, 62: 19,
    64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};

const snlLadders = {
    1: 38, 4: 14, 9: 21, 21: 42, 28: 84,
    36: 44, 51: 67, 71: 91, 80: 100
};

const memoryEmojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    applyTheme(currentTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (theme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.className = 'fas fa-moon';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
    }
}

// Page Management
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName + '-page').classList.add('active');
    currentPage = pageName;
    
    // Initialize game if needed
    if (pageName === 'memory') {
        initMemoryGame();
    } else if (pageName === 'snakeladders') {
        initSnakeAndLadders();
    } else if (pageName === 'tictactoe') {
        initTicTacToe();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Add click listeners to game cards
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            showPage(game);
        });
    });
    
    // Add keyboard navigation for game cards
    document.querySelectorAll('.game-card').forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const game = this.getAttribute('data-game');
                showPage(game);
            }
        });
    });
    
    // Initialize memory game best time display
    updateMemoryBestTime();
    
    // Initialize Snake and Ladders board
    initSnakeAndLadders();
    
    // Add click listeners for Tic Tac Toe
    document.querySelectorAll('.ttt-cell').forEach((cell, index) => {
        cell.addEventListener('click', () => makeTicTacToeMove(index));
    });
});

// Rock Paper Scissors Functions
function playRPS(playerChoice) {
    if (rpsIsPlaying) return;
    
    rpsIsPlaying = true;
    document.getElementById('player-choice').textContent = getChoiceEmoji(playerChoice);
    
    // Animate computer choice
    let counter = 0;
    const choices = ['rock', 'paper', 'scissors'];
    const interval = setInterval(() => {
        document.getElementById('computer-choice').textContent = getChoiceEmoji(choices[counter % 3]);
        counter++;
        
        if (counter >= 10) {
            clearInterval(interval);
            
            // Final computer choice
            const computerChoice = choices[Math.floor(Math.random() * 3)];
            document.getElementById('computer-choice').textContent = getChoiceEmoji(computerChoice);
            
            // Determine result
            let result;
            if (playerChoice === computerChoice) {
                result = 'tie';
            } else if (
                (playerChoice === 'rock' && computerChoice === 'scissors') ||
                (playerChoice === 'paper' && computerChoice === 'rock') ||
                (playerChoice === 'scissors' && computerChoice === 'paper')
            ) {
                result = 'win';
                rpsScore.player++;
            } else {
                result = 'lose';
                rpsScore.computer++;
            }
            
            // Update display
            updateRPSDisplay(result);
            rpsIsPlaying = false;
        }
    }, 100);
}

function getChoiceEmoji(choice) {
    const emojis = {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️'
    };
    return emojis[choice] || '❓';
}

function updateRPSDisplay(result) {
    const messages = {
        win: '🎉 You Win!',
        lose: '😔 You Lose!',
        tie: '🤝 It\'s a Tie!'
    };
    
    document.getElementById('rps-result').textContent = messages[result] || '';
    document.getElementById('player-score').textContent = rpsScore.player;
    document.getElementById('computer-score').textContent = rpsScore.computer;
}

function resetRPS() {
    rpsScore = { player: 0, computer: 0 };
    document.getElementById('player-choice').textContent = '❓';
    document.getElementById('computer-choice').textContent = '❓';
    document.getElementById('rps-result').textContent = '';
    updateRPSDisplay();
}

// Tic Tac Toe Functions
function initTicTacToe() {
    tttBoard = Array(9).fill(null);
    tttCurrentPlayer = 'X';
    tttWinner = null;
    updateTicTacToeDisplay();
    updateTicTacToeBoard();
}

function setGameMode(mode) {
    tttGameMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode === 'pvp' ? 'pvp-btn' : 'ai-btn').classList.add('active');
    
    // Update labels
    document.getElementById('x-label').textContent = mode === 'ai' ? 'You' : 'Player X';
    document.getElementById('o-label').textContent = mode === 'ai' ? 'AI' : 'Player O';
    document.getElementById('ttt-instructions').textContent = mode === 'ai' 
        ? 'Click any empty square to make your move!' 
        : 'Players take turns clicking empty squares to place their mark!';
    
    newTicTacToeGame();
}

function makeTicTacToeMove(index) {
    if (tttBoard[index] || tttWinner) return;
    
    tttBoard[index] = tttCurrentPlayer;
    updateTicTacToeBoard();
    
    const gameResult = checkTicTacToeWinner();
    if (gameResult) {
        tttWinner = gameResult;
        if (gameResult === 'tie') {
            tttScore.ties++;
        } else {
            tttScore[gameResult]++;
        }
        updateTicTacToeDisplay();
    } else {
        tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
        updateTicTacToeDisplay();
        
        // AI move
        if (tttGameMode === 'ai' && tttCurrentPlayer === 'O' && !tttWinner) {
            setTimeout(() => {
                const aiMove = getTicTacToeAIMove();
                makeTicTacToeMove(aiMove);
            }, 500);
        }
    }
}

function checkTicTacToeWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
            return tttBoard[a];
        }
    }
    
    if (tttBoard.every(cell => cell !== null)) {
        return 'tie';
    }
    
    return null;
}

function getTicTacToeAIMove() {
    const availableMoves = tttBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    // Try to win
    for (const move of availableMoves) {
        const testBoard = [...tttBoard];
        testBoard[move] = 'O';
        if (checkTicTacToeWinnerForBoard(testBoard) === 'O') {
            return move;
        }
    }
    
    // Block player from winning
    for (const move of availableMoves) {
        const testBoard = [...tttBoard];
        testBoard[move] = 'X';
        if (checkTicTacToeWinnerForBoard(testBoard) === 'X') {
            return move;
        }
    }
    
    // Take center if available
    if (availableMoves.includes(4)) {
        return 4;
    }
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => availableMoves.includes(corner));
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function checkTicTacToeWinnerForBoard(board) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    return null;
}

function updateTicTacToeBoard() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach((cell, index) => {
        cell.textContent = tttBoard[index] || '';
        cell.className = 'ttt-cell';
        if (tttBoard[index]) {
            cell.classList.add(tttBoard[index].toLowerCase());
        }
        cell.disabled = tttBoard[index] !== null || tttWinner !== null || (tttGameMode === 'ai' && tttCurrentPlayer === 'O');
    });
}

function updateTicTacToeDisplay() {
    document.getElementById('x-score').textContent = tttScore.X;
    document.getElementById('o-score').textContent = tttScore.O;
    document.getElementById('tie-score').textContent = tttScore.ties;
    
    const statusElement = document.getElementById('ttt-status');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    if (tttWinner === 'tie') {
        statusElement.textContent = "It's a Tie!";
        playAgainBtn.classList.remove('hidden');
    } else if (tttWinner === 'X') {
        statusElement.textContent = tttGameMode === 'ai' ? 'You Win! 🎉' : 'Player X Wins! 🎉';
        playAgainBtn.classList.remove('hidden');
    } else if (tttWinner === 'O') {
        statusElement.textContent = tttGameMode === 'ai' ? 'AI Wins! 🤖' : 'Player O Wins! 🎉';
        playAgainBtn.classList.remove('hidden');
    } else {
        statusElement.textContent = `Player ${tttCurrentPlayer}'s Turn`;
        playAgainBtn.classList.add('hidden');
    }
}

function newTicTacToeGame() {
    tttBoard = Array(9).fill(null);
    tttCurrentPlayer = 'X';
    tttWinner = null;
    updateTicTacToeDisplay();
    updateTicTacToeBoard();
}

function resetTicTacToe() {
    tttScore = { X: 0, O: 0, ties: 0 };
    newTicTacToeGame();
}

// Memory Game Functions
function initMemoryGame() {
    const gameEmojis = [...memoryEmojis, ...memoryEmojis];
    const shuffledEmojis = gameEmojis.sort(() => Math.random() - 0.5);
    
    memoryCards = shuffledEmojis.map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
    }));
    
    memoryFlippedCards = [];
    memoryMoves = 0;
    memoryMatches = 0;
    memoryGameStarted = false;
    memoryGameCompleted = false;
    memoryTime = 0;
    
    if (memoryTimer) {
        clearInterval(memoryTimer);
        memoryTimer = null;
    }
    
    updateMemoryDisplay();
    createMemoryBoard();
    
    // Hide completion message
    document.getElementById('memory-completion').classList.add('hidden');
}

function createMemoryBoard() {
    const board = document.getElementById('memory-board');
    board.innerHTML = '';
    
    memoryCards.forEach(card => {
        const cardElement = document.createElement('button');
        cardElement.className = 'memory-card';
        cardElement.setAttribute('data-id', card.id);
        cardElement.setAttribute('aria-label', 'Memory card');
        cardElement.innerHTML = `<div class="card-content">${card.emoji}</div>`;
        cardElement.addEventListener('click', () => flipMemoryCard(card.id));
        board.appendChild(cardElement);
    });
}

function flipMemoryCard(cardId) {
    if (!memoryGameStarted) {
        memoryGameStarted = true;
        startMemoryTimer();
    }
    
    if (memoryFlippedCards.length === 2) return;
    
    const card = memoryCards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    card.isFlipped = true;
    memoryFlippedCards.push(cardId);
    
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);
    cardElement.classList.add('flipped');
    
    if (memoryFlippedCards.length === 2) {
        memoryMoves++;
        updateMemoryDisplay();
        
        const [firstCardId, secondCardId] = memoryFlippedCards;
        const firstCard = memoryCards.find(c => c.id === firstCardId);
        const secondCard = memoryCards.find(c => c.id === secondCardId);
        
        if (firstCard.emoji === secondCard.emoji) {
            // Match found
            setTimeout(() => {
                firstCard.isMatched = true;
                secondCard.isMatched = true;
                document.querySelector(`[data-id="${firstCardId}"]`).classList.add('matched');
                document.querySelector(`[data-id="${secondCardId}"]`).classList.add('matched');
                memoryMatches++;
                memoryFlippedCards = [];
                updateMemoryDisplay();
                
                // Check if game is completed
                if (memoryMatches === memoryEmojis.length) {
                    completeMemoryGame();
                }
            }, 1000);
        } else {
            // No match
            setTimeout(() => {
                firstCard.isFlipped = false;
                secondCard.isFlipped = false;
                document.querySelector(`[data-id="${firstCardId}"]`).classList.remove('flipped');
                document.querySelector(`[data-id="${secondCardId}"]`).classList.remove('flipped');
                memoryFlippedCards = [];
            }, 1000);
        }
    }
}

function startMemoryTimer() {
    memoryTimer = setInterval(() => {
        memoryTime++;
        updateMemoryDisplay();
    }, 1000);
}

function completeMemoryGame() {
    memoryGameCompleted = true;
    if (memoryTimer) {
        clearInterval(memoryTimer);
        memoryTimer = null;
    }
    
    const isNewRecord = !memoryBestTime || memoryTime < memoryBestTime;
    if (isNewRecord) {
        memoryBestTime = memoryTime;
        localStorage.setItem('memoryGameBestTime', memoryTime.toString());
        updateMemoryBestTime();
        document.getElementById('new-record').classList.remove('hidden');
    } else {
        document.getElementById('new-record').classList.add('hidden');
    }
    
    document.getElementById('completion-text').textContent = 
        `You completed the game in ${formatTime(memoryTime)} with ${memoryMoves} moves!`;
    document.getElementById('memory-completion').classList.remove('hidden');
}

function updateMemoryDisplay() {
    document.getElementById('memory-time').textContent = formatTime(memoryTime);
    document.getElementById('memory-moves').textContent = memoryMoves;
    document.getElementById('memory-matches').textContent = `${memoryMatches}/${memoryEmojis.length}`;
}

function updateMemoryBestTime() {
    document.getElementById('memory-best').textContent = memoryBestTime ? formatTime(memoryBestTime) : '--:--';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Snake and Ladders Functions
function initSnakeAndLadders() {
    createSnakeAndLaddersBoard();
    updateSnakeAndLaddersDisplay();
}

function createSnakeAndLaddersBoard() {
    const board = document.getElementById('snl-board');
    board.innerHTML = '';
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const squareNumber = getSquareNumber(row, col);
            const cell = document.createElement('div');
            cell.className = 'snl-cell';
            
            // Add special classes
            if (squareNumber === 1) cell.classList.add('start');
            if (squareNumber === 100) cell.classList.add('end');
            if (snlSnakes[squareNumber]) cell.classList.add('snake');
            if (snlLadders[squareNumber]) cell.classList.add('ladder');
            
            // Add content
            cell.innerHTML = `
                <span class="cell-number">${squareNumber}</span>
                ${snlSnakes[squareNumber] ? '<span class="cell-icon">🐍</span>' : ''}
                ${snlLadders[squareNumber] ? '<span class="cell-icon">🪜</span>' : ''}
                <div class="cell-players" id="players-${squareNumber}"></div>
            `;
            
            board.appendChild(cell);
        }
    }
    
    updatePlayerPositions();
}

function getSquareNumber(row, col) {
    const isEvenRow = row % 2 === 0;
    return isEvenRow 
        ? (9 - row) * 10 + col + 1
        : (9 - row) * 10 + (10 - col);
}

function updatePlayerPositions() {
    // Clear all player positions
    document.querySelectorAll('.cell-players').forEach(cell => {
        cell.innerHTML = '';
    });
    
    // Add players to their current positions
    snlPlayers.forEach(player => {
        if (player.position > 0) {
            const playersContainer = document.getElementById(`players-${player.position}`);
            if (playersContainer) {
                const playerDot = document.createElement('div');
                playerDot.className = `player-dot ${player.color}`;
                playersContainer.appendChild(playerDot);
            }
        }
    });
}

function rollDice() {
    if (snlIsRolling || snlWinner) return;
    
    snlIsRolling = true;
    snlGameMessage = '';
    
    // Animate dice roll
    let counter = 0;
    const interval = setInterval(() => {
        snlDiceValue = Math.floor(Math.random() * 6) + 1;
        document.getElementById('dice').textContent = snlDiceValue;
        counter++;
        
        if (counter >= 10) {
            clearInterval(interval);
            const finalDiceValue = Math.floor(Math.random() * 6) + 1;
            snlDiceValue = finalDiceValue;
            document.getElementById('dice').textContent = finalDiceValue;
            movePlayer(finalDiceValue);
            snlIsRolling = false;
        }
    }, 100);
}

function movePlayer(steps) {
    const currentPlayer = snlPlayers[snlCurrentPlayerIndex];
    let newPosition = currentPlayer.position + steps;
    
    // Check if player would go beyond 100
    if (newPosition > 100) {
        snlGameMessage = `${currentPlayer.name} needs exactly ${100 - currentPlayer.position} to win!`;
        snlCurrentPlayerIndex = (snlCurrentPlayerIndex + 1) % snlPlayers.length;
        updateSnakeAndLaddersDisplay();
        return;
    }
    
    // Check for ladders
    if (snlLadders[newPosition]) {
        const ladderTop = snlLadders[newPosition];
        snlGameMessage = `${currentPlayer.name} climbed a ladder from ${newPosition} to ${ladderTop}! 🪜`;
        newPosition = ladderTop;
    }
    
    // Check for snakes
    if (snlSnakes[newPosition]) {
        const snakeBottom = snlSnakes[newPosition];
        snlGameMessage = `${currentPlayer.name} was bitten by a snake and slid from ${newPosition} to ${snakeBottom}! 🐍`;
        newPosition = snakeBottom;
    }
    
    // Update player position
    currentPlayer.position = newPosition;
    updatePlayerPositions();
    
    // Check for winner
    if (newPosition === 100) {
        snlWinner = currentPlayer;
        snlGameMessage = `🎉 ${currentPlayer.name} wins the game! 🎉`;
    } else {
        snlCurrentPlayerIndex = (snlCurrentPlayerIndex + 1) % snlPlayers.length;
    }
    
    updateSnakeAndLaddersDisplay();
}

function updateSnakeAndLaddersDisplay() {
    // Update current player
    const currentPlayer = snlPlayers[snlCurrentPlayerIndex];
    const currentPlayerElement = document.getElementById('current-player');
    currentPlayerElement.className = `current-player ${currentPlayer.color}`;
    currentPlayerElement.innerHTML = `
        <div class="player-name">${currentPlayer.name}</div>
        <div class="player-position">Position: ${currentPlayer.position}</div>
    `;
    
    // Update players list
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    snlPlayers.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = `player-item ${player.id === currentPlayer.id ? 'active' : ''}`;
        playerItem.innerHTML = `
            <div class="player-info">
                <div class="player-color ${player.color}"></div>
                <span class="player-name">${player.name}</span>
                ${snlWinner && snlWinner.id === player.id ? '<i class="fas fa-crown" style="color: #fbbf24; margin-left: 0.5rem;"></i>' : ''}
            </div>
            <span class="player-position">${player.position}</span>
        `;
        playersList.appendChild(playerItem);
    });
    
    // Update game message
    const messageElement = document.getElementById('game-message');
    const messageText = document.getElementById('message-text');
    if (snlGameMessage) {
        messageText.textContent = snlGameMessage;
        messageElement.classList.remove('hidden');
    } else {
        messageElement.classList.add('hidden');
    }
    
    // Update winner display
    const winnerCard = document.getElementById('winner-card');
    const winnerName = document.getElementById('winner-name');
    if (snlWinner) {
        winnerName.textContent = `${snlWinner.name} wins!`;
        winnerCard.classList.remove('hidden');
        document.getElementById('roll-btn').disabled = true;
    } else {
        winnerCard.classList.add('hidden');
        document.getElementById('roll-btn').disabled = snlIsRolling;
    }
}

function resetSnakeAndLadders() {
    snlPlayers.forEach(player => {
        player.position = 0;
    });
    snlCurrentPlayerIndex = 0;
    snlDiceValue = null;
    snlWinner = null;
    snlGameMessage = '';
    document.getElementById('dice').textContent = '?';
    updatePlayerPositions();
    updateSnakeAndLaddersDisplay();
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key to go back to home
    if (e.key === 'Escape' && currentPage !== 'home') {
        showPage('home');
    }
    
    // T key to toggle theme
    if (e.key === 't' || e.key === 'T') {
        toggleTheme();
    }
});

// Touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartY - touchEndY;
    
    // Swipe up to go back to home (only on game pages)
    if (swipeDistance > swipeThreshold && currentPage !== 'home') {
        showPage('home');
    }
}