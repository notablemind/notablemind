
import run from './server'

import {spawn} from 'child_process'

run(8192, server => {
  const proc = spawn('slimerjs', ['--debug=true', `${__dirname}/phantom.js`])
  let stdout = ''
  let stderr = ''

  proc.stdout.on('data', data => {
    console.log(data.toString())
    stdout += data.toString()
  })
  proc.stderr.on('data', data => stderr += data.toString())

  proc.on('close', (code) => {
    if (code !== 0) {
      console.log('Slimer died: ' + code)
      process.exit(code)
    }
    console.log('Tests passed')
    const last = stdout.trim().split('\n').slice(-2)[0]
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

  /*
  proc.on('close', (err, stdout, stderr) => {
    if (err) {
      console.log(`Phantom test failed: ${err.code} ${err.signal}`)
      console.log(stdout, stderr)
      process.exit(err.code || 5)
    }
    console.log('Tests Passed')
    console.log(stdout)
    console.log(stderr)
  })
  */
})

