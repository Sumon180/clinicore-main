const { queueName, connURL } = require(`../env/${process.env.ENV}.js`);
const amqp = require('amqplib/callback_api');

let ch = null;

amqp.connect(connURL, function (err, conn) {
    conn.createChannel(function (err, channel) {
        ch = channel;
    });
});

process.on('exit', (code) => {
    ch.close();
    console.log(`Closing rabbitmq channel`);
});

console.log(queueName, connURL);

const publishToQueue = async (msg) => {;
    ch.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)));
}

module.exports = {
    publishToQueue
}