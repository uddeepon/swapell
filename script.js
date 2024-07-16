<script>
document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('grid');
    const undoButton = document.getElementById('undo');
    const resetButton = document.getElementById('reset');
    const cluesElement = document.getElementById('clues');
    const turnCounterElement = document.getElementById('turns');
    const cmsDataElement = document.getElementById('cms-data');
    const isNextElement = document.getElementById('is-next');

    gridElement.classList.add('grid');

    let grid = [];
    let correctWords = {
        rows: [],
        columns: []
    };
    let hints = [];

    // Fetch words and clues from hidden CMS data elements
    cmsDataElement.querySelectorAll('.word').forEach((wordElement, index) => {
        const word = wordElement.getAttribute('data-word');
        const clue = wordElement.getAttribute('data-clue');
        hints.push(clue);
        
        if (!grid[index]) grid[index] = [];
        for (let i = 0; i < word.length; i++) {
            grid[index][i] = word[i];
        }
        
        correctWords.rows.push(word);
    });

    // Generate column words based on the grid
    for (let col = 0; col < grid[0].length; col++) {
        let colWord = '';
        for (let row = 0; row < grid.length; row++) {
            colWord += grid[row][col];
        }
        correctWords.columns.push(colWord);
    }

    let moveHistory = [];
    let turnCount = 0;
    const maxTurns = 6;
    let selectedCell = null;
    let alertShown = false;

    cluesElement.textContent = hints.join(', ');

    function createGrid() {
        gridElement.innerHTML = '';
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const cell = document.createElement('div');
                cell.className = 'letter-block';
                cell.textContent = grid[row][col];
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.draggable = true;
                cell.addEventListener('click', onCellClick);
                cell.addEventListener('dragstart', onDragStart);
                cell.addEventListener('dragover', onDragOver);
                cell.addEventListener('drop', onDrop);

                gridElement.appendChild(cell);
            }
        }
        checkGrid();
    }

    function checkGrid() {
        let allCorrect = true;

        // Check rows
        for (let row = 0; row < grid.length; row++) {
            const rowWord = grid[row].join('');
            if (rowWord !== correctWords.rows[row]) {
                allCorrect = false;
                break;
            }
        }

        // Check columns
        if (allCorrect) {
            for (let col = 0; col < grid[0].length; col++) {
                let colWord = '';
                for (let row = 0; row < grid.length; row++) {
                    colWord += grid[row][col];
                }
                if (colWord !== correctWords.columns[col]) {
                    allCorrect = false;
                    break;
                }
            }
        }

        // Apply background colors
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const cell = gridElement.children[row * grid[row].length + col];
                cell.style.backgroundColor = allCorrect ? '#b3d9b3' : 'white';
            }
        }

        if (allCorrect) {
            setTimeout(() => {
                isNextElement.style.display = 'flex';
            }, 100);
        } else if (turnCount >= maxTurns && !allCorrect && !alertShown) {
            alertShown = true;
            alert('You have completed 6 turns. Try again!');
        }
    }

    function shuffleGrid() {
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 }, // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 } // right
        ];

        for (let i = 0; i < maxTurns; i++) {
            let fromRow, fromCol, toRow, toCol, direction;

            do {
                fromRow = Math.floor(Math.random() * 4);
                fromCol = Math.floor(Math.random() * 4);
                direction = directions[Math.floor(Math.random() * directions.length)];
                toRow = fromRow + direction.row;
                toCol = fromCol + direction.col;
            } while (
                toRow < 0 || toRow >= 4 || toCol < 0 || toCol >= 4 || 
                (toRow === fromRow && toCol === fromCol)
            );

            [grid[fromRow][fromCol], grid[toRow][toCol]] = [grid[toRow][toCol], grid[fromRow][fromCol]];
        }
    }

    function onCellClick(event) {
        if (turnCount >= maxTurns) {
            if (!alertShown) {
                alert('You have completed 6 turns. Try again!');
                alertShown = true;
            }
            return;
        }

        const cell = event.target;
        const row = cell.dataset.row;
        const col = cell.dataset.col;

        if (selectedCell) {
            // Check if the swap is valid (only one tile horizontally or vertically)
            const selectedRow = selectedCell.dataset.row;
            const selectedCol = selectedCell.dataset.col;

            if ((Math.abs(row - selectedRow) === 1 && col === selectedCol) || 
                (Math.abs(col - selectedCol) === 1 && row === selectedRow)) {
                
                // Save the current move to history
                moveHistory.push({
                    from: { row: selectedRow, col: selectedCol, letter: grid[selectedRow][selectedCol] },
                    to: { row: row, col: col, letter: grid[row][col] }
                });

                // Swap the letters
                [grid[row][col], grid[selectedRow][selectedCol]] = [grid[selectedRow][selectedCol], grid[row][col]];

                turnCount++;
                updateTurnCounter();
                createGrid();
            }
            selectedCell.classList.remove('selected');
            selectedCell = null;
        } else {
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
            selectedCell = cell;
            cell.classList.add('selected');
        }
    }

    let draggedCell = null;

    function onDragStart(event) {
        draggedCell = event.target;
    }

    function onDragOver(event) {
        event.preventDefault();
    }

    function onDrop(event) {
        if (turnCount >= maxTurns) {
            if (!alertShown) {
                alert('You have completed 6 turns. Please try again!');
                alertShown = true;
            }
            return;
        }

        const targetCell = event.target;
        const targetRow = targetCell.dataset.row;
        const targetCol = targetCell.dataset.col;
        const draggedRow = draggedCell.dataset.row;
        const draggedCol = draggedCell.dataset.col;

        // Check if the swap is valid (only one tile horizontally or vertically)
        if ((Math.abs(targetRow - draggedRow) === 1 && targetCol === draggedCol) || 
            (Math.abs(targetCol - draggedCol) === 1 && targetRow === draggedRow)) {
            
            // Save the current move to history
            moveHistory.push({
                from: { row: draggedRow, col: draggedCol, letter: grid[draggedRow][draggedCol] },
                to: { row: targetRow, col: targetCol, letter: grid[targetRow][targetCol] }
            });

            // Swap the letters
            [grid[targetRow][targetCol], grid[draggedRow][draggedCol]] = [grid[draggedRow][draggedCol], grid[targetRow][targetCol]];

            turnCount++;
            updateTurnCounter();
            createGrid();
        }
    }

    function updateTurnCounter() {
        turnCounterElement.textContent = `${turnCount}/${maxTurns}`;
        if (turnCount >= maxTurns && !checkAllCorrect() && !alertShown) {
            alertShown = true;
            alert('You have completed 6 turns. Try again!');
        }
    }

    function checkAllCorrect() {
        for (let row = 0; row < grid.length; row++) {
            const rowWord = grid[row].join('');
            if (rowWord !== correctWords.rows[row]) {
                return false;
            }
        }

        for (let col = 0; col < grid[0].length; col++) {
            let colWord = '';
            for (let row = 0; row < grid.length; row++) {
                colWord += grid[row][col];
            }
            if (colWord !== correctWords.columns[col]) {
                return false;
            }
        }

        return true;
    }

    function resetGame() {
        moveHistory = [];
        turnCount = 0;
        alertShown = false;
        updateTurnCounter();
        shuffleGrid();
        createGrid();
    }

    undoButton.addEventListener('click', () => {
        if (moveHistory.length > 0 && turnCount > 0) {
            const lastMove = moveHistory.pop();
            grid[lastMove.from.row][lastMove.from.col] = lastMove.from.letter;
            grid[lastMove.to.row][lastMove.to.col] = lastMove.to.letter;
            turnCount--;
            updateTurnCounter();
            createGrid();
        }
    });

    resetButton.addEventListener('click', resetGame);

    // Initially load the grid in the jumbled state
    resetGame();
});
</script>
