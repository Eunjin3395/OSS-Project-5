const express = require("express");
const app = express();
const path = require("path");
const socketio = require("socket.io");
const server = require("http").createServer(app);
const cors = require("cors");
const io = socketio(server, { cors: { origin: "*" } });
let rooms = new Array(); //-> 아래와 같은 room 객체를 가진 array, 전체 active한 방의 정보들을 저장

// rooms[0]={
//   roomname:'', -> 채팅방 이름
//   memNum:0, -> 현재 채팅방에 들어가있는 인원수
//   memList:[], -> 멤버들의 name으로 구성
//   isSecret:false, -> 채팅방의 비밀방 여부
//   secretCode:'', -> 채팅방의 비밀코드
//   limit:0, -> 채팅방의 제한인원
//   adminNick:'' -> 방장의 nickname
// }


// let info;
io.on("connection", (socket) => {
  console.log("a user connected");

  // 로그인 (중복 닉네임 들어올 시 거부) -> "login"을 listen하고 "login-result"를 emit
  // socket.emit("login",data)에 대한 listener
  // data = {nickname, avatar}
  // front\src\components\views\LoginPage.js
  socket.on("login", async (data) => {
    if (typeof data !== "object") {
      try {
        var ticket = await client.verifyIdToken({
          idToken: data,
          audience: process.env["GOOGLE_CLIENT_ID"],
        });
        var payload = ticket.getPayload();
        var name = payload["name"];
        var picture = payload["picture"];
      } catch (err) {
        console.error(err);
      }
      data = {
        nickname: name,
        avatar: picture,
      };
    }

    console.log("data: " + JSON.stringify(data));
    let resultData = {
      result: false,
      msg: "",
      name: "",
      rooms: [],
    };
    // login result event에 넘겨줄 data, rooms는 lobby에서 active room list를 보여주기 위해 전달
    // 전체 socket 확인해서 중복 nickname있는지 체크
    const sockets = await io.fetchSockets();
    let result = true;
    for (const sock of sockets) {
      if (sock.nickname == data.nickname) {
        result = false;
        break;
      }
    }

    // 로그인 결과를 client에게 전송
    // socket.emit("login-result",resultData)
    // resultData = {result: true/false, msg, rooms,nickname,img}

    if (result) {
      // 로그인 성공
      // socket.avatar에 이미지 저장하는 부분 아직 안함
      socket.nickname = data.nickname;
      socket.img = data.img;
      resultData.result = true;
      resultData.name = data.nickname;
      resultData.msg = `Hi ${socket.nickname} !`;
      resultData.rooms = rooms;
      console.log(resultData);
      console.log(
        `login success, socketID: ${socket.id}, nickname: ${socket.nickname}`
      );
    } else {
      // 로그인 실패
      resultData.result = false;
      resultData.msg = "Please enter new nickname";
      console.log("login Fail");
    }
    socket.emit("login-result", resultData);
  });
});




// static folder 설정
app.use(express.static(path.join(__dirname, "public")));

const PORT = 8080;
server.listen(PORT, () => console.log(`Listening port on : ${PORT}`));