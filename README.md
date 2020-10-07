# fetch-request-body-to-async-terator
Convert the body of a fetch request to an async iterator of bytes

## How it works

This module can covert various data types you can expect to have in the request body for `fetch()` calls into async iterators of Buffers.

These can then be converted into streams or whatever else your application needs.

Currently it supports:

- Electron protocl APIs via the [ProtocolRequest.uploadData](https://www.electronjs.org/docs/api/protocol-request#protocolrequestuploaddata) types
- Node streams
- WHATWG streams
- URLSearchParams
- Blobs
- Node streams

## Not supported

One thing that isn't yet supported but we'd love a PR for is the FormData object since it's not clear how it should be serlialized.
