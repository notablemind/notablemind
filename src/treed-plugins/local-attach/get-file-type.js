import mime from 'mime'
import fs from 'fs'

export const getFileType = (fname, done) => fs.stat(fname, (err, res) => {
  if (err) return done(err)
  done(null, typeFromStat(fname, res))
})

export const getFileTypeSync = fname => {
  return typeFromStat(fname, fs.statSync(fname))
}

export const typeFromStat = (fname, stat) => {
  return stat.isDirectory() ? 'directory' : (mime.lookup(fname) || 'unknown')
}
