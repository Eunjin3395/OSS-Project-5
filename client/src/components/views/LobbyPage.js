import React from "react";
import "../css/LobbyPage.css";

const LobbyPage = () => {
  return (
    <div id="lobbyArea" class="d-none">
      <div class="lobby-top">
        <div class="lobby-title">
          <p>Lobby</p>
        </div>
        <div class="lobby-mid">
          <div class="lobby-list">
            <div class="lobby-list-title">채팅 ▾</div>
            <div class="lobby-room-list">
              <div class="lobby-room-chat">
                <div class="lobby-room-chat-left">
                  <div class="lobby-chat-name">user1</div>
                  <div class="lobby-chat-latest">ㅇㄷ노?</div>
                </div>
                <div class="lobby-room-chat-right">🔒 2 / 2</div>
              </div>
              <div class="lobby-room-chat">
                <div class="lobby-room-chat-left">
                  <div class="lobby-chat-name">18 박선홍 형</div>
                  <div class="lobby-chat-latest">롤중</div>
                </div>
                <div class="lobby-room-chat-right">🔒 2 / 4</div>
              </div>
              <div class="lobby-room-chat">
                <div class="lobby-room-chat-left">
                  <div class="lobby-chat-name">컴공 단톡방</div>
                  <div class="lobby-chat-latest">감자</div>
                </div>
                <div class="lobby-room-chat-right">🔓 10 / 30</div>
              </div>
            </div>
          </div>
          <div class="lobby-create-room">
            <div id="createRoom">
              <div class="lobby-img">
                <img class="lobby-user-img" src="images/01.png" />
              </div>
              <form id="roomCreateForm" action="">
                <input
                  class="lobby-room-name"
                  id="createRoomTitle"
                  autocomplete="off"
                  placeholder="방 이름"
                />

                <input
                  class="lobby-room-name"
                  id="createRoomLimit"
                  autocomplete="off"
                  placeholder="방 인원 수 제한"
                />
                <p class="lobby-create-exp">*0명 입력시 무제한 입장</p>

                <p>
                  방 공개 여부:
                  <input
                    type="radio"
                    id="isSecret_N"
                    name="isSecret"
                    value="N"
                    checked
                  />
                  <label for="isSecret_N">공개</label>
                  <input
                    type="radio"
                    id="isSecret_Y"
                    name="isSecret"
                    value="Y"
                  />
                  <label for="isSecret_Y">비공개</label>
                </p>

                <p id="secretCodeArea" class="d-none">
                  <input
                    class="lobby-room-name"
                    id="createSecretCode"
                    autocomplete="off"
                    placeholder="비밀방 코드"
                  />
                </p>

                <button class="lobby-create-btn">create</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
