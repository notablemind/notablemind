
export default (mime, path) => {
  if (mime.match(/^image\//)) {
    return path
  }
  return 'path/to/src'
}

