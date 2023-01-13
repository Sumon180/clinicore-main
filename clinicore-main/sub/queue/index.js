const { queueName, connURL } = require(`../env/${process.env.ENV}.js`);
const processMessage = require('../controllers/index.js');
const amqp = require('amqplib/callback_api');

module.exports = () => {
    amqp.connect(connURL, function (err, conn) {
        if (err) throw err;

        conn.createChannel(function (_err, channel) {
            if (_err) throw _err;
            console.log('We are listening to queue');

            channel.assertQueue(queueName);

            channel.consume(queueName, async (msg) => {
                if (msg !== null) {
                    await processMessage(msg);
                    channel.ack(msg);
                } else {
                    console.log('Consumer cancelled by server');
                }
            });
        });
    });
};
