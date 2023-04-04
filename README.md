# Game

To start your Phoenix server:

  * Run `mix setup` to install and setup dependencies
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

# About

This is a small project to better understand Phoenix's Channels and Presents modules. Although it is called a "game", this project is about a single room (lobby) where connected clients are gathered. Each new client that connects to the server receives the list of users already present with their updated location. With each new player connected, the list of players present changes, the server recognizes these changes and communicates them to the connected users. In this way, each new user, all clients receive the rendering of the player's sprite, the same happens with players who are absent, which causes the exclusion of the user in question from the list of present players, which causes the exclusion of their sprite.

# To-do
- [x] Dynamically present players sprite rendering update.
- [x] Chat.
- [ ] Chante the camera position to follow player.
- [ ] Sprite animations
- [ ] Tests.
- [ ] Organize the project into classes.
- [ ] Add some design patterns.
