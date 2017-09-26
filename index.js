'use strict';

const superagent = require('superagent');

/**
 * 
 * @param {function} request
 * @returns {Promise<>}
 */
const ICallback = function (request) { }


/**
 * @param {string} expectation
 * @param {ICallback} [callback]
 */
module.exports = function (expectation, callback) {
    it(expectation, async () => {
        await requestIt(callback);
    });
}

module.exports.only = function (expectation, callback) {
    it.only(expectation, async () => {
        await requestIt(callback);
    });
}

module.exports.skip = function (expectation, callback) {
    it.skip(expectation, async () => {
        await requestIt(callback);
    });
}

function requestIt(testFn) {
    let state = { stage: 'ARRANGE' };

    async function request({
        delete: deleteUri,
        get: getUri,
        head: headUri,
        options: optionsUri,
        patch: patchUri,
        post: postUri,
        put: putUri,
        query,
        headers,
        body,
        attach
    }) {
        state.stage = 'ACT';

        let req;
        if (deleteUri) {
            req = superagent.delete(deleteUri);
            state.method = 'DELETE';
            state.uri = deleteUri;
        } else if (getUri) {
            req = superagent.get(getUri);
            state.method = 'GET';
            state.uri = getUri;
        } else if (headUri) {
            req = superagent.head(headUri);
            state.method = 'HEAD';
            state.uri = headUri;
        } else if (optionsUri) {
            req = superagent.options(optionsUri);
            state.method = 'OPTIONS';
            state.uri = optionsUri;
        } else if (patchUri) {
            req = superagent.patch(patchUri);
            state.method = 'PATCH';
            state.uri = patchUri;
        } else if (postUri) {
            req = superagent.post(postUri);
            state.method = 'POST';
            state.uri = postUri;
        } else if (putUri) {
            req = superagent.put(putUri);
            state.method = 'PUT';
            state.uri = putUri;
        }

        if (query) {
            req = req.query(query);
            state.query = query;
        }

        if (headers) {
            req = req.set(headers);
            state.headers = headers;
        }

        if (body) {
            state.body = body;
        }

        if (attach && attach.field && attach.buffer && attach.filename) {
            req = req.attach(attach.field, attach.buffer, attach.filename);
        } else {
            req = req.send(body);
        }

        state.headers = Object.assign(state.headers || {}, req.header);

        return req
            .then(value => {
                state.stage = 'ASSERT';
                return Promise.resolve(value);
            })
            .catch(ex => {
                state.errorStage = state.errorStage || state.stage;
                state.stage = 'ASSERT';
                return Promise.reject(ex);
            });
    }

    return testFn(request).catch(ex => {
        state.errorStage = state.errorStage || state.stage;

        const route = state.errorStage !== 'ARRANGE' ? `\n\n     ${state.method} ${[state.uri, Object.keys(state.query || {}).map(key => [key, state.query[key]].join('=')).filter(x => x).join('&')].filter(x => x).join('?')}` : '';
        const headers = state.headers ? `\n     ${Object.keys(state.headers).map(key => `${key}: ${state.headers[key].length > 50 ? state.headers[key].substr(0, 47) + '...' : state.headers[key]}`).join('\n     ')}` : '';
        const body = state.body ? `\n\n     ${JSON.stringify(state.body)}` : ''

        ex.message += ` (at ${state.errorStage})${route}${headers}${body}`

        return Promise.reject(ex);
    });
}
