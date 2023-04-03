defmodule GameWeb.RoomChannel do
  use Phoenix.Channel
  alias GameWeb.Presence

  def join("room:lobby", %{"uuid" => uuid}, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :uuid, uuid)}
  end

  def handle_in("playerPosition", %{"uuid" => uuid, "x" => x, "y" => y}, socket) do
    broadcast!(socket, "playerPosition", %{uuid: uuid, x: x, y: y})
    {:noreply, socket}
  end

  def handle_in("addPlayer", %{"uuid" => uuid, "x" => x, "y" => y }, socket) do
    broadcast!(socket, "addPlayer", %{uuid: uuid, x: x, y: y})
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.uuid, %{
        uuid: socket.assigns.uuid,
        x: 0,
        y: 0
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end
end
