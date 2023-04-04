defmodule GameWeb.RoomChannel do
  use Phoenix.Channel
  alias GameWeb.Presence

  def join("room:lobby", %{"uuid" => uuid}, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :uuid, uuid)}
  end

  def handle_in("player_position", %{"x" => x, "y" => y}, socket) do
    Presence.update(socket, socket.assigns.uuid, %{
      uuid: socket.assigns.uuid,
      x: x,
      y: y
    })
    {:noreply, socket}
  end

  def handle_in("new_msg", %{"uuid" => uuid, "msg" => msg}, socket) do
    broadcast!(socket, "new_msg", %{uuid: uuid, msg: msg})
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
