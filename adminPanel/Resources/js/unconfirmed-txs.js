var transactions = [];

var count;
var total_fees;
var total_size;
var _header;
var _connected;
var _disconnected;
var _txIndexes;
var sound_on = true;
var lasttx = null;

function SetStatus() {
    var header = _header.replace('{0}', count);

    document.title = header;

    $('#header').html(header);

    $('#total_fees').html(formatMoney(total_fees));

    $('#total_size').html(total_size / 1000 + ' (KB)');
}

function ws_connect() {
    webSocketConnect(function(ws) {
        ws.onmessage = function(e) {
            console.log(e);

            var obj = $.parseJSON(e.data);

            if (obj.op == 'status') {
                $('#status').html(obj.msg);
            } else if (obj.op == 'utx') {
                op = obj.x;

                count++;

                var tx = TransactionFromJSON(op);

                _txIndexes.push(tx.txIndex);

                var tx_html = tx.getHTML();

                $('#tx_container').prepend(tx_html);

                setupSymbolToggle();

                tx_html.hide().slideDown('slow');

                $('#tx_container .txdiv:last-child').remove();

                SetStatus();

                lasttx = tx;
            } else if (obj.op == 'block') {
                for (var i = 0; i < obj.x.txIndexes.length; ++i) {
                    var txIndex = obj.x.txIndexes[i];

                    var el = $('#tx-' + txIndex);
                    if (el.length > 0) {
                        el.remove();
                    }

                    var index = _txIndexes.indexOf(txIndex);
                    if (index > -1) {
                        _txIndexes.splice(index, 1);
                        count--;
                    }
                }

                SetStatus();

                if (sound_on) {
                    playSound('ding');
                }
            }
        };

        ws.onopen = function() {
            $('#status').html(_connected);

            ws.send('{"op":"unconfirmed_sub"}{"op":"blocks_sub"}');
        };

        ws.onclose = function() {
            $('#status').html(_disconnected);
        };
    });
}

$(document).ready(function() {

    var data_obj = $(document.body).data('json');

    count = data_obj.count;
    total_fees = data_obj.total_fees;
    total_size = data_obj.total_size;
    _header = data_obj.header;
    _connected = data_obj.connected;
    _disconnected = data_obj.disconnected;
    _txIndexes = data_obj.txIndexes;

    if (data_obj.enable_websocket) {
        ws_connect();
    }

    // pull app root out of meta tag - this gets referenced by tx.getHTML()
    root = document.getElementById('explorer-root').attributes['src'].value;
    root = explorer_root.substring(0, explorer_root.length - 1);

    for (var i in data_obj.locations)  {
        var location = data_obj.locations[i];
    }
});
