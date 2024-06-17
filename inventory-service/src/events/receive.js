const rabbit = require("rabbitmq-stream-js-client")

async function receive() {
    const streamName = "hello-nodejs-stream"

    console.log("Connecting receive...");
    const client = await rabbit.connect({
        vhost: "/",
        port: 5672,
        hostname: "rabbitmq",
        username: "guest",
        password: "guest",
    })

    console.log("Making sure the stream exists...");
    const streamSizeRetention = 5 * 1e9
    await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });

    console.log("Declaring the consumer with offset...");
    await client.declareConsumer({ stream: streamName, offset: rabbit.Offset.first() }, (message) => {
        console.log(`Received message ${message.content.toString()}`)
    })

}

module.exports = {
    receive
}