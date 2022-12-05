import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css";
import socket from "./socket";
import yellow from "../../images/yellow.png";
import red from "../../images/red.png";
import blue from "../../images/blue.png";
import orange from "../../images/orange.png";
import purple from "../../images/purple.png";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

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
  }

  // 로그인 성공 시 로비로 이동.
  // 사용자의 위치도 업데이트
  socket.on("login-result", (resultData) => {
    socket.nickname = resultData.name;

    // jitsiAPI에 img url 전달하기 위함.
    if (resultData.img.includes("/static/media")) {
      // user가 우리가 제공하는 avatar 고른 경우
      socket.img = "http://localhost:3000" + resultData.img; // 서버 배포 시 localhost가 아닌 배포 주소로 바꿔야함
    } else {
      // user가 구글로그인으로 img 불러온 경우
      socket.img = resultData.img;
    }

    console.log(resultData);
    if (resultData.result) {
      socket.currentArea = "lobby";
      return Navigate("/lobby"); // 로비 만들어지면 수정할 것.
    } else console.log(resultData.msg);
  });

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
    <div className="LoginPage-Container">
      <div className="Container">
        <div>Login</div>
        <img src={userImg} onClick={ImgChanger} className="loginImg" />
        <form onSubmit={SubmitHandler} className="Login-form">
          <input
            type="text"
            className="UserName"
            value={UserName}
            onChange={UserNameHanler}
            placeholder="Enter User name"
          />
          <button className="submit" type="submit">
            <i class="fa-solid fa-check"></i>
          </button>
        </form>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              let payload = jwt_decode(credentialResponse.credential);
              socket.emit("login", {
                nickname: payload.name,
                img: payload.picture,
              });
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}
