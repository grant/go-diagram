// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"flag"
	"fmt"
	"go/ast"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	"github.com/grant/go-diagram/parse"
	"runtime"
)

type ClientError struct {
	Error string `json:"error"`
}

const (
	// Time allowed to write the file to the client.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the client.
	pongWait = 60 * time.Second

	// Send pings to client with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Poll file for changes with this period.
	filePeriod = 2 * time.Second

	port = "8080"
)

var (
	addr      = flag.String("addr", ":"+port, "http service address")
	dirname   string
	filenames []string
	upgrader  = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	pkgs map[string]*ast.Package

	// TODO yes global error state is disgusting. Sue me.
	globError error
)

func readFileIfModified(lastMod time.Time) (*parse.ClientStruct, time.Time, error) {
	if len(filenames) == 0 {
		return runParser(lastMod, nil)
	}
	for _, filename := range filenames {
		fi, err := os.Stat(filename)
		if err != nil || fi.ModTime().After(lastMod) {
			fmt.Println("Detected file change", err)
			return runParser(fi.ModTime(), err)
		}
	}
	return nil, lastMod, nil
}

func runParser(lastMod time.Time, err error) (*parse.ClientStruct, time.Time, error) {
	// TODO handle error
	var clientstruct *parse.ClientStruct
	clientstruct, pkgs = parse.GetStructsDirName(dirname)

	// Set new files to watch
	// TODO race conditions?
	filenames = []string{}
	for _, clientpkg := range clientstruct.Packages {
		for _, clientfile := range clientpkg.Files {
			filenames = append(filenames, clientfile.Name)
		}
	}

	return clientstruct, lastMod, err
}

func reader(ws *websocket.Conn) {
	defer ws.Close()
	ws.SetReadLimit(1000 * 512)
	ws.SetReadDeadline(time.Now().Add(pongWait))
	ws.SetPongHandler(func(string) error { ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		// fmt.Println("begin")
		// _, message, _ := ws.ReadMessage()
		// if err != nil {
		//         fmt.Println(err)
		//         break;
		// }
		var message parse.ClientStruct
		if err := ws.ReadJSON(&message); err != nil {
			fmt.Println(err)
			break
		}
		globError = parse.WriteClientPackages(dirname, pkgs, message.Packages)
		fmt.Println("Received client packages")
	}
}

func writer(ws *websocket.Conn, lastMod time.Time) {
	pingTicker := time.NewTicker(pingPeriod)
	fileTicker := time.NewTicker(filePeriod)
	defer func() {
		pingTicker.Stop()
		fileTicker.Stop()
		ws.Close()
	}()
	for {
		select {
		case <-fileTicker.C:
			var clientstruct *parse.ClientStruct
			//var p []byte
			// var err error

			clientstruct, lastMod, _ = readFileIfModified(lastMod)

			// TODO err

			if globError != nil {
				fmt.Println("error detected", globError.Error())
				ws.SetWriteDeadline(time.Now().Add(writeWait))
				ws.WriteJSON(ClientError{Error: globError.Error()})
				globError = nil
			} else if clientstruct != nil {
				fmt.Println("Pushing file change to client.")
				ws.SetWriteDeadline(time.Now().Add(writeWait))
				ws.WriteJSON(clientstruct)
				//if err := ws.WriteMessage(websocket.TextMessage, p); err != nil {
				//	return
				//}
			}
		case <-pingTicker.C:
			ws.SetWriteDeadline(time.Now().Add(writeWait))
			if err := ws.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Begin websocket server")
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		if _, ok := err.(websocket.HandshakeError); !ok {
			log.Println(err)
		}
		return
	}

	var lastMod time.Time
	if n, err := strconv.ParseInt(r.FormValue("lastMod"), 16, 64); err != nil {
		lastMod = time.Unix(0, n)
	}

	go writer(ws, lastMod)
	reader(ws)
}

func main() {
	flag.Parse()
	if flag.NArg() != 1 {
		log.Fatal("dirname not specified")
	}
	dirname = flag.Args()[0]
	http.Handle("/", http.FileServer(http.Dir("./app/build")))
	http.HandleFunc("/ws", serveWs)
	fmt.Println("Listening on http://localhost:" + port)

	switch runtime.GOOS {
	case "linux":
		exec.Command("x-www-browser", "http://localhost:"+port).Run()
	case "windows":
		exec.Command("explorer", "http://localhost:"+port).Run()
	default:
		exec.Command("open", "http://localhost:"+port).Run()
	}
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Fatal(err)
	}
}
