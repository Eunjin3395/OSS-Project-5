import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LobbyPage.css";
import socket from "./socket";

const LobbyPage = () => {
  const navigate = useNavigate();

  const [isSecret, setIsSecret] = useState("N");
  const [roomList, setRoomList] = useState([]);
  const roomNameRef = useRef();
  const secretCodeRef = useRef();
  const limitRef = useRef();



  //비밀방 설정
  const isSecretChangeHandler = (e) => {
    console.log(e.target.value);
    setIsSecret(e.target.value);
  };

  
  // 채팅방 두번 클릭 시 해당 방으로 입장
  const roomDoubleClickHandler = (roomName) => {
    socket.emit("room-in", roomName);
    socket.currentArea = "chat";
    navigate("/chat");
  };


  // 로그인-> 로비로 오자마자 active한 room list update
  socket.on("lobby-setRoomList", (data) => {
    data.map((room) =>
      setRoomList([
        ...roomList,
        {
          roomname: room.roomname,
          isSecret: room.isSecret,
          secretCode: room.secretCode,
          limit: room.limit,
          memNum: room.memNum,
        },
      ])
    );
  });

  

  //채팅방 생성 및 입장
  const submitHandler = (e) => {
    e.preventDefault();
    const roomData = {
      roomname: roomNameRef.current.value,
      secretCode: isSecret === "Y" ? secretCodeRef.current.value : "",
      isSecret: isSecret === "Y" ? isSecret : "",
      limit: limitRef.current.value,
    };
    // socket.currentArea = "lobby";
    socket.emit("create-room", roomData);
  };

  // 방 생성 결과(방장이 생성 후 바로 입장)
  socket.on("room-create-result", (data) => {
    if (!data.result) console.log(data.msg);
    else {
      console.log(data.msg);
      socket.emit("room-in", data.roomname);
      socket.currentArea = "chat";
      navigate("/chat");
    }
  });


  



  // 방에서 로비로 올때 현재 active한 room list update
  // data={rooms,roomname} -> roomname은 내가 나간 방의 이름
  useEffect(()=>{
    socket.on("room-out-result", (data) => {
      console.log(`=== room out: ${data.roomname}, socket.on(room-out-result) - before setRoomList, data from server ===`);
      console.log(data.rooms);

      data.rooms.map((room) =>
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

      console.log("=== socket.on(room-out-result) - after setRoomList, roomList from client ===");
      console.log(roomList);
    });
  });    
  
  

  // 방 리스트에 변동 생겼을 때 현재 active한 room list update
  useEffect(()=>{
    socket.on("rooms-update", (rooms) => {
      if(socket.currentArea=="lobby"){
        console.log("=== socket.on(rooms-update) - before setRoomList, data from server ===");
        console.log(rooms);

        setRoomList(rooms);

        console.log("=== socket.on(rooms-update) - after setRoomList, roomList from client ===");
        console.log(roomList);
      }
    });
  });
  

  return (
    <div id='lobbyArea' className='d-none'>
      <div className='lobby-top'>
        <div className='lobby-title'>
          <p>{socket.nickname}'s Lobby</p>
        </div>
        <div className='lobby-mid'>
          <div className='lobby-list'>
            <div className='lobby-list-title'>채팅 ▾</div>
            <div className='lobby-room-list'>
              {roomList.map((room) => (
                <>
                  <div
                    className='lobby-room-chat'
                    onDoubleClick={() => {
                      roomDoubleClickHandler(room.roomname);
                    }}>
                    <div className='lobby-room-chat-left'>
                      <div className='lobby-chat-name'>
                        {room.isSecret ? "🔒" : "🔓"}
                        {room.roomname}
                      </div>
                      <div className='lobby-chat-latest'></div>
                    </div>
                    <div className='lobby-room-chat-right'>
                      {room.memNum} / {room.limit}
                    </div>
                  </div>
                </>
              ))}
            </div>
          </div>
          <div className='lobby-create-room'>
            <div id='createRoom'>
              <div className='lobby-img'>
                <img className='lobby-user-img' src={socket.img} />
              </div>
              <form id='roomCreateForm' onSubmit={submitHandler}>
                <input
                  className='lobby-room-name'
                  id='createRoomTitle'
                  autoComplete='off'
                  placeholder='방 이름'
                  ref={roomNameRef}
                />

                <input
                  className='lobby-room-name'
                  id='createRoomLimit'
                  autoComplete='off'
                  placeholder='방 인원 수 제한'
                  ref={limitRef}
                />
                <p className='lobby-create-exp'>*0명 입력시 무제한 입장</p>

                <p>
                  방 공개 여부:
                  <input
                    type='radio'
                    id='isSecret_N'
                    name='isSecret'
                    value='N'
                    defaultChecked
                    onChange={isSecretChangeHandler}
                  />
                  <label htmlFor='isSecret_N'>공개</label>
                  <input
                    type='radio'
                    id='isSecret_Y'
                    name='isSecret'
                    value='Y'
                    onChange={isSecretChangeHandler}
                  />
                  <label htmlFor='isSecret_Y'>비공개</label>
                </p>

                {isSecret === "Y" && (
                  <p id='secretCodeArea' className='d-none'>
                    <input
                      className='lobby-room-name'
                      id='createSecretCode'
                      autoComplete='off'
                      placeholder='비밀방 코드'
                      ref={secretCodeRef}
                    />
                  </p>
                )}

                <button className='lobby-create-btn' type='submit'>
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
