function randomString (max = 20, min = 20) {
  const length = min + (((max - min) * Math.random()) | 0)
  return [...Array(length)].map(() => Math.random().toString(36)[2]).join('')
}

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = {
  randomString,
  sleep
}
