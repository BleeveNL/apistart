"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const index_1 = require("../index");
const assert = chai.assert;
suite('Test plugin (index.ts).', () => {
    test('Returns as default "Hello World!"', () => {
        assert.equal(index_1.default, 'Hello World!');
    });
});
//# sourceMappingURL=index.test.js.map