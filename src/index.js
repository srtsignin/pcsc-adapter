const initialize = (pcsc, adapter) => {
    
    pcsc.on('reader', function(reader) {

        reader.on('error', function(err) {
            adapter._notifySubscribers(err, null);
        });

        reader.on('status', function(status) {
            /* check what has changed */
            var changes = this.state ^ status.state;
            if (changes) {
                if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                    reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                    reader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
                        if (err) {
                            adapter._notifySubscribers(err, null);
                        } else {
                            reader.transmit(Buffer.from([0xFF, 0xB0, 0x00, 0x00, 0x00]), 40, protocol, function(err, data) {
                                if (err) {
                                    adapter._notifySubscribers(err, null);
                                } else {
                                    if (!adapter._checkForValidData(data.toString('hex'))) {
                                        adapter._notifySubscribers("Invalid data", null);
                                    } else {
                                        adapter._notifySubscribers(null, data.toString('hex'));
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    });
}

function PCSCAdapter(pcsclite) {
    this.pcsc = pcsclite;
    initialize(this.pcsc, this);
    this.subscribers = [];
}

PCSCAdapter.prototype.subscribe = function (subscriber) {
    this.subscribers.push(subscriber);
}

PCSCAdapter.prototype._notifySubscribers = function (err, data) {
    this.subscribers.forEach(subscriber => subscriber(err, data));
}

PCSCAdapter.prototype._checkForValidData = function (data) {
    return data.length == 20;
}

module.exports = PCSCAdapter;