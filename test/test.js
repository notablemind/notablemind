
import run from './server'

import {exec} from 'child_process'

run(8192, server => {
  exec(`slimerjs --debug=true ${__dirname}/phantom.js`, (err, stdout, stderr) => {
    if (err) {
      console.log(`Phantom test failed: ${err.code} ${err.signal}`)
      console.log(stdout, stderr)
      process.exit(err.code || 5)
    }
    console.log('Tests Passed')
    console.log(stdout)
    console.log(stderr)
    const last = stdout.trim().split('\n').slice(-1)
    let data
    try {
      data = JSON.parse(last)
    } catch (e) {
      console.log('Data from slimer process invalid')
      console.log(last)
      process.exit(12)
    }
    const totalTime = data.ticks.reduce((s, tick) => {
      return s + tick.time
    }, 0)
    console.log(`Total time: ${totalTime}`)
    console.log(`Render time: ${data.ticks.slice(-1)[0].time}ms`)
    server.close(err => {
      if (err) {
        console.log(`Failed to shut down server: ${err.message}`)
        process.exit(10)
      }
      process.exit(0)
    })
  })
})

