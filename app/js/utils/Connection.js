// setInterval(() => {
//   console.log("SEND!")
//   conn.send(JSON.stringify([{name: "test", files: []}]));
// }, 6000)
let conn;
class Connection {
  static setUp() {
    console.log('Initializing websockets...');
    conn = new WebSocket("ws://localhost:8080/ws?lastMod=143918dd9ce16851");
    conn.onclose = function(evt) {
      console.log('Connection closed');
    }

  }

  static onMessage(callback) {
    conn.onmessage = callback;
  }
}


export default Connection;