const nodeStreamToIterator = require('stream-to-iterator')

module.exports = function bodyToIterator (body, ses) {
  // If there's no body, give an empty stream
  if (!body) return arrayToIterator([])

  // Probably a node stream
  if (isFn(body.pipe)) return nodeStreamToIterator(body)

  // Account for blob
  if (isFn(body.stream)) {
    const stream = body.stream()
    return streamIntoInterator(stream)
  }

  if (isFn(body.arrayBuffer)) {
    return promiseToIterator(body.arrayBuffer())
  }

  // Account for WHATWG Readable Stream
  if (isFn(body.getReader)) {
    return streamIntoInterator(body)
  }

  // Account for electron's UploadData object
  // https://www.electronjs.org/docs/api/structures/upload-data
  if (body.bytes) {
    return intoIterator(body.bytes)
  }

  // Handle blobs in the body
  if (body.blobUUID) {
    if (!ses) throw new Error('Must specify session for blobUUIDs')
    return promiseToIterator(ses.getBlobData(body.blobUUID))
  }

  // Probably a URLSearchParams object
  if (isFn(body.entries)) {
    return intoIterator(Buffer.from(body.toString()))
  }

  // Coming from electron
  if (body.file && (typeof body.file === 'string')) {
    if (!ses) throw new Error('Must specify session for electron file upload')
    const fs = require('fs')
    return nodeStreamToIterator(fs.createReadStream(body.file))
  }

  // Probably a string or a buffer of some sort?
  return intoIterator(Buffer.from(body))
}

function isFn (value) {
  return typeof value === 'function'
}

function streamIntoInterator (stream) {
  if (stream.getIterator) {
    return stream.getIterator()
  } else {
    return consumeStream(stream)
  }
}

async function * consumeStream (stream) {
  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    yield value
  }
}

async function * promiseToIterator (promise) {
  yield await promise
}

async function * arrayToIterator (array) {
  yield * array
}

async function * intoIterator (value) {
  yield value
}
