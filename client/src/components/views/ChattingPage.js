import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ChattingPage.css";
import socket from "./socket";
import { JitsiMeeting } from "@jitsi/react-sdk";
export default function ChattingPage() {
  let Navigator = useNavigate();
  const img = socket.img;
  const [room, setRoom] = useState("Empty");
  const [userName, setUserName] = useState(socket.nickname);
  const [chatRoom, setChatRoom] = useState("Empty");
  const [memberCount, setMemberCount] = useState("Empty");
  let userInput = document.getElementById("User-Input");
  let chat = document.getElementById("chat");

  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  // 채팅페이지 템플릿
  // NabBar : 최상단 방의 이름 및 정보를 표시
  // chatroom : 현재 페이지의 이름
  // Video-Chat-Input-container : 화상통화 및 채팅창을 담당
  // Video-Interface : 화상 통화가 여기서 출력됨
  // Video-Button-Container : 음소거 및 화면 출력 버튼이 위치
  // Chat-Input-Container : 채팅창과 관련된 것들을 포함
  // Chat-Container : 채팅 출력창
  // Input-Container : 사용자 입력창

  let html = (
    <div id="MainPage-Container">
      <script src="https://meet.jit.si/external_api.js"></script>
      <div id="NabBar">
        <div className="ChatRoom-info">
          <div id="chatroom">{chatRoom}</div>
          <div className="Member-Cnt">{memberCount}</div>
        </div>
        <form onSubmit={LeaveToLoginPage} id="leave">
          <button className="ChatRoom-exit">
            <i class="fa-solid fa-house"></i>
          </button>
        </form>
      </div>
      <div className="Video-Chat-Input-container">
        <div id="Video-Interface">
          {chatRoom != "Empty" && (
            <JitsiMeeting
              className="video"
              domain="meet.jit.si"
              roomName={chatRoom}
              configOverwrite={{
                startWithAudioMuted: true,
                disableModeratorIndicator: true,
                startScreenSharing: true,
                enableEmailInStats: false,
                prejoinConfig: { enabled: false },
                toolbarButtons: ["camera", "microphone"],
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              }}
              userInfo={{
                displayName: userName,
                email: userName + "@gmail.com",
              }}
              onApiReady={(externalApi) =>
                externalApi.executeCommand("avatarUrl", socket.img)
              }
              getIFrameRef={(iframeRef) => {}}
            />
          )}
        </div>

        <div className="Chat-Input-Container">
          <div id="Chat-Container">
            <ul id="chat"></ul>
          </div>

          <div id="Input-Container">
            <input type="text" id="User-Input" />
            <button id="submit" onClick={SendText}>
              <i class="fa-solid fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  //메인 페이지 접속시 실행.
  // room={
  //   roomname:'', -> 채팅방 이름
  //   memNum:0, -> 현재 채팅방에 들어가있는 인원수
  //   memList:[], -> 멤버들의 name으로 구성
  //   isSecret:false, -> 채팅방의 비밀방 여부
  //   secretCode:'', -> 채팅방의 비밀코드
  //   limit:0, -> 채팅방의 제한인원
  //   adminNick:'' -> 방장의 nickname
  // }

  useEffect(() => {
    // 업데이트 요청이 들어오면
    socket.on("rooms-update", (rooms) => {
      // 우선 채팅방 인원 변동이 생긴건지 파악
      if (socket.currentArea == "chat") {
        console.log("방에 인원변동");
        let roomname = room.roomname; // 현재 방의 이름
        rooms.forEach((roomlist) => {
          if (roomlist.roomname == roomname) {
            // 현재 방에서 인원 변동이 발생한 경우에만 실행
            if (memberCount != roomlist.memNum) {
              // 채팅방 업데이트
              setRoom(roomlist);
            }
          }
        });
      }
    });
  });

  // room의 정보를 업데이트
  socket.on("this-room-info", (room) => {
    console.log(`방에 입장했습니다. : ${room.roomname}`);
    setRoom(room);
  });

  // 방에 새로 참가하거나 변동 시 현재 입장한 유저의 수를 업데이트
  useEffect(() => {
    if (room != "Empty") {
      setMemberCount(`입장 인원 : ${room.memList.length} / ${room.limit}`);
    }
  }, [room]);

  // 유저가 입장, 퇴장 시 채팅방에 이를 공지
  // useEffect(() => {
  //   socket.off("notify-message").on("notify-message", (msg) => {
  //     const message = document.createElement("li");
  //     message.className = "notify";
  //     message.innerText = msg;
  //     chat.appendChild(message);
  //     console.log(message);
  //   });
  // });

  // 전송 버튼을 누르면 실행
  // 메세지를 서버로 전송
  function SendText(event) {
    event.preventDefault();
    socket.emit("chat-message", userInput.value);
    console.log(`send message info : ${userInput.value}`);
    userInput.value = "";
  }

  // 서버에서 전송받은 메세지를 사용자 화면에 출력
  // css수정 필요, 사이즈 변경이 안됨.
  useEffect(() => {
    socket.off("chat-message").on("chat-message", (back) => {
      //  back = {
      //    name: back.nickname,
      //    img: back.img,
      //    msg: message,
      //    time: sendTime,
      //  };
      const name = document.createElement("div");
      name.innerText = back.nickname;
      name.className = "chatName";

      const time = document.createElement("div");
      time.innerText = back.time;
      time.className = "chatTime";

      const msg = document.createElement("div");
      msg.innerText = back.msg;
      msg.className = "chatMsg";

      const avatar = document.createElement("img");
      avatar.src = back.img;
      avatar.className = "chatAvatar";

      const chatting = document.createElement("div");
      chatting.className = "chatting";

      const userInfo = document.createElement("div");
      userInfo.className = "chat-userInfo";

      const message = document.createElement("div");
      message.className = "avatar-message";
      userInfo.appendChild(avatar);
      userInfo.appendChild(name);

      chatting.appendChild(msg);
      chatting.appendChild(time);

      message.appendChild(userInfo);
      message.appendChild(chatting);
      chat.appendChild(message);
    });
  });

  // 현재 위치하고 있는 방의 정보를 서버로부터 받은 후 업데이트
  useEffect(() => {
    if (room != "Empty") {
      console.log(`방이름은 : ${room.roomname}`);
      setChatRoom(room.roomname + " 방");
    }
  }, [room]);

  // logout 컨트롤러
  // 로그아웃 시 현재 위치를 로비로 수정
  function LeaveToLoginPage(event) {
    event.preventDefault();
    socket.currentArea = "lobby";
    socket.emit("room-out");
    console.log(room);
    return Navigator("/lobby"); // 로비 만들어지면 수정할 것
  }

  return html;
}
