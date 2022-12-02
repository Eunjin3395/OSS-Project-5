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



io.on("connection", (socket) => {
  console.log("a user connected");

  // 로그인 (중복 닉네임 들어올 시 거부) -> "login"을 listen하고 "login-result"를 emit
  // socket.emit("login",data)에 대한 listener
  // data = {nickname, img}
  // front\src\components\views\LoginPage.js
  socket.on("login", async (data) => {
    console.log("data: " + JSON.stringify(data));
    let resultData = {
      result: false,
      msg: "",
      name: "",
      rooms: [],
      img:""
    };
    
    // login result event에 넘겨줄 resultData.rooms는 lobby에서 active room list를 보여주기 위해 전달
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
    // resultData = {result: true/false, msg, rooms,name,img}
    if (result) {
      // 로그인 성공
      socket.nickname = data.nickname;
      socket.img = data.img;
      resultData.result = true;
      resultData.name = data.nickname;
      resultData.msg = `Hi ${socket.nickname} !`;
      resultData.rooms = rooms;
      resultData.img=data.img
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



  // 채팅방 생성 (중복 roomname 들어올 시 거부) -> "create-room"을 listen하고 "create-room-result"를 emit
  // socket.emit("create-room",data)에 대한 listener
  // data= {roomname,isSecret:Y/N,secretCode,limit}
  socket.on("create-room", async (data) => {
    // console.log('data: ' + JSON.stringify(data));
    let result = true;

    // 현재 rooms array에 같은 이름을 가진 room 존재하는지 체크
    rooms.forEach((room) => {
      if (room.roomname == data.roomname) {
        // rooms array에 해당 roomname을 가진 방 이미 존재할 경우
        console.log("room create failed, same room name", room.roomname);
        socket.emit("room-create-result", {
          roomname: "",
          result: false,
          msg: "Please enter new room name",
        });
        result = false;
      }
    });
    if (!result) return;

    // data.isSecret을 boolean으로 바꾸어 room array에 저장
    var boolSecret=false
    if(data.isSecret=="Y")
      boolSecret=true

    // room 생성
    let roomdata = {
      roomname: data.roomname,
      memNum: 0,
      memList: [],
      isSecret: boolSecret,
      secretCode: data.secretCode,
      limit: data.limit,
      adminNick: socket.nickname,
    };
    // 방을 생성하기만 하고 join은 X, 해당 roomdata를 rooms array에 저장
    rooms.push(roomdata);
    console.log("room created, data: " + JSON.stringify(roomdata));

    // socket.emit("room-create-result",data)
    // data = {roomname,result,msg}
    socket.emit("room-create-result", {
      roomname: data.roomname,
      result: true,
      msg: "room create success!",
    });
  });





});




// static folder 설정
app.use(express.static(path.join(__dirname, "public")));

const PORT = 8080;
server.listen(PORT, () => console.log(`Listening port on : ${PORT}`));