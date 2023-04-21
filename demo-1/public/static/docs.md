# Documentation

Client and server

## Client

### Message types

Sending:
 - message (chat message)
 - getUUID (getting a UUID)
 - setUUID (setting a UUID)
 - channelSwitch (switch to channel)
 - changeNick

Receiving:
 - message (chat message)
 - getUUID (after sending getUUID)
 - availableChannels (after connecting, contains all available channels)
 - channelHistory (after channelSwitch, receives all messages from the channel)
 - connectedUsers (after channelSwitch, contains all connected users)
 - message (chat message from other user)