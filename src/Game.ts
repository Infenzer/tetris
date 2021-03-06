export interface Tetro {
  x: number
  y: number
  blocks: number[][]
}

export enum EColors {
  'white' = 1,
  '#ffff00' = 2,
  '#8b00ff' = 3,
  'green' = 4,
  '#ffc0cb' = 5,
  '#0000ff' = 6,
  '#42aaff' = 7
}

class Game {
  playfield: number[][]
  activeTetro: Tetro
  nextTetro: Tetro
  score: number
  lines: number
  level: number
  cols: number
  rows: number
  speed: number
  gameOver: boolean

  constructor(rows = 20, cols = 10) {
    this.restart()

    this.cols = cols
    this.rows = rows
  }

  restart() {
    this.activeTetro = this.createTetro()
    this.nextTetro = this.createTetro()
    this.playfield = this.createGrid(this.rows, this.cols)

    this.score = 0
    this.lines = 0
    this.level = 1
    this.speed = 1000
    this.gameOver = false
  }

  getMap() {
    const playfield = this.playfield.map(elem => elem.slice())
    const activeTetro = this.activeTetro
      
    for (let col = 0; col < activeTetro.blocks.length; col++) {
      for (let row = 0; row < activeTetro.blocks[0].length; row++) {
        if (activeTetro.blocks[col][row] !== 0) {
          const y = activeTetro.y + col
          const x = activeTetro.x + row

          playfield[y][x] = activeTetro.blocks[col][row]
        }
      }
    }

    return playfield
  }

  moveTetroDown() {
    this.activeTetro.y += 1

    if (this.isTetroOutOfBounce() || this.hasCllision()) {
      this.activeTetro.y -= 1
      this.lockTetro()
    }
  }

  moveTetroRight() {
    this.activeTetro.x += 1

    if (this.isTetroOutOfBounce() || this.hasCllision()) {
      this.activeTetro.x -= 1
    }
  }

  moveTetroLeft() {
    this.activeTetro.x -= 1

    if (this.isTetroOutOfBounce() || this.hasCllision()) {
      this.activeTetro.x += 1
    }
  }

  rotateTetro() {
    const blocks = this.activeTetro.blocks
    const length = blocks.length

    const temp = this.createGrid(length, length)

    for (let col = 0; col < length; col++) {
      for (let row = 0; row < length; row++) {
        temp[row][col] = blocks[length - 1 - col][row]
      }
    }

    this.activeTetro.blocks = temp

   if (this.isTetroOutOfBounce() || this.hasCllision()) {
      this.activeTetro.blocks = blocks
   }
  }

  // Коллизя
  hasCllision() {
    const {x, y, blocks} = this.activeTetro

    for (let col = 0; col < blocks.length; col++) {
      for (let row = 0; row < blocks[col].length; row++) {
        if (blocks[col][row] !== 0) {
          if(this.playfield[col + y][row + x]) return true
        }
      }
    }

    return false
  }

  // Выход за пределы карты
  isTetroOutOfBounce() {
    const {x, y, blocks} = this.activeTetro
    const playfield = this.playfield

    for (let col = 0; col < blocks.length; col++) {
      for (let row = 0; row < blocks[col].length; row++) {

        if (blocks[col][row] !== 0) {
          if (playfield[col + y] === undefined || playfield[col + y][row + x] === undefined) {
            return true
          }
        }

      }
    }

    return false
  }

  createGrid(rows: number, cols: number) {
    return new Array(rows).fill(null)
      .map(() => new Array(cols).fill(null)
        .map(() => 0))
  }

  createTetro(type: null | 1 | 2 | 3 | 4 | 5 | 6 | 7 = null) {
    const tetroList = [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ]
    ]

    const randomTetroIndex = Math.floor(Math.random() * tetroList.length) 

    if (type) {
      this.painBlock(type, tetroList[type])
    } else {
      this.painBlock(randomTetroIndex, tetroList[randomTetroIndex])
    }

    const tetro = {
      x: 3,
      y: randomTetroIndex === 0 ? -1 : 0,
      blocks: type === null ? tetroList[randomTetroIndex] : tetroList[type]
    }

    return tetro
  }

  // Покрас блока
  painBlock(type =  1 | 2 | 3 | 4 | 5 | 6 | 7, tetro: number[][]) {
    for (let col in tetro) {
      for(let row in tetro[col]) {
        if (tetro[col][row]) {
          tetro[col][row] = type
        }
      }
    }
  }

  clearLines() {
    let countDelLines = 0

    for (let col = this.playfield.length - 1; col >= 0; col--) {
      if (!this.playfield[col].includes(0)) {
        this.playfield.splice(col, 1)
        countDelLines++
      }
    }

    for (let i = 0; i < countDelLines; i++) {
      this.playfield.unshift(new Array(this.cols).fill(0))
    }

    this.updateScore(countDelLines)
  }

  // Фиксация Tetro
  lockTetro() {
    const {x, y, blocks} = this.activeTetro

    for (let col = 0; col < blocks.length; col++) {
      for (let row = 0; row < blocks[col].length; row++) {
        if (blocks[col][row]) {
          this.playfield[col + y][row + x] = blocks[col][row]
        }
      }
    }

    this.clearLines()

    this.activeTetro = this.nextTetro
    if (!this.isGameOver()) {
      this.nextTetro = this.createTetro()
    } else {
      this.gameOver = true
    }
  }

  updateScore(countDelLines: number) {
    switch(countDelLines) {
      case 1:
        this.score += 400
        break
      case 2:
        this.score += 1350
        break
      case 3:
        this.score += 2200
        break
      case 4:
        this.score += 3650
        break
    }

    const lastLevel = this.level
    const speedLock = 50

    this.lines += countDelLines > 0 ? countDelLines : 0
    this.level = Math.floor(this.lines / 10) + 1
  
    if (lastLevel !== this.level && this.speed > speedLock) {
      this.speed -= speedLock
    }

    console.log(this.speed)
  }

  isGameOver() {
    return !!this.playfield[0].find(elem => elem !== 0)
  }
}

export default Game