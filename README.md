[![npm](https://img.shields.io/npm/v/request-it.svg)](https://www.npmjs.com/package/request-it)
[![david](https://img.shields.io/david/skonves/request-it.svg)](https://david-dm.org/skonves/request-it)
# Request-It
This project is a (mostly) drop-in replacement for Mocha's `it` function and aims to improve on Mocha's default functionality by allowing:

1. Clear arrange, act, and assert blocks
1. Explicit API calls under test
1. Flat, highly readable test blocks
1. Informative test failure output
1. Mocha-like syntax

## Quick Start

Example usage:
``` js
const it = require('reqeust-it');

it('gets client quotes by date', async (request) => {
    // ARRANGE
    // ... setup test state here ...

    // ACT
    const result = await request({
        get: 'http://clientsapi.com/v2/client/123/quotes',
        headers: { Authorization: myToken },
        query: {
            date: '>2015',
            count: '20',
        }
    });

    // ASSERT
    // ... make assertions here ...
});
```

Note that as long as the test methods passed to `it` return Promises, tests using `request-it` are fully backwards compatible with vanilla Mocha.  The only caveat is that callback-based asynchronous tests are *not* supported because they anticipate Mocha's `done` function whereas `request-it` passes a `request` function.

## request
The request method provides a facade for making HTTP calls.  It provides enough parameters to explicitly define the entire API call being tested.  

Example GET request:
``` js
{
    get: 'http://clientsapi.com/v2/client/123/quotes',
    headers: { Authorization: myToken },
    query: {
        date: '>2015',
        count: '20',
    }
}
``` 

Example POST request:
``` js
{
    post: 'http://clientsapi.com/v2/client/123/quotes',
    headers: { Authorization: myToken },
    body: {
        date: '2017-09-01',
        price: 49.95,
    }
}
```

Parameters must include one HTTP method property (`delete`, `get`, `head`, `options`, `patch`, `post`, `put`) whose value is the URI to be called.

You can provide `headers`, `query`, and/or `body` parameters to add those values to the request. (Note that the query can also be included in the URI.)

## Errors
The messages from any errors thrown before the `request` function is called will indicate that they originated from the "ARRANGE" block.  This is useful to determine that the API method under test was not called and thus the test was technically inconclusive.

During the execution of `request`, error messages will indicate that they originated during the "ACT" block.  The message will also include details about the request (method, URI, headers, etc).

Once the `request` function has resolved, errors messages (usually from AssertionErrors) will indicate that they occurred in the "ASSERT" block. They, too, will include details about the request (method, URI, headers, etc).  Response details are not currently included.