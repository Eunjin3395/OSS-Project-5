import io from "socket.io-client";
const socket =
  process.env.NODE_ENV === "production"
    ? io.connect("https://tranquil-river-87865.herokuapp.com/")
    : io.connect("http://localhost:8080");
export default socket;
