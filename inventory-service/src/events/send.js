const rabbit = require("rabbitmq-stream-js-client");

async function send() {
    const streamName = "hello-nodejs-stream";

    console.log("Connecting send...");
    const client = await rabbit.connect({
        vhost: "/",
        port: 5672,
        hostname: "rabbitmq",
        username: "guest",
        password: "guest",
    });

    console.log("Making sure the stream exists...");
    const streamSizeRetention = 5 * 1e9
    await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });

    console.log("Creating the publisher...");
    const publisher = await client.declarePublisher({ stream: streamName });

    console.log("Sending a message...");
    await publisher.send(Buffer.from("Test message"));

    console.log("Closing the connection...");
    await client.close();
}

module.exports = {
    send
}