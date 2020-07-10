package main

import (
  "fmt"
  "net/http"
)

func ping(w http.ResponseWriter, r *http.Request) {
  w.Write([]byte("pong"))
}

func main() {
  fmt.Println("Odpalam serwer")
  http.Handle("/", http.FileServer(http.Dir(".")))
  http.HandleFunc("/ping", ping)
  if err := http.ListenAndServe(":8080", nil); err != nil {
    panic(err)
  }
  fmt.Println("Odpalony")
}
