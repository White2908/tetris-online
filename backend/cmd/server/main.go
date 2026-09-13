package main

import (
	"log"
	"net/http"

	"github.com/White2908/tetris-online/backend/internal/controller"
	"github.com/White2908/tetris-online/backend/internal/websocket"
)

func main() {
	rooms := controller.NewRoomController()
	games := controller.NewGameController()
	chats := controller.NewChatController()
	ws := websocket.NewHandler(rooms, games, chats)

	http.HandleFunc("/ws", ws.ServeWS)
	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
