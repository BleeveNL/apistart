"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const microservice_1 = require("../microservice");
const assert = chai.assert;
suite('Test plugin (index.ts).', () => {
    test('Returns as default a instanceOf the Microservice Class', () => {
        assert.instanceOf(new microservice_1.default(), microservice_1.Microservice);
    });
});
//# sourceMappingURL=microservice.test.js.map