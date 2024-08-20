"use strict"

let gTimer
let gTimerInterval

function buildBoard() {
  const board = []
  for (let i = 0; i < gLevel.SIZE_I; i++) {
    board[i] = []
    for (let j = 0; j < gLevel.SIZE_J; j++) {
      board[i][j] = {
        minesAroundCount: null,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
    }
  }
  return board
}

function startTimer() {
  gTimer = Date.now()
  gTimerInterval = setInterval(updateTimer, 1000)
}

function stopTimer() {
  clearInterval(gTimerInterval)
  return Date.now() - gTimer
}

function resetTimer() {
  stopTimer()
  gTimer = Date.now()
  updateTimer()
}

function updateTimer() {
  const elapsedTime = Date.now() - gTimer
  const seconds = Math.floor(elapsedTime / 1000)
  if (seconds <= 999) {
    const digit100 = Math.floor(seconds / 100)
    const digit10 = Math.floor((seconds / 10) % 10)
    const digit1 = seconds % 10

    const elimg100 = document.querySelector(".digit100")
    elimg100.src = `assets/img/timer-numbers/${digit100}.jpg`

    const elimg10 = document.querySelector(".digit10")
    elimg10.src = `assets/img/timer-numbers/${digit10}.jpg`

    const elimg1 = document.querySelector(".digit1")
    elimg1.src = `assets/img/timer-numbers/${digit1}.jpg`
  }
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
