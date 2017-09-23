'use strict';

const { expect } = require('chai');
const it = require('../index');

describe('request-it', () => {
    it('identifies Errors thrown before act() is called as ARRANGE failures', async (request) => {
        // ARRANGE
        expect.fail();

        // ACT
        const result = await request();

        // ASSERT
    });

    it('identifies Errors thrown while act() is called as ACT failures', async (request) => {
        // ARRANGE

        // ACT
        const result = await request({
            get: 'https://github.com/skonves/not-a-repo-that-i-own',
            query: {
                foo: 'bar',
                fizz: 'buzz',
            }
        });

        // ASSERT
    });

    it('identifies Errors thrown after act() is called as ASSERT failures', async (request) => {
        // ARRANGE

        // ACT
        const result = await request({ get: 'https://github.com/skonves/request-it' });

        // ASSERT
        expect.fail();
    });
});
