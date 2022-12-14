const express = require("express");
const app = express();
const path = require("path");
const socketio = require("socket.io");
const server = require("http").createServer(app);
const cors = require("cors");
const io = socketio(server, { cors: { origin: "*" } });
let rooms = new Array(); //-> 아래와 같은 room 객체를 가진 array, 전체 active한 방의 정보들을 저장
var { OAuth2Client } = require("google-auth-library");
var client = new OAuth2Client(process.env["GOOGLE_CLIENT_ID"]);

// rooms[0]={
//   roomname:'', -> 채팅방 이름
//   memNum:0, -> 현재 채팅방에 들어가있는 인원수
//   memList:[], -> 멤버들의 name으로 구성
//   isSecret:false, -> 채팅방의 비밀방 여부
//   secretCode:'', -> 채팅방의 비밀코드
//   limit:0, -> 채팅방의 제한인원
//   adminNick:'' -> 방장의 nickname
// }

// roomname받아 해당 room 객체 리턴하는 함수
function getRoomByName(nameInput) {
  let result = {};
  rooms.forEach((room) => {
    if (room.roomname == nameInput) result = room;
  });
  return result;
}

// roomname받아 해당 room에 있는 member들의 nickname list 리턴하는 함수
function getMemberInRoom(nameInput) {
  let result = new Array();
  let memberSet = io.sockets.adapter.rooms.get(nameInput);
  console.log(memberSet);
  for (const member of memberSet) {
    let sock = io.sockets.sockets.get(member);
    result.push(sock.nickname);
  }
  return result;
}

// rooms array 안의 전체 room들의 인원수/멤버리스트 업데이트하는 함수, 파라미터에 roomname 넘겨주면 그 room을 삭제함
function roomUpdate(delRoom = "") {
  console.log("roomUpdate called");
  //해당 room을 삭제해야하는 경우 roomname을 받음
  //rooms array에 있는 모든 방에 대해 다음을 실행
  for (var i = 0; i < rooms.length; i++) {
    if (delRoom) {
      // 삭제돼야할 room 있을경우 rooms array에서 해당 room을 삭제
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].roomname == delRoom) {
          rooms.splice(i, 1);
          i--;
        }
      }
    } else {
      // 삭제 이외의 event 발생했을 떄는 인원수와 멤버리스트 갱신
      rooms[i].memList = getMemberInRoom(rooms[i].roomname);
      rooms[i].memNum = io.sockets.adapter.rooms.get(rooms[i].roomname).size;
    }
  }
  console.log(`rooms array length: ${rooms.length}`);
  rooms.forEach((room) => console.log(room.roomname));
}

io.on("connection", (socket) => {
  console.log("a user connected");

  // 창 새로고침하거나 창 닫아서 socket이 disconnect됐을 때 rooms array update & 채팅방에 notify msg 남김
  // -> "notify-message"를 sockets.in(socket.roomname).emit
  //    "rooms-update"를 broadcast.emit
  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (getRoomByName(socket.roomname).memNum == 1)
      // 내가 이 방의 마지막 남은 1명인데 내가 disconnect된 경우
      roomUpdate(socket.roomname); // 해당 room 삭제
    else {
      // 채팅방에 msg남기고 전체 rooms array update
      io.sockets
        .in(socket.roomname)
        .emit("notify-message", `${socket.nickname} left this room.`);
      roomUpdate();
    }

    // lobby의 room list 갱신 위함
    // socket.broadcast.emit("rooms-update",rooms)
    // rooms는 전체 active한 rooms array
    socket.broadcast.emit("rooms-update", rooms);
  });

  // 로그인 (중복 닉네임 들어올 시 거부) -> "login"을 listen하고 "login-result"를 emit
  // socket.emit("login",data)에 대한 listener
  // data = {nickname, img}
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
        img: picture,
      };
    }

    console.log("data: " + JSON.stringify(data));
    let resultData = {
      result: false,
      msg: "",
      name: "",
      rooms: [],
      img: "",
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
      resultData.img = data.img;
      console.log(resultData);
      console.log(
        `login success, socketID: ${socket.id}, nickname: ${socket.nickname}, img:${resultData.img}`
      );
      // socket.broadcast.emit("rooms-update", rooms);

      socket.emit("login-result", resultData);

      // 로그인 성공 후 로비에서 active한 room list update하기 위해 rooms array 전송
      socket.emit("lobby-setRoomList", rooms);
      console.log("lobby-setRoomList emitted");
      console.log(rooms);
    } else {
      // 로그인 실패
      resultData.result = false;
      resultData.msg = "Please enter new nickname";
      console.log("login Fail");
      socket.emit("login-result", resultData);
    }
  });

  // 채팅방 생성 (중복 roomname 들어올 시 거부) -> "create-room"을 listen하고 "create-room-result"를 emit
  // socket.emit("create-room",data)에 대한 listener
  // data= {roomname,isSecret:Y/N,secretCode,limit}
  socket.on("create-room", async (data) => {
    // console.log('data: ' + JSON.stringify(data));
    let result = true;

    // 현재 rooms array에 같은 이름을 가진 room 존재하는지 체크
    rooms.forEach((room) => {
      if (room.roomname == data.roomname || room.roomname.toUpperCase()==data.roomname.toUpperCase() ) {
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
    var boolSecret = false;
    if (data.isSecret == "Y") boolSecret = true;

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
    // socket.emit("roomList",rooms);
    // socket.broadcast.emit("roomList", rooms);
  });

  // 방 입장 & 내 방 정보 세팅 & 전체 rooms array update
  // -> "room-in"을 listen,
  //    "notify-message"를 sockets.in(socket.roomname).emit,
  //    "this-room-info"를 emit,
  //    "rooms-update"를 broadcast.emit
  //socket.emit("room-in",roomname)에 대한 listener
  socket.on("room-in", (roomname) => {
    // socket을 해당 roomname으로 join시킴
    socket.join(roomname);
    socket.roomname = roomname;

    // 해당 방에 새 user가 방 입장했음 msg 전송
    // sockets.in(socket.roomname).emit("notify-message",msg)
    io.sockets
      .in(socket.roomname)
      .emit("notify-message", `${socket.nickname} joined this room.`);

    // 전체 rooms array update(특정 방의 인원수가 +1 되었으므로)
    roomUpdate();

    // 내 방의 정보를 client에게 전송 (roomname, 현재 인원수 / limit, 멤버 리스트 표시하기 위함)
    // socket.emit("this-room-info",thisRoom) , room은 내 방 객체
    let thisRoom = getRoomByName(socket.roomname);
    socket.emit("this-room-info", thisRoom);
    console.log(`방에 입장했습니다. ${socket.nickname}`);
    // 다른 모든 socket에도 rooms array에 변화 생겼음을 client에게 전송 (특정 방의 인원수가 +1 되었으므로)
    // rooms는 전체 active한 rooms array
    socket.broadcast.emit("rooms-update", rooms);
  });

  // client로부터 메시지 받고 해당 방의 모든 client에게 메시지 전달
  // -> "chat-message"를 listen, "chat-message"를 sockets.in(socket.roomname).emit
  // socket.emit("chat-message",msg)에 대한 listener
  socket.on("chat-message", (message) => {
    // 해당 방의 모든 socket에게 msg와 nickname 전달
    // sockets.in(socket.roomname).emit("chat-message",data)
    // data = {msg 보낸 사람의 name,img,msg,time}
    let time = new Date();
    let hh = time.getHours();
    let mm = time.getMinutes();
    let sendTime = `${hh} : ${mm}`;
    data = {
      name: socket.nickname,
      img: socket.img,
      msg: message,
      time: sendTime,
    };

    io.sockets.in(socket.roomname).emit("chat-message", data);

    console.log(
      `New chat in roomname ${socket.roomname}, ${socket.nickname} says: ${message}`
    );
  });

  // 방 나가기, 필요 시 방 삭제
  // -> "room-out"을 listen하고,
  //    "room-out-result"를 emit(lobby_roomUpdate에 필요한 rooms array 전달용)
  // socket.emit("room-out")에 대한 listener
  // socket.emit("room-out-result",rooms)
  socket.on("room-out", () => {
    if (getRoomByName(socket.roomname).memNum == 1) {
      // 내가 이 방의 마지막 남은 1명인데 내가 나가는 경우
      var data = { rooms: rooms, roomname: socket.roomname };
      socket.leave(socket.roomname); // socket의 join 풀어줌
      roomUpdate(socket.roomname); // 해당 room 삭제
      data.rooms = rooms;
    } else {
      // 채팅방에 msg남기고 join 풀고 전체 rooms array update
      io.sockets
        .in(socket.roomname)
        .emit("notify-message", `${socket.nickname} left this room.`);

      var data = { rooms: rooms, roomname: socket.roomname };

      console.log("user left room");
      socket.leave(socket.roomname); // socket의 join 풀어줌
      roomUpdate();
      data.rooms = rooms;
    }
    // chat->lobby로 갈때 client에서 현재 active한 room list update함수 호출하기 위한
    // 데이터인 rooms array를 넘겨줌
    socket.emit("room-out-result", data);

    // chat room의 info와 lobby의 room list 갱신 위함
    // socket.broadcast.emit("rooms-update",rooms)
    // rooms는 전체 active한 rooms array
    socket.broadcast.emit("rooms-update", rooms);
  });
});

// static folder 설정
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
} else app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Listening port on : ${PORT}`));
