defmodule GameWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("playerPosition", %{"x" => x, "y" => y}, socket) do
    # Atualiza a posição do jogador na instância do modelo de jogador correspondente
    player = socket.assigns.player
    updated_player = %{player | x: x, y: y}
    socket = assign(socket, :player, updated_player)
    broadcast!(socket, "playerPosition", %{id: player.id, x: x, y: y})
    {:noreply, socket}
  end

  def handle_in("addUser", %{"uuid" => uuid, "x" => x, "y" => y }, socket) do
    broadcast!(socket, "addUser", %{uuid: uuid, x: x, y: y})
    {:noreply, socket}
  end
end
