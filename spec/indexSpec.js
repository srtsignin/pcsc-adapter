describe("pcsc-adapter general tests", () => {

    it("should notify listener functions when card is found", (done) => {
        const PCSCAdapter = require("../src/index");
        const pcsc = jasmine.createSpyObj("pcsc", ["on"]);
        const reader = jasmine.createSpyObj("reader", ["on", "connect", "transmit"]);
        reader.SCARD_STATE_EMPTY = 0;
        reader.SCARD_STATE_PRESENT = 1;
        reader.SCARD_SHARE_SHARED = 2;
        reader.state = reader.SCARD_STATE_EMPTY;
        const status = {
            state: reader.SCARD_STATE_PRESENT
        }
        const protocol = 7;

        let generateStatus;
        
        const data = Buffer.from([0x54, 0x78, 0x22, 0x8A, 0x4B, 0x54, 0x78, 0x22, 0x8A, 0x4B]);

        pcsc.on.and.callFake(function (event, f) {
            if (event === "reader") {
                console.log("pcsc.reader()");
                f.call(pcsc, reader);
            }
        });
    
        reader.on.and.callFake(function (event, f) {
            if (event === "status") {
                generateStatus = () => {
                    console.log("reader.status()");
                    f.call(reader, status);
                }
            }
        });
    
        reader.connect.and.callFake(function (options, f) {
            console.log("reader.connect()");
            f.call(reader, null, protocol);
        });

        reader.transmit.and.callFake(function (buffer, n, p, f) {
            console.log("reader.transmit()");
            console.log(buffer.va);
            if(!buffer.compare(Buffer.from([0xFF, 0xB0, 0x00, 0x00, 0x00]))) {
                f.call(reader, null, data);
            }
        });

        const adapter = new PCSCAdapter(pcsc);

        adapter.subscribe((err, data) => {
            expect(err).toBeNull();
            expect(data).toEqual(data.toString('hex'));
            done();
        });

        generateStatus();
    }); 

    it("should return an error if the card couldn't be read (transmit)", function(done) {
        const PCSCAdapter = require("../src/index");
        const pcsc = jasmine.createSpyObj("pcsc", ["on"]);
        const reader = jasmine.createSpyObj("reader", ["on", "connect", "transmit"]);
        reader.SCARD_STATE_EMPTY = 0;
        reader.SCARD_STATE_PRESENT = 1;
        reader.SCARD_SHARE_SHARED = 2;
        reader.state = reader.SCARD_STATE_EMPTY;
        const status = {
            state: reader.SCARD_STATE_PRESENT
        }
        const protocol = 7;

        let generateStatus;
        
        const data = Buffer.from([0x54, 0x78, 0x22, 0x8A, 0x4B]);
        const error = "Error reading card";

        pcsc.on.and.callFake(function (event, f) {
            if (event === "reader") {
                console.log("pcsc.reader()");
                f.call(pcsc, reader);
            }
        });
    
        reader.on.and.callFake(function (event, f) {
            if (event === "status") {
                generateStatus = () => {
                    console.log("reader.status()");
                    f.call(reader, status);
                }
            }
        });
    
        reader.connect.and.callFake(function (options, f) {
            console.log("reader.connect()");
            f.call(reader, null, protocol);
        });

        reader.transmit.and.callFake(function (buffer, n, p, f) {
            console.log("reader.transmit()");
            console.log(buffer.va);
            if(!buffer.compare(Buffer.from([0xFF, 0xB0, 0x00, 0x00, 0x00]))) {
                f.call(reader, error, null);
            }
        });

        const adapter = new PCSCAdapter(pcsc);

        adapter.subscribe((err, data) => {
            // console.log("got here");
            expect(err).toEqual(error);
            done();
        });

        generateStatus();
    });

    it("should return an error there is a scanner error", function(done) {
        const PCSCAdapter = require("../src/index");
        const pcsc = jasmine.createSpyObj("pcsc", ["on"]);
        const reader = jasmine.createSpyObj("reader", ["on", "connect", "transmit"]);
        reader.SCARD_STATE_EMPTY = 0;
        reader.SCARD_STATE_PRESENT = 1;
        reader.SCARD_SHARE_SHARED = 2;
        reader.state = reader.SCARD_STATE_EMPTY;

        let generateStatus;
    
        const error = "Error reading card";

        pcsc.on.and.callFake(function (event, f) {
            if (event === "reader") {
                console.log("pcsc.reader()");
                f.call(pcsc, reader);
            }
        });
    
        reader.on.and.callFake(function (event, f) {
            if (event === "error") {
                generateStatus = () => {
                    console.log("reader.error()");
                    f.call(reader, error);
                }
            }
        });

        const adapter = new PCSCAdapter(pcsc);

        adapter.subscribe((err, data) => {
            expect(err).toEqual(error);
            done();
        });

        generateStatus();
    });

    it("should return an error if the card couldn't be read (connect)", function(done) {
        const PCSCAdapter = require("../src/index");
        const pcsc = jasmine.createSpyObj("pcsc", ["on"]);
        const reader = jasmine.createSpyObj("reader", ["on", "connect", "transmit"]);
        reader.SCARD_STATE_EMPTY = 0;
        reader.SCARD_STATE_PRESENT = 1;
        reader.SCARD_SHARE_SHARED = 2;
        reader.state = reader.SCARD_STATE_EMPTY;
        const status = {
            state: reader.SCARD_STATE_PRESENT
        }
        const protocol = 7;

        let generateStatus;
        
        const data = Buffer.from([0x54, 0x78, 0x22, 0x8A, 0x4B]);
        const error = "Error reading card";

        pcsc.on.and.callFake(function (event, f) {
            if (event === "reader") {
                console.log("pcsc.reader()");
                f.call(pcsc, reader);
            }
        });
    
        reader.on.and.callFake(function (event, f) {
            if (event === "status") {
                generateStatus = () => {
                    console.log("reader.status()");
                    f.call(reader, status);
                }
            }
        });
    
        reader.connect.and.callFake(function (options, f) {
            console.log("reader.connect()");
            f.call(reader, error, null);
        });

        const adapter = new PCSCAdapter(pcsc);

        adapter.subscribe((err, data) => {
            expect(err).toEqual(error);
            done();
        });

        generateStatus();
    });

    it("should return error when card data is invalid", (done) => {
        const PCSCAdapter = require("../src/index");
        const pcsc = jasmine.createSpyObj("pcsc", ["on"]);
        const reader = jasmine.createSpyObj("reader", ["on", "connect", "transmit"]);
        reader.SCARD_STATE_EMPTY = 0;
        reader.SCARD_STATE_PRESENT = 1;
        reader.SCARD_SHARE_SHARED = 2;
        reader.state = reader.SCARD_STATE_EMPTY;
        const status = {
            state: reader.SCARD_STATE_PRESENT
        }
        const protocol = 7;

        let generateStatus;
        
        const data = Buffer.from([0x6f, 0x00]);

        pcsc.on.and.callFake(function (event, f) {
            if (event === "reader") {
                console.log("pcsc.reader()");
                f.call(pcsc, reader);
            }
        });
    
        reader.on.and.callFake(function (event, f) {
            if (event === "status") {
                generateStatus = () => {
                    console.log("reader.status()");
                    f.call(reader, status);
                }
            }
        });
    
        reader.connect.and.callFake(function (options, f) {
            console.log("reader.connect()");
            f.call(reader, null, protocol);
        });

        reader.transmit.and.callFake(function (buffer, n, p, f) {
            console.log("reader.transmit()");
            if(!buffer.compare(Buffer.from([0xFF, 0xB0, 0x00, 0x00, 0x00]))) {
                f.call(reader, null, data);
            }
        });

        const adapter = new PCSCAdapter(pcsc);

        adapter.subscribe((err, data) => {
            expect(err).toBeTruthy();
            done();
        });

        generateStatus();
    }); 
});