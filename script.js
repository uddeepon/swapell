document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('grid');
    const undoButton = document.getElementById('undoButton');
    const showCluesButton = document.getElementById('showCluesButton');
    const cluesElement = document.getElementById('clues');
    const rowCluesElement = document.getElementById('rowClues');
    const colCluesElement = document.getElementById('colClues');
    const turnCounterElement = document.getElementById('turnCounter');

    let grid = [
        ['D', 'A', 'R', 'T'],
        ['A', 'R', 'E', 'A'],
        ['R', 'E', 'A', 'L'],
        ['T', 'A', 'L', 'C']
    ];

    const correctWords = {
        rows: ["DART", "AREA", "REAL", "TALC"],
        columns: ["DART", "AREA", "REAL", "TALC"]
    };

    const clues = {
        rows: ["A small pointed missile", "A region or part", "Genuine", "A soft mineral"],
        columns: ["A small pointed missile", "A region or part", "Genuine", "A soft mineral"]
    };

    let moveHistory = [];
    let turnCount = 0;
    const maxTurns = 6;

    showCluesButton.addEventListener('click', () => {
        cluesElement.style.display = 'block';
    });

    function createGrid() {
        gridElement.innerHTML = '';
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = grid[row][col];
                cell.setAttribute('draggable', true);
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('dragstart', onDragStart);
                cell.addEventListener('dragover', onDragOver);
                cell.addEventListener('drop', onDrop);

                // Add touch event listeners
                cell.addEventListener('touchstart', onTouchStart);
                cell.addEventListener('touchmove', onTouchMove);
                cell.addEventListener('touchend', onTouchEnd);

                gridElement.appendChild(cell);
            }
        }
        updateClues();
        checkGrid();
    }

    function updateClues() {
        rowCluesElement.textContent = clues.rows.join(', ');
        colCluesElement.textContent = clues.columns.join(', ');
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
                const cell = gridElement.children[row * grid.length + col];
                if (allCorrect) {
                    cell.style.backgroundColor = 'green';
                } else {
                    cell.style.backgroundColor = 'white';
                }
            }
        }

        if (allCorrect) {
            setTimeout(() => {
                alert('Solved!');
            }, 100);
        } else if (turnCount >= maxTurns && !allCorrect) {
            alert('You have completed 6 turns.');
        }
    }

    function controlledJumble() {
        // Perform exactly 6 swaps to ensure it can be solved in 6 turns
        const swaps = [
            { from: [0, 0], to: [0, 1] },
            { from: [1, 0], to: [2, 0] },
            { from: [1, 2], to: [1, 3] },
            { from: [2, 1], to: [2, 2] },
            { from: [3, 1], to: [3, 2] },
            { from: [3, 3], to: [3, 2] }
        ];

        swaps.forEach(swap => {
            const from = swap.from;
            const to = swap.to;
            [grid[from[0]][from[1]], grid[to[0]][to[1]]] = [grid[to[0]][to[1]], grid[from[0]][from[1]]];
        });
    }

    let draggedCell = null;
    let touchedCell = null;

    function onDragStart(event) {
        draggedCell = event.target;
    }

    function onDragOver(event) {
        event.preventDefault();
    }

    function onDrop(event) {
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

    function onTouchStart(event) {
        const touch = event.touches[0];
        touchedCell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (touchedCell) {
            touchedCell.classList.add('touched');
        }
    }

    function onTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const targetCell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (targetCell && touchedCell !== targetCell) {
            touchedCell.classList.remove('touched');
            touchedCell = targetCell;
            touchedCell.classList.add('touched');
        }
    }

    function onTouchEnd(event) {
        if (!touchedCell) return;

        const targetRow = touchedCell.dataset.row;
        const targetCol = touchedCell.dataset.col;
        const touchedRow = draggedCell.dataset.row;
        const touchedCol = draggedCell.dataset.col;

        // Check if the swap is valid (only one tile horizontally or vertically)
        if ((Math.abs(targetRow - touchedRow) === 1 && targetCol === touchedCol) || 
            (Math.abs(targetCol - touchedCol) === 1 && targetRow === touchedRow)) {
            
            // Save the current move to history
            moveHistory.push({
                from: { row: touchedRow, col: touchedCol, letter: grid[touchedRow][touchedCol] },
                to: { row: targetRow, col: targetCol, letter: grid[targetRow][targetCol] }
            });

            // Swap the letters
            [grid[targetRow][targetCol], grid[touchedRow][touchedCol]] = [grid[touchedRow][touchedCol], grid[targetRow][targetCol]];

            turnCount++;
            updateTurnCounter();
            createGrid();
        }

        touchedCell.classList.remove('touched');
        touchedCell = null;
    }

    function updateTurnCounter() {
        turnCounterElement.textContent = turnCount;
        if (turnCount >= maxTurns && !checkAllCorrect()) {
            alert('You have completed 6 turns.');
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
        updateTurnCounter();
        grid = [
            ['D', 'A', 'R', 'T'],
            ['A', 'R', 'E', 'A'],
            ['R', 'E', 'A', 'L'],
            ['T', 'A', 'L', 'C']
        ];
        controlledJumble();
        createGrid();
    }

    undoButton.addEventListener('click', () => {
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            grid[lastMove.from.row][lastMove.from.col] = lastMove.from.letter;
            grid[lastMove.to.row][lastMove.to.col] = lastMove.to.letter;
            turnCount--;
            updateTurnCounter();
            createGrid();
        }
    });

    controlledJumble();
    createGrid();
});
