import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css";
import socket from "./socket";
import yellow from "../../images/yellow.png";
import red from "../../images/red.png";
import blue from "../../images/blue.png";
import orange from "../../images/orange.png";
import purple from "../../images/purple.png";

export default function LoginPage() {
  const Navigate = useNavigate();
  const [UserName, setUserName] = useState("");
  const [ChatRoom, setChatRoom] = useState("");
  const [userImg, setUserImg] = useState(yellow);
  function UserNameHanler(event) {
    setUserName(event.currentTarget.value);
  }

  function SubmitHandler(event) {
    event.preventDefault();
    let img;
    switch (userImg) {
      case yellow:
        img = yellow;
        break;
      case red:
        img = red;
        break;
      case orange:
        img = orange;
        break;
      case blue:
        img = blue;
        break;
      case purple:
        img = purple;
        break;
    }

    // 현재 사용자의 위치를 표시
    socket.currentArea = "login";

    socket.emit("login", {
      nickname: UserName,
      Room: ChatRoom,
      img: img,
    });

    // 로그인 성공 시 로비로 이동.
    // 사용자의 위치도 업데이트
    socket.on("login-result", (resultData) => {
      socket.nickname = resultData.name;
      console.log(resultData);
      if (resultData.result) {
        socket.currentArea = "lobby";
        return Navigate("/chat"); // 로비 만들어지면 수정할 것.
      } else console.log(resultData.msg);
    });
  }

  function ImgChanger(e) {
    switch (userImg) {
      case yellow:
        setUserImg(red);
        break;
      case red:
        setUserImg(blue);
        break;
      case blue:
        setUserImg(orange);
        break;
      case orange:
        setUserImg(purple);
        break;
      case purple:
        setUserImg(yellow);
        break;
    }
  }

  return (
    <div className='LoginPage-Container'>
      <div className='Container'>
        <div>Login</div>
        <img src={userImg} onClick={ImgChanger} className='loginImg' />
        <form onSubmit={SubmitHandler} className='Login-form'>
          <input
            type='text'
            className='UserName'
            value={UserName}
            onChange={UserNameHanler}
            placeholder='Enter User name'
          />
          <button className='submit' type='submit'>
            <i class='fa-solid fa-check'></i>
          </button>
        </form>
        <div id='buttonDiv'></div>
      </div>
    </div>
  );
}
