'use strict';

class GameField {

    game = null;

    constructor(fieldWidth, fieldHeight, bombNumber) {
        this.fieldWidth = fieldWidth;
        this.fieldHeight = fieldHeight;
        this.bombNumber = bombNumber;
    }

    static init() {
        const defaultBtn = document.getElementsByClassName('j-btn');
        Array.from(defaultBtn).forEach((element) => element.addEventListener('click', evt => this.getGameParams(evt)));
    }

    static getGameParams(evt) {
        let fieldWidth, fieldHeight, bombNumber;
        const minValue = 8;
        const maxValue = 30;
        const currentBtn = evt.target;
        const inputWidth = document.getElementsByName('fieldWidth')[0];
        const inputHeight = document.getElementsByName('fieldHeight')[0];
        const inputBombs = document.getElementsByName('bombs')[0];

        const inputWidthValue = Math.round(+inputWidth.value);
        const inputHeightValue = Math.round(+inputHeight.value);
        const inputBombsValue = Math.round(+inputBombs.value);

        if (currentBtn.dataset.custom) {
            fieldWidth = !inputWidthValue || inputWidthValue <= minValue ? minValue : (inputWidthValue > maxValue ? maxValue : inputWidthValue);
            fieldHeight = !inputHeightValue || inputHeightValue <= minValue ? minValue : (inputHeightValue > maxValue ? maxValue : inputHeightValue);

            const minBombsValue = Math.round(fieldWidth * fieldHeight * 0.1);
            const maxBombsValue = Math.round(fieldWidth * fieldHeight * 0.3);

            bombNumber = inputBombsValue || minBombsValue;

            if (bombNumber > maxBombsValue) {
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

        this.renderGameField(fieldWidth, fieldHeight, bombNumber);
    }

    static renderGameField(fieldWidth, fieldHeight, bombNumber) {
        const fieldContainer = document.getElementById('field');

        fieldContainer.innerHTML = '';
        fieldContainer.classList.remove('is-small');

        if (fieldWidth <= 16 && fieldHeight <= 16) {
            fieldContainer.classList.add('is-small');
        }

        this.game = new GameField(fieldWidth, fieldHeight, bombNumber);

        for (let i = 0; i < fieldHeight; i++) {
            const fieldRowContainer = document.createElement('div');
            fieldRowContainer.className = 'field__row';
            fieldContainer.appendChild(fieldRowContainer)
            for (let j = 0; j < fieldWidth; j++) {
                const fieldCellContainer = document.createElement('button');
                fieldCellContainer.className = 'field__btn';
                fieldCellContainer.setAttribute('id', `${i}-${j}`);
                fieldRowContainer.appendChild(fieldCellContainer);

                fieldCellContainer.addEventListener('click', evt => this.bindClick(evt));
                fieldCellContainer.addEventListener('contextmenu', evt => {
                    this.bindRightClick(evt);
                    evt.preventDefault();
                });
            }
        }
    }

    static bindClick(evt) {
        const currentBtn = evt.target;
        const currentCell = {x: +currentBtn.id.split('-')[0], y: +currentBtn.id.split('-')[1]};

        if (!this.endGame) {
            !this.game.fieldCells
                ? this.createField(currentCell, currentBtn)
                : this.checkCell(currentCell, currentBtn);
        }
    }

    static bindRightClick(evt) {
        const currentBtn = evt.target;
        const currentCell = {x: +currentBtn.id.split('-')[0], y: +currentBtn.id.split('-')[1]};
        if (!this.endGame) {
            !this.game.fieldCells
                ? this.createField(currentCell, currentBtn)
                : this.addFlag(currentCell, currentBtn);
        }
    }

    static createField(firstCell, firstElement) {
        this.game.unCheckedCells = this.game.fieldHeight * this.game.fieldWidth;
        this.game.fieldCells = {};

        this.setIndexCells();
        this.setIndexBombs(firstCell);
        this.setActiveCells();
        this.setEmptyCells();

        this.checkCell(firstCell, firstElement);
    }

    static setIndexCells() {
        this.game.indexBombs = [];
        for (let i = 0; i < this.game.fieldHeight; i++) {
            for (let j = 0; j < this.game.fieldWidth; j++) {
                this.game.indexBombs.push({x: i, y: j});
                this.game.fieldCells[`x: ${i}, y: ${j}`] = {
                    x: i,
                    y: j,
                    isBomb: false,
                    isChecked: false,
                    count: null,
                    isFlag: false,
                }
            }
        }
    }

    static setIndexBombs(firstCell) {
        this.game.indexBombs = this.game.indexBombs.filter((cell) => {
            return JSON.stringify(cell) !== JSON.stringify(firstCell);
        });

        const compareRandom = () => {
            return Math.random() - 0.5;
        }

        this.game.indexBombs.sort(compareRandom).splice(this.game.bombNumber);

        this.game.indexBombs.forEach((cell) => {
            this.game.fieldCells[`x: ${cell.x}, y: ${cell.y}`].isBomb = true;
        });
    }

    static setActiveCells() {
        let currentCell;
        this.game.indexBombs.forEach((cell) => {
            for (let i = cell.x - 1; i <= cell.x + 1; i++) {
                for (let j = cell.y - 1; j <= cell.y + 1; j++) {
                    currentCell = this.game.fieldCells[`x: ${i}, y: ${j}`];
                    if (currentCell) {
                        if (!currentCell.isBomb) {
                            currentCell.count = currentCell.count || 0;
                            currentCell.count++;
                        }
                    }
                }
            }
        });
    }

    static setEmptyCells() {
        for (let key in this.game.fieldCells) {
            if (!this.game.fieldCells[key].count && !this.game.fieldCells[key].isBomb) {

                this.game.fieldCells[key].nearEmptyCells = {};
                this.game.fieldCells[key].nearCountCells = {};

                for (let i = this.game.fieldCells[key].x - 1; i <= this.game.fieldCells[key].x + 1; i++) {
                    for (let j = this.game.fieldCells[key].y - 1; j <= this.game.fieldCells[key].y + 1; j++) {
                        if (this.game.fieldCells[`x: ${i}, y: ${j}`] && !this.game.fieldCells[`x: ${i}, y: ${j}`].isBomb) {
                            if (!this.game.fieldCells[`x: ${i}, y: ${j}`].count) {
                                this.game.fieldCells[key].nearEmptyCells[`x: ${i}, y: ${j}`] = {
                                    x: i,
                                    y: j
                                };
                            } else {
                                this.game.fieldCells[key].nearCountCells[`x: ${i}, y: ${j}`] = {
                                    x: i,
                                    y: j
                                };
                            }
                        }
                    }
                }
            }
        }

        for (let key in this.game.fieldCells) {
            if (!this.game.fieldCells[key].count && !this.game.fieldCells[key].isBomb) {
                for (let item in this.game.fieldCells[key].nearEmptyCells) {
                    const currentCell = this.game.fieldCells[key].nearEmptyCells[item];

                    Object.assign(this.game.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearEmptyCells, this.game.fieldCells[key].nearEmptyCells);
                    this.game.fieldCells[key].nearEmptyCells = this.game.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearEmptyCells;

                    Object.assign(this.game.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearCountCells, this.game.fieldCells[key].nearCountCells);
                    this.game.fieldCells[key].nearCountCells = this.game.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`].nearCountCells;
                }
            }
        }
    }

    static checkCell(currentCell, currentElement) {
        const currentCellParams = this.game.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`];

        if (!currentCellParams.isFlag) {
            if (currentCellParams.isBomb) {
                this.finishGame(false);
            } else {
                if (!currentElement.isChecked) {
                    currentElement.classList.add('is-safe');
                    if (currentCellParams.count) {
                        currentElement.innerHTML = currentCellParams.count;
                        currentCellParams.isChecked = true;
                        this.game.unCheckedCells--;
                    } else {
                        currentCellParams.isChecked = true;

                        for (let key in currentCellParams.nearEmptyCells) {
                            const nearEmptyCell = this.game.fieldCells[`x: ${currentCellParams.nearEmptyCells[key].x}, y: ${currentCellParams.nearEmptyCells[key].y}`];
                            const nearEmptyElement = document.getElementById(`${currentCellParams.nearEmptyCells[key].x}-${currentCellParams.nearEmptyCells[key].y}`);
                            nearEmptyCell.isChecked = true;
                            nearEmptyCell.isFlag = false;
                            this.game.unCheckedCells--;
                            nearEmptyElement.classList.remove('is-flag');
                            nearEmptyElement.classList.add('is-safe');
                        }

                        for (let key in currentCellParams.nearCountCells) {
                            const nearCountCell = this.game.fieldCells[`x: ${currentCellParams.nearCountCells[key].x}, y: ${currentCellParams.nearCountCells[key].y}`];
                            const nearCountElement = document.getElementById(`${currentCellParams.nearCountCells[key].x}-${currentCellParams.nearCountCells[key].y}`);
                            if (!nearCountCell.isChecked) {
                                nearCountCell.isChecked = true;
                                nearCountCell.isFlag = false;
                                this.game.unCheckedCells--;
                            }
                            nearCountElement.classList.remove('is-flag');
                            nearCountElement.classList.add('is-safe');
                            nearCountElement.innerHTML = nearCountCell.count;
                        }
                    }
                }
            }
        }

        if (this.game.unCheckedCells === this.game.bombNumber) {
            this.finishGame(true);
        }
    }

    static addFlag(currentCell, currentElement) {
        const currentCellParams = this.game.fieldCells[`x: ${currentCell.x}, y: ${currentCell.y}`];

        if (!currentCellParams.isChecked) {
            if (!currentCellParams.isFlag) {
                currentCellParams.isFlag = true;
                currentElement.classList.add('is-flag');
            } else {
                currentCellParams.isFlag = false;
                currentElement.classList.remove('is-flag');
            }
        }
    }

    static finishGame(isWin) {
        this.game.endGame = true;

        for (let key in this.game.fieldCells) {
            const fieldCells = this.game.fieldCells[key];
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

GameField.init();
