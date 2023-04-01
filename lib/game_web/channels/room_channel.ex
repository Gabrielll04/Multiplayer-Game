defmodule GameWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("playerPosition", %{"uuid" => uuid, "x" => x, "y" => y}, socket) do
    broadcast!(socket, "playerPosition", %{uuid: uuid, x: x, y: y})
    {:noreply, socket}
  end

  def handle_in("addPlayer", %{"uuid" => uuid, "x" => x, "y" => y }, socket) do

    broadcast!(socket, "addPlayer", %{uuid: uuid, x: x, y: y})

    {:noreply, socket}
  end
end
