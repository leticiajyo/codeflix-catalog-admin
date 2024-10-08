Consumer acknowledgements in RabbitMQ:

- ACK: Acknowledged (message is discarded)
- NACK: Not Acknowledged (message is thrown back in the queue or discarded)
- UNACKED: Message was not confirmed (message is in a limbo and we need to restart consumer)

Template message to test VideoMediaConvertedConsumer. Do not forget to update the values with a valid video ID.

```
{
 "video": {
    "resourceId": "906ee2e8-3886-4239-ae9c-f4f6d7f0425a.video",
    "status": "completed",
    "encodedVideoFolder": "videos/906ee2e8-3886-4239-ae9c-f4f6d7f0425a/mpeg-dash"
  }
}
```
