'use strict';

const bombNum = 10;
const fieldWidth = 20;
const fieldHeight = 10;

let cellCount = fieldWidth * fieldHeight;

let field = {};
let indexCells = [];
let indexBombs = [];
let indexActiveCell = {};
let indexEmpty = [];

const fieldContainer = document.getElementById('field');

const getIndexCells = function () {
    for (let i = 0; i < fieldHeight; i++) {
        for (let j = 0; j < fieldWidth; j++) {
            indexCells.push({x: i, y: j});
        }
    }
}();

const getIndexBombs = function (cellFirst) {
    indexBombs = indexCells.slice(0);

    indexBombs = indexBombs.filter(function (item) {
        return JSON.stringify(item) !== JSON.stringify(cellFirst);
    });

    function compareRandom(a, b) {
        return Math.random() - 0.5;
    }

    indexBombs.sort(compareRandom).splice(bombNum);
};

const setActiveCells = function () {
    let indexActiveCellTemp = indexBombs.map(function (item) {
        return {
            x: item.x,
            y: item.y,
            isBomb: true,
        };
    });

    console.log(indexActiveCellTemp);


    indexBombs.forEach(function (item) {
        for (let i = item.x - 1; i <= item.x + 1; i++) {
            for (let j = item.y - 1; j <= item.y + 1; j++) {
                if (!(i < 0 || j < 0 || i >= fieldHeight || j >= fieldWidth) && !(item.x === i && item.y === j)) {
                    indexActiveCellTemp.push({x: i, y: j, isBomb: false, count: 1});
                }
            }
        }
    });

    console.log(indexActiveCellTemp);

    function compareIndex(a, b) {
        return a.x - b.x || a.y - b.y;
    }

    indexActiveCellTemp.sort(compareIndex);

    let privious;

    indexActiveCellTemp.forEach(function (item) {
        if (!privious || !(privious.x === item.x && privious.y === item.y)) {
            indexActiveCell[`x: ${item.x}, y: ${item.y}`] = {
                'isBomb': item.isBomb,
                'count': item.count
            };
        } else {
            if (!privious.isBomb && item.count) {
                indexActiveCell[`x: ${item.x}, y: ${item.y}`].count++;
            }
        }
        privious = item;
    });
};

const checkEmptyCell = function (currentCell) {


   // console.log(currentCell);

    for (let i = currentCell.x - 1; i <= currentCell.x + 1; i++) {
        for (let j = currentCell.y - 1; j <= currentCell.y + 1; j++) {
            if (!(i < 0 || j < 0 || i >= fieldHeight || j >= fieldWidth)) {


                    let activeCell = document.getElementById(`${i}-${j}`);

                    activeCell.classList.add("is-safe");
                    activeCell.removeEventListener('click', getStatusCell);


                    let flag = indexEmpty.some(function (item) {
                        return (item.x === i && item.y === j);
                    });

                    if (!flag) {
                        if (`x: ${i}, y: ${j}` in indexActiveCell) {
                            if(!activeCell.innerHTML) {
                                activeCell.innerHTML += indexActiveCell[`x: ${i}, y: ${j}`].count;
                                cellCount--;
                            }
                        } else {
                            indexEmpty.push({x: i, y: j, isChecked: false});
                        }

                    }

            }
        }
    }

    for (let item of indexEmpty) {
        if (!item.isChecked) {
            item.isChecked = true;
            checkEmptyCell({'x': item.x, 'y': item.y});
            break;
        }
    }

    cellCount--;

    //console.log(cellCount);

};

const getStatusCell = function () {
    console.log('click');


    let _self = this;
    let x = +_self.id.split('-')[0];
    let y = +_self.id.split('-')[1];
    let currentCoords = `x: ${x}, y: ${y}`;
    let currentCoordsObJ = {'x': x, 'y': y};

    if (fieldContainer.dataset.start) {
        if (indexActiveCell[currentCoords]) {
            if (indexActiveCell[currentCoords].isBomb) {
                _self.classList.add("is-bomb");
            } else {
                _self.classList.add("is-safe");
                _self.innerHTML = indexActiveCell[currentCoords].count;
                cellCount--;
                indexEmpty.push({'x': x, 'y': y, isChecked: true});
            }
        } else {
            _self.classList.add("is-safe");
            indexEmpty.length = 0;
            checkEmptyCell(currentCoordsObJ);
        }

    } else {
        _self.classList.add("is-safe");
        fieldContainer.dataset.start = true;
        getIndexBombs(currentCoordsObJ);
        setActiveCells();
        if (indexActiveCell[currentCoords]) {
            _self.innerHTML = indexActiveCell[currentCoords].count;
            cellCount--;
            indexEmpty.push({'x': x, 'y': y, isChecked: true});
        } else {
            indexEmpty.length = 0;
            checkEmptyCell(currentCoordsObJ);
        }
    }

    _self.removeEventListener('click', getStatusCell);

   // console.log(indexEmpty);
};

for (var i = 0; i < fieldHeight; i++) {
    const fieldRowContainer = document.createElement('div');
    fieldRowContainer.className = 'field__row';
    fieldContainer.appendChild(fieldRowContainer);
    for (var j = 0; j < fieldWidth; j++) {
        const fieldCellContainer = document.createElement('button');
        fieldCellContainer.className = 'field__btn';
        fieldCellContainer.setAttribute('id', `${i}-${j}`);
        fieldCellContainer.addEventListener('click', getStatusCell);
        fieldRowContainer.appendChild(fieldCellContainer);
    }
}


for (let key in fieldCells) {
    if (!fieldCells[key].count && !fieldCells[key].isBomb) {
        for (let item in fieldCells[key].nearEmptyCells) {
            let currentCell = fieldCells[key].nearEmptyCells[item];

            Object.assign(fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearEmptyCells, fieldCells[key].nearEmptyCells);
            fieldCells[key].nearEmptyCells = fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearEmptyCells;

            Object.assign(fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearCountCells, fieldCells[key].nearCountCells);
            fieldCells[key].nearCountCells = fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearCountCells;
        }
    }
}
