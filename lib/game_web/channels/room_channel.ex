defmodule GameWeb.RoomChannel do
  use Phoenix.Channel
  alias GameWeb.Presence

  def join("room:lobby", %{"uuid" => uuid}, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :uuid, uuid)}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.uuid, %{
        uuid: socket.assigns.uuid,
        x: 0,
        y: 0,
        playerImage: "/images/sprites/playerDown.png",
        playerMoving: false
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("new_msg", %{"uuid" => uuid, "msg" => msg}, socket) do
    broadcast!(socket, "new_msg", %{uuid: uuid, msg: msg})
    {:noreply, socket}
  end

  def handle_in("update_player_moving", %{"x" => x, "y" => y, "playerImage" => playerImage, "isMoving" => isMoving}, socket) do
    Presence.update(socket, socket.assigns.uuid, %{
      uuid: socket.assigns.uuid,
      x: x,
      y: y,
      playerImage: playerImage,
      playerMoving: isMoving
    })
    {:noreply, socket}
  end

  def handle_in("player_position", %{"keyPressed" => keyPressed, "x" => x, "y" => y, "playerImage" => playerImage, "isMoving" => isMoving}, socket) do
    update_x = update_x(keyPressed, x)
    update_y = update_y(keyPressed, y)

    update_player_image = update_player_image(keyPressed, playerImage)

    update_player_moving = update_player_moving(keyPressed)

    Presence.update(socket, socket.assigns.uuid, %{
      uuid: socket.assigns.uuid,
      x: update_x,
      y: update_y,
      playerImage: update_player_image,
      playerMoving: update_player_moving
    })
    {:noreply, socket}
  end

  defp update_player_image("a", playerImage), do: "/images/sprites/playerLeft.png"
  defp update_player_image("d", playerImage), do: "/images/sprites/playerRight.png"
  defp update_player_image("w", playerImage), do: "/images/sprites/playerUp.png"
  defp update_player_image("s", playerImage), do: "/images/sprites/playerDown.png"
  defp update_player_image(_, playerImage), do: playerImage

  defp update_player_moving(keyPressed) do
    case keyPressed do
      "a" -> true
      "d" -> true
      "w" -> true
      "s" -> true
      _ -> false
    end
  end

  defp update_x("a", x), do: x - 10
  defp update_x("d", x), do: x + 10
  defp update_x(_, x), do: x

  defp update_y("w", y), do: y - 10
  defp update_y("s", y), do: y + 10
  defp update_y(_, y), do: y
end
