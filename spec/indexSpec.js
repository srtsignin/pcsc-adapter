
const pcsc = require("../index");

describe("Top level functionality", () => {
    it("should pass", () => {
        expect(true).toBeTruthy();
    });

    it("should notify after subscribed", (done) => {
        const data = '4';

        pcsc.

        pcsc.subscribe((subscribedData) => {
            expect(subscribedData).toEqual(data);
            done();
        });
        pcsc.notifySubscribers(data);
    });
});