# mc-bot-server

start a minecraft bot remotely

## API

### Creating Bots

```
POST /create 
Content-Type: application/json
{
  apiKey: "valid api key",
  type: "one of the bots from lib/bots/*.js",
  port: 25565,
  host: "server.example.com"
  username: "mybotname",
  password: "optional password",
  owner: "username who started the bot"
}
```

Returns an ID that you can pass to /destroy

### Destroying Bots

```
POST /destroy
Content-Type: application/json
{
  apiKey: "valid api key",
  id: "bot id to destroy"
}
```
