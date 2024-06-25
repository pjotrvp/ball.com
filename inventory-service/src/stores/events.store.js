const {
    EventStoreDBClient,
    jsonEvent,
  } = require("@eventstore/db-client");
  const listenEvents = ["ProductCreated", "ProductUpdated", "ProductDeleted", "ProductStockLowered"];
  
  const connectionString = "esdb://eventstoredb?tls=false";
  const client = EventStoreDBClient.connectionString(connectionString);
  
  async function subscribeToStream() {
    const subscription = client.subscribeToAll();
  
    for await (const resolvedEvent of subscription) {
      const event = resolvedEvent.event;

      if (listenEvents.includes(event.type)) {
        console.log(`Event: ${event.type} stored in event store`);
      }
    }
  }
  
  async function appendToStream(stream, eventName, eventData) {
    const event = jsonEvent({ type: eventName, data: eventData });
    await client.appendToStream(stream, [event]);
  }
  
  async function readFromStream(stream) {
    const events = client.readStream(stream);
    return events;
  }
  
  async function getSpecificEvents(stream, eventName) {
    const allEvents = await readFromStream(stream);
    const specificEvents = [];
  
    for await (const resolvedEvent of allEvents) {
      const event = resolvedEvent.event;
      if (event.type === eventName) {
        specificEvents.push(event);
      }
    }
  
    return specificEvents;
  }
  
  subscribeToStream();
  
  module.exports = {
    appendToStream,
    readFromStream,
    getSpecificEvents,
  };
  