const PCSCAdapter = require('./index');
const pcsc = require('pcsclite')();

adapter = new PCSCAdapter(pcsc);

adapter.subscribe((err, data) => {
    if (err) {
        console.log(`Error: ${err}`);
    } else {
        console.log(`My data: ${data}`);
    }
});