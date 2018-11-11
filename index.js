const pcsc = require('pcsclite')();

console.log(pcsc);

const subscribers = [];

pcsc.on('reader', function(reader) {
    // console.log('Reader ' + reader.name + ' found');
    console.log(reader.SCARD_STATE_PRESENT);

    reader.on('error', function(err) {
        console.log(err.message)
    });

    reader.on('status', function(status) {
        // console.log('Status(', this.name, '):', status);
        /* check what has changed */
        var changes = this.state ^ status.state;
        if (changes) {
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                console.log("card removed");/* card removed */
                reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Disconnected');
                    }
                });
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                console.log("card inserted");/* card inserted */
                reader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
                    if (err) {
                        console.log(err);
                    } else {
                        //console.log('Protocol(', reader.name, '):', protocol);
                        reader.transmit(Buffer.from([0xFF, 0xB0, 0x00, 0x00, 0x00]), 40, protocol, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Data received', data.toString('hex'));
                            }
                        });
                    }
                });
            }
        }
    });
});

module.exports.subscribe = (subscriber) => {
    subscribers.push(subscriber);
}

module.exports.notifySubscribers = (data) => {
    subscribers.forEach(subscriber => subscriber(data));
}