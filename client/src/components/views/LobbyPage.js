import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LobbyPage.css";
import socket from "./socket";

const LobbyPage = () => {
  const navigate = useNavigate();

  const [isSecret, setIsSecret] = useState("N");

  const roomNameRef = useRef();
  const secretCodeRef = useRef();
  const limitRef = useRef();

  const clickHandler = () => {
    socket.on("login-result", (result) => {
      console.log(result);
    });
  };

  useEffect(() => {
    socket.on("room-create-result", (data) => {
      console.log(data);
    });
  }, []);

  useEffect(() => {
    socket.on("create-room", (data) => {
      console.log(data);
    });
  }, []);

  const isSecretChangeHandler = (e) => {
    console.log(e.target.value);
    setIsSecret(e.target.value);
  };

  const submitHandler = () => {
    const roomData = {
      roomname: roomNameRef.current.value,
      secretCode: secretCodeRef.current.value,
      isSecret: isSecret,
      limit: limitRef.current.value,
    };
    socket.currentArea = "lobby";
    socket.emit("create-room", roomData);
  };

  socket.on("room-create-result", (data) => {
    console.log(data);
  });

  return (
    <div id="lobbyArea" className="d-none">
      <div className="lobby-top">
        <div className="lobby-title">
          <p>Lobby</p>
        </div>
        <div className="lobby-mid">
          <div className="lobby-list">
            <div className="lobby-list-title">채팅 ▾</div>
            <div className="lobby-room-list">
              <div className="lobby-room-chat">
                <div className="lobby-room-chat-left">
                  <div className="lobby-chat-name">18 박선홍 형</div>
                  <div className="lobby-chat-latest">롤중</div>
                </div>
                <div className="lobby-room-chat-right">🔒 2 / 4</div>
              </div>
              <div className="lobby-room-chat">
                <div className="lobby-room-chat-left">
                  <div className="lobby-chat-name">컴공 단톡방</div>
                  <div className="lobby-chat-latest">감자</div>
                </div>
                <div className="lobby-room-chat-right">🔓 10 / 30</div>
              </div>
            </div>
          </div>
          <div className="lobby-create-room">
            <div id="createRoom">
              <div className="lobby-img">
                <img className="lobby-user-img" src="images/01.png" />
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
