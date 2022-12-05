import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LobbyPage.css";
import socket from "./socket";

const LobbyPage = () => {
  const navigate = useNavigate();

  const [isSecret, setIsSecret] = useState("N");
  const [roomList, setRoomList] = useState([]);

  useEffect(() => {
    console.log("방 리스트", roomList);
  });

  const roomNameRef = useRef();
  const secretCodeRef = useRef();
  const limitRef = useRef();

  const roomDoubleClickHandler = (roomName) => {
    socket.emit("room-in", roomName);
    navigate("/chat");
  };

  socket.on("login-result", (data) => {
    console.log("데이터", data);
  });

  const isSecretChangeHandler = (e) => {
    console.log(e.target.value);
    setIsSecret(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const roomData = {
      roomname: roomNameRef.current.value,
      secretCode: isSecret === "Y" ? secretCodeRef.current.value : "",
      isSecret: isSecret === "Y" ? isSecret : "",
      limit: limitRef.current.value,
    };
    socket.currentArea = "lobby";
    socket.emit("create-room", roomData);
  };

  socket.on("room-create-result", (data) => {
    if (!data) console.log("Failed to create room!");
  });

  socket.on("roomList", (data) => {
    data.map((room) =>
      setRoomList([
        ...roomList,
        {
          roomname: room.roomname,
          isSecret: room.isSecret,
          limit: room.limit,
          memNum: room.memNum,
        },
      ])
    );
  });

  useEffect(() => {
    socket.on("room-out-result", (data) => {
      console.log("나왔다", data);
      data.map((room) =>
        setRoomList([
          ...roomList,
          {
            roomname: room.roomname,
            isSecret: room.isSecret,
            limit: room.limit,
            memNum: room.memNum,
          },
        ])
      );
    });
  });

  return (
    <div id="lobbyArea" className="d-none">
      <div className="lobby-top">
        <div className="lobby-title">
          <p>{socket.nickname}'s Lobby</p>
        </div>
        <div className="lobby-mid">
          <div className="lobby-list">
            <div className="lobby-list-title">채팅 ▾</div>
            <div className="lobby-room-list">
              {roomList.map((room) => (
                <>
                  <div
                    className="lobby-room-chat"
                    onDoubleClick={() => {
                      roomDoubleClickHandler(room.roomname);
                    }}
                  >
                    <div className="lobby-room-chat-left">
                      <div className="lobby-chat-name">
                        {room.isSecret ? "🔒" : "🔓"}
                        {room.roomname}
                      </div>
                      <div className="lobby-chat-latest"></div>
                    </div>
                    <div className="lobby-room-chat-right">
                      {room.memNum} / {room.limit}
                    </div>
                  </div>
                </>
              ))}
            </div>
          </div>
          <div className="lobby-create-room">
            <div id="createRoom">
              <div className="lobby-img">
                <img className="lobby-user-img" src={socket.img} />
              </div>
              <form id="roomCreateForm" onSubmit={submitHandler}>
                <input
                  className="lobby-room-name"
                  id="createRoomTitle"
                  autoComplete="off"
                  placeholder="방 이름"
                  ref={roomNameRef}
                />

                <input
                  className="lobby-room-name"
                  id="createRoomLimit"
                  autoComplete="off"
                  placeholder="방 인원 수 제한"
                  ref={limitRef}
                />
                <p className="lobby-create-exp">*0명 입력시 무제한 입장</p>

                <p>
                  방 공개 여부:
                  <input
                    type="radio"
                    id="isSecret_N"
                    name="isSecret"
                    value="N"
                    defaultChecked
                    onChange={isSecretChangeHandler}
                  />
                  <label htmlFor="isSecret_N">공개</label>
                  <input
                    type="radio"
                    id="isSecret_Y"
                    name="isSecret"
                    value="Y"
                    onChange={isSecretChangeHandler}
                  />
                  <label htmlFor="isSecret_Y">비공개</label>
                </p>

                {isSecret === "Y" && (
                  <p id="secretCodeArea" className="d-none">
                    <input
                      className="lobby-room-name"
                      id="createSecretCode"
                      autoComplete="off"
                      placeholder="비밀방 코드"
                      ref={secretCodeRef}
                    />
                  </p>
                )}

                <button className="lobby-create-btn" type="submit">
                  create
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
