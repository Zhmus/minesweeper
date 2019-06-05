'use strict';

let MineSweeper = (function () {

    let game;

    class GameField {

        constructor(fieldWidth, fieldHeight, bombNumber) {
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;
            this.bombNumber = bombNumber;
        }

        bindClick(...self) {
            const _self = self[0];
            const currentCell = {x: +this.id.split('-')[0], y: +this.id.split('-')[1]};

            if (!_self.endGame) {
                if (!_self.fieldCells) return _self.createField(currentCell, this);
                _self.checkCell(currentCell, this);
            }
        }

        bindRightClick(...self) {
            const _self = self[0];
            const currentCell = {x: +this.id.split('-')[0], y: +this.id.split('-')[1]};
            if (!_self.endGame) {
                if (!_self.fieldCells) return _self.createField(currentCell, this);
                _self.addFlag(currentCell, this);
            }
        }

        createField(firstCell, firstElement) {
            const _self = this;
            const fieldHeight = _self.fieldHeight;
            const fieldWidth = _self.fieldWidth;
            _self.unCheckedCells = fieldHeight * fieldWidth;
            _self.fieldCells = {};
            let indexBombs = [];

            const setIndexCells = function () {
                for (let i = 0; i < fieldHeight; i++) {
                    for (let j = 0; j < fieldWidth; j++) {
                        indexBombs.push({x: i, y: j});
                        _self.fieldCells[`x: ${i}, y: ${j}`] = {
                            x: i,
                            y: j,
                            isBomb: false,
                            isChecked: false,
                            count: null,
                            isFlag: false,
                        }
                    }
                }
            }();

            const setIndexBombs = function () {
                indexBombs = indexBombs.filter(function (cell) {
                    return JSON.stringify(cell) !== JSON.stringify(firstCell);
                });

                function compareRandom() {
                    return Math.random() - 0.5;
                }

                indexBombs.sort(compareRandom).splice(_self.bombNumber);

                indexBombs.forEach(function (cell) {
                    _self.fieldCells[`x: ${cell.x}, y: ${cell.y}`].isBomb = true;
                });
            }();

            const setActiveCells = function () {
                let currentCell;
                indexBombs.forEach(function (cell) {
                    for (let i = cell.x - 1; i <= cell.x + 1; i++) {
                        for (let j = cell.y - 1; j <= cell.y + 1; j++) {
                            currentCell = _self.fieldCells[`x: ${i}, y: ${j}`];
                            if (currentCell) {
                                if (!currentCell.isBomb) {
                                    currentCell.count = currentCell.count || 0;
                                    currentCell.count++;
                                }
                            }
                        }
                    }
                });
            }();

            const setEmptyCells = function () {
                let fieldCells = _self.fieldCells;
                for (let key in fieldCells) {
                    if (!fieldCells[key].count && !fieldCells[key].isBomb) {

                        fieldCells[key].nearEmptyCells = {};
                        fieldCells[key].nearCountCells = {};

                        for (let i = fieldCells[key].x - 1; i <= fieldCells[key].x + 1; i++) {
                            for (let j = fieldCells[key].y - 1; j <= fieldCells[key].y + 1; j++) {
                                if (fieldCells[`x: ${i}, y: ${j}`] && !fieldCells[`x: ${i}, y: ${j}`].isBomb) {
                                    if (!fieldCells[`x: ${i}, y: ${j}`].count) {
                                        fieldCells[key].nearEmptyCells[`x: ${i}, y: ${j}`] = {
                                            x: i,
                                            y: j
                                        };
                                    } else {
                                        fieldCells[key].nearCountCells[`x: ${i}, y: ${j}`] = {
                                            x: i,
                                            y: j
                                        };
                                    }
                                }
                            }
                        }
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
            }();

            _self.checkCell(firstCell, firstElement);
        }

        checkCell(currentCell, currentElement) {
            const _self = this;
            let _currentCell = _self.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`];

            if (!_currentCell.isFlag) {
                if (_currentCell.isBomb) {
                    _self.finishGame(false);
                } else {
                    if (!currentElement.isChecked) {
                        currentElement.classList.add('is-safe');
                        if (_currentCell.count) {
                            currentElement.innerHTML = _currentCell.count;
                            _currentCell.isChecked = true;
                            _self.unCheckedCells--;
                        } else {
                            _currentCell.isChecked = true;

                            for (let key in _currentCell.nearEmptyCells) {
                                let nearEmptyCell = _self.fieldCells[`x: ${_currentCell.nearEmptyCells[key].x}, y: ${_currentCell.nearEmptyCells[key].y}`];
                                let nearEmptyElement = document.getElementById(`${_currentCell.nearEmptyCells[key].x}-${_currentCell.nearEmptyCells[key].y}`);
                                nearEmptyCell.isChecked = true;
                                nearEmptyCell.isFlag = false;
                                _self.unCheckedCells--;
                                nearEmptyElement.classList.remove('is-flag');
                                nearEmptyElement.classList.add('is-safe');
                            }

                            for (let key in _currentCell.nearCountCells) {
                                let nearCountCell = _self.fieldCells[`x: ${_currentCell.nearCountCells[key].x}, y: ${_currentCell.nearCountCells[key].y}`];
                                let nearCountElement = document.getElementById(`${_currentCell.nearCountCells[key].x}-${_currentCell.nearCountCells[key].y}`);
                                if (!nearCountCell.isChecked) {
                                    nearCountCell.isChecked = true;
                                    nearCountCell.isFlag = false;
                                    _self.unCheckedCells--;
                                }
                                nearCountElement.classList.remove('is-flag');
                                nearCountElement.classList.add('is-safe');
                                nearCountElement.innerHTML = nearCountCell.count;
                            }
                        }
                    }
                }
            }

            if (_self.unCheckedCells === _self.bombNumber) {
                _self.finishGame(true);
            }
        }

        addFlag(currentCell, currentElement) {
            const _self = this;
            let _currentCell = _self.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`];

            if(!_currentCell.isChecked) {
                if (!_currentCell.isFlag) {
                    _currentCell.isFlag = true;
                    currentElement.classList.add('is-flag');
                } else {
                    _currentCell.isFlag = false;
                    currentElement.classList.remove('is-flag');
                }
            }
        }

        finishGame(isWin) {
            let _self = this;
            _self.endGame = true;

            for (let key in _self.fieldCells) {
                let fieldCells = _self.fieldCells[key];
                if (fieldCells.isBomb) {
                    document.getElementById(`${fieldCells.x}-${fieldCells.y}`).classList.remove('is-flag');
                    document.getElementById(`${fieldCells.x}-${fieldCells.y}`).classList.add('is-bomb');
                }
            }

            if (isWin) {
                alert('Win');
            } else {
                alert('Lose');
            }
        }
    }

    return {
        init: function () {
            const _self = this;

            const defaultBtn = document.getElementsByClassName('j-btn');

            Array.from(defaultBtn).forEach(function (element) {
                element.addEventListener('click', _self.createGameField);
            });

        },
        createGameField: function () {
            let fieldWidth, fieldHeight, bombNumber;
            const minValue = 8;
            const maxValue = 30;
            const currentBtn = this;
            const inputWidth = document.getElementsByName('fieldWidth')[0];
            const inputHeight = document.getElementsByName('fieldHeight')[0];
            const inputBombs = document.getElementsByName('bombs')[0];
            const fieldContainer = document.getElementById('field');

            let inputWidthValue = Math.round(+inputWidth.value);
            let inputHeightValue = Math.round(+inputHeight.value);
            let inputBombsValue = Math.round(+inputBombs.value);

            if (currentBtn.dataset.custom) {
                fieldWidth = !inputWidthValue || inputWidthValue <= minValue ? minValue : (+inputWidthValue > maxValue ? maxValue : inputWidthValue);
                fieldHeight = !inputHeightValue || inputHeightValue <= minValue ? minValue : (inputHeightValue > maxValue ? maxValue :inputHeightValue);

                let minBombsValue = Math.round(fieldWidth * fieldHeight * 0.1);
                let maxBombsValue = Math.round(fieldWidth * fieldHeight * 0.3);

                bombNumber = inputBombsValue || minBombsValue;

                if(bombNumber > maxBombsValue) {
                    bombNumber = maxBombsValue;
                } else if (minBombsValue) {
                    bombNumber = minBombsValue;
                }

            } else {
                switch (currentBtn.dataset.level) {
                    case 'easy':
                        fieldWidth = 9;
                        fieldHeight = 9;
                        bombNumber = 10;
                        break;
                    case 'medium':
                        fieldWidth = 16;
                        fieldHeight = 16;
                        bombNumber = 40;
                        break;
                    case 'hard':
                        fieldWidth = 30;
                        fieldHeight = 16;
                        bombNumber = 99;
                        break;
                    default:
                        fieldWidth = 9;
                        fieldHeight = 9;
                        bombNumber = 10;
                }
            }

            inputWidth.value = fieldWidth;
            inputHeight.value = fieldHeight;
            inputBombs.value = bombNumber;

            fieldContainer.innerHTML = '';
            fieldContainer.classList.remove('is-small');

            if (fieldWidth <= 16 && fieldHeight <= 16) {
                fieldContainer.classList.add('is-small');
            }

            game = new GameField(fieldWidth, fieldHeight, bombNumber);

            for (let i = 0; i < fieldHeight; i++) {
                const fieldRowContainer = document.createElement('div');
                fieldRowContainer.className = 'field__row';
                fieldContainer.appendChild(fieldRowContainer)
                for (let j = 0; j < fieldWidth; j++) {
                    const fieldCellContainer = document.createElement('button');
                    fieldCellContainer.className = 'field__btn';
                    fieldCellContainer.setAttribute('id', `${i}-${j}`);
                    fieldRowContainer.appendChild(fieldCellContainer);

                    fieldCellContainer.addEventListener('click', function () {
                        game.bindClick.call(this, game);
                    });
                    fieldCellContainer.addEventListener('contextmenu', function (e) {
                        e.preventDefault();
                        game.bindRightClick.call(this, game);
                        return false;
                    }, false);
                }
            }
        }
    };
})();

(function () {
    MineSweeper.init();
})();
