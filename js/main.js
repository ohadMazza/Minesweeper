"use strict"

let gBoard
let gGame
let gLevel
let gGameData = []

const gLevels = {
  beginner: {
    SIZE_I: 9,
    SIZE_J: 9,
    MINES: 10,
    LIVES: 1,
  },
  intermediate: {
    SIZE_I: 16,
    SIZE_J: 16,
    MINES: 40,
    LIVES: 2,
  },
  expert: {
    SIZE_I: 16,
    SIZE_J: 30,
    MINES: 99,
    LIVES: 3,
  }
}

function onInit(level = gGame.level) {
  gGame = {
    level: level,
    isTouchEventMark: false,
    isFirstMove: true,
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    redBomb: {
      i: null,
      j: null,
    },
  }
  gLevel = { ...gLevels[gGame.level] }
  gBoard = buildBoard()
  renderBoard(gBoard)
  resetGameParameters()
  setChosenLevelColor()
}

function onSetBeginnerLevel() {
  onInit("beginner")
}

function onSetIntermediateLevel() {
  onInit("intermediate")
}

function onSetExpertLevel() {
  onInit("expert")
}

function setChosenLevelColor() {
  const elSpans = document.querySelectorAll(".level")
  elSpans.forEach(function (el) {
    el.classList.remove("active")
  })

  const elSpan = document.querySelector(`.level-${gGame.level}`)
  elSpan.classList.add("active")
}

function resetGameParameters() {
  resetTimer()
  updateMinesCount()

  const elImg = document.querySelector(".emoji-img")
  elImg.src = "assets/img/emojis/emoji-1.jpg"

  const elModal = document.querySelector(".modal")
  elModal.style.display = "none"
}

function renderBoard(board) {
  let strHTML = ""

  for (let i = 0; i < board.length; i++) {
    strHTML += "<tr>\n"
    for (let j = 0; j < board[0].length; j++) {
      const className = `cell cell-${i}-${j}`

      strHTML += `<td onclick="onCellClicked(this, ${i}, ${j})" class="${className} " `
      strHTML += ` onmouseover="onCellMouseOver(${i}, ${j})"`
      strHTML += ` onmouseout="onCellMouseOut(${i}, ${j})"`
      strHTML += ` oncontextmenu="onCellMarked(this, ${i}, ${j}); return false">`
      strHTML += "</td>"
    }
    strHTML += "</tr>\n"
  }
  const elBoard = document.querySelector(".board")
  elBoard.innerHTML = strHTML
}

function setMinesNegsCount() {
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard.length; j++) {
      const currCell = gBoard[i][j]
      if (currCell.isMine) continue
      const negsCount = minesNegsCountInCell(i, j)
      currCell.minesAroundCount = negsCount
    }
  }
}

function minesNegsCountInCell(rowIdx, colIdx) {
  let negsCount = 0

  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue

    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gBoard.length) continue
      if (i === rowIdx && j === colIdx) continue
      const currCell = gBoard[i][j]
      if (currCell.isMine) negsCount++
    }
  }
  return negsCount
}

function setMinesOnBoardByClick(firstclickI, firstClickJ) {
  for (let i = 0; i < gLevel.MINES; i++) {
    const randI = getRandomIntInclusive(0, gBoard.length - 1)
    const randj = getRandomIntInclusive(0, gBoard[0].length - 1)

    if (gBoard[randI][randj].isMine || (randI === firstclickI && randj === firstClickJ)) {
      i--
      continue
    }
    gBoard[randI][randj].isMine = true
  }
}

function onCellClicked(elCell, cellI, cellJ) {
  if (!gGame.isOn) return
  if (gGame.isFirstMove) {
    gGame.isFirstMove = false
    setMinesOnBoardByClick(cellI, cellJ)
    setMinesNegsCount()
    startTimer()
  }

  if (gBoard[cellI][cellJ].isShown) return

  const currCell = gBoard[cellI][cellJ]
  if (currCell.isMine) {
    clickOnMine(cellI, cellJ)
    return
  }

  elCell.classList.add("empty-cell")
  currCell.isShown = true
  gGame.shownCount++
  checkGameOver()
  const value = currCell.minesAroundCount
  elCell.innerHTML = `<img class="img-cell" src="assets/img/negs-count/${value}.jpg" alt="${value}">`

  if (currCell.minesAroundCount === 0) {
    expandShown(elCell, cellI, cellJ)
  }
}

function onCellMarked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isShown || gGame.isFirstMove) return
  const currCell = gBoard[i][j]
  if (!gBoard[i][j].isMarked) {
    currCell.isMarked = true
    gGame.markedCount++
    elCell.innerHTML = `<img class="img-cell" src="assets/img/bombs/flag.jpg" alt="Flag">`
    checkGameOver()
  } else {
    elCell.innerHTML = ""
    gBoard[i][j].isMarked = false
    gGame.markedCount--
  }
  updateMinesCount()

}

function clickOnMine(i, j) {
  gGame.redBomb.i = i
  gGame.redBomb.j = j
  gameOverLose()
}

function gameOverLose() {
  const elImg = document.querySelector(".emoji-img")
  elImg.src = "assets/img/emojis/emoji-sad.jpg"

  const elMsg = document.querySelector(".game-msg")
  elMsg.innerText = "You Lose!"

  showBoard()
  gameOver()
}

function checkGameOver() {
  if (gLevel.SIZE_I * gLevel.SIZE_J - gLevel.MINES === gGame.shownCount && gLevel.MINES === gGame.markedCount) {
    const elImg = document.querySelector(".emoji-img")
    elImg.src = "assets/img/emojis/emoji-win.jpg"

    const elMsg = document.querySelector(".game-msg")
    elMsg.innerText = "You Win!"
    gameOver()
  }
}

function gameOver() {
  gGame.secsPassed = stopTimer() / 1000
  gGame.isOn = false

  const elModal = document.querySelector(".modal")
  elModal.style.display = "block"

  const elSpan = document.querySelector(".total-time")
  elSpan.innerText = gGame.secsPassed
}

function showBoard() {
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard.length; j++) {
      const currCell = gBoard[i][j]

      if (currCell.isMine) {
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.classList.add("empty-cell")
        elCell.innerHTML = `<img class="img-cell" src="assets/img/bombs/bomb.jpg" alt="Bomb">`
      }

      if (!currCell.isMine && currCell.isMarked) {
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.innerHTML = `<img class="img-cell" src="assets/img/bombs/flag-mistake.jpg" alt="Bomb">`
      }
    }
  }
  const elCell = document.querySelector(`.cell-${gGame.redBomb.i}-${gGame.redBomb.j}`)
  elCell.innerHTML = `<img class="img-cell" src="assets/img/bombs/red-bomb.jpg" alt="Bomb">`
}

function expandShown(elCell, cellI, cellJ) {
  let value
  for (let i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue

    for (let j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= gBoard.length) continue
      if (i === cellI && j === cellJ) continue

      const currCell = gBoard[i][j]
      if (currCell.isShown) continue

      value = currCell.minesAroundCount
      elCell = document.querySelector(`.cell-${i}-${j}`)
      elCell.classList.add("empty-cell")
      elCell.innerHTML = `<img class="img-cell" src="assets/img/negs-count/${value}.jpg" alt="${value}">`
      currCell.isShown = true
      gGame.shownCount++

      if (value === 0) expandShown(elCell, i, j)
    }
  }
}

function onClickSmily(elImg) {
  onInit()
  elImg.src = "assets/img/emojis/emoji-2.jpg"

  setTimeout(() => {
    elImg.src = "assets/img/emojis/emoji-1.jpg"
  }, 150)
}

function updateMinesCount() {
  const minesDigit10 = Math.floor((gLevel.MINES - gGame.markedCount) / 10)
  const minesDigit1 = (gLevel.MINES - gGame.markedCount) % 10

  const elimg10 = document.querySelector(".mines-digit10")
  elimg10.src = `assets/img/timer-numbers/${minesDigit10}.jpg`

  const elimg1 = document.querySelector(".mines-digit1")
  elimg1.src = `assets/img/timer-numbers/${minesDigit1}.jpg`
}

// function onSetTouchIcon() {
//   gGame.isTouchEventMark = !gGame.isTouchEventMark
//   const img = gGame.isTouchEventMark ? "bomb" : "flag"
//   document.querySelector('.touch-type img').src = `assets/img/bombs/${img}.jpg`
// }



















