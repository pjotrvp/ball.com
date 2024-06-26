using EventStore.ClientAPI;
using Newtonsoft.Json;
using System;
using System.Text;

public class EventStoreEventData
{
    public static EventData CreateEventData(object @event)
    {
        var eventData = new EventData(
            eventId: Guid.NewGuid(),
            type: @event.GetType().Name,
            isJson: true,
            data: Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(@event)),
            metadata: null);

        return eventData;
    }

    public static T DeserializeEvent<T>(ResolvedEvent resolvedEvent)
    {
        return JsonConvert.DeserializeObject<T>(Encoding.UTF8.GetString(resolvedEvent.Event.Data));
    }
}
