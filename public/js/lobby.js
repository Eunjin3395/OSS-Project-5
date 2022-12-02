// 백엔드 기능 구현 테스트용 js 입니다!!

//secret 여부 클릭 시 secretCode 받는 창 띄우기
const radios = document.querySelectorAll('input[type=radio][name="isSecret"]');
radios.forEach((radio) =>
  radio.addEventListener("change", () => {
    if (radio.value == "Y") {
      document.getElementById("secretCodeArea").className = "";
    } else {
      document.getElementById("secretCodeArea").className = "d-none";
      document.getElementById("createSecretCode").value = "";
    }
  })
);

// 방 만들기 -> "create-room"을 emit
// socket.emit("create-room", data)
// data ={roomname,isSecret,secretCode,limit}
let roomCreateForm = document.getElementById("roomCreateForm");
roomCreateForm.addEventListener("submit", function (e) {
  e.preventDefault();
  let roomTitleInput = document.getElementById("createRoomTitle").value;
  let isSecretYN = document.querySelector(
    "input[type=radio][name=isSecret]:checked"
  ).value;
  let secretCode = "";
  let roomLimit = document.getElementById("createRoomLimit").value;

  if (isSecretYN == "Y") {
    // 비밀방인 경우 비밀코드 지정
    secretCode = document.getElementById("createSecretCode").value;
  }
  if (roomTitleInput == "") {
    // 방 이름 입력 안한 경우
    alert("Enter room title");
    return;
  }
  if (isSecretYN == "Y" && secretCode == "") {
    //비밀방으로 한다고 했는데 비밀코드 입력 안한 경우
    alert("Enter secret code");
    return;
  }
  if (roomLimit > 25 || roomLimit < 1) {
    // 인원제한의 입력 정상적인지 체크
    alert("Enter valid room limit (0~99)");
    return;
  }

  // 모든 입력 정상적인 경우, 서버로 data 전송
  socket.emit("create-room", {
    roomname: roomTitleInput,
    isSecret: isSecretYN,
    secretCode: secretCode,
    limit: roomLimit,
  });



// 방 생성 결과 & 방 입장 -> "room-create-result"를 listen하고 room_in 호출
// socket.emit("room-create-result",data)에 대한 listener
// data = {roomname,result,msg}
socket.on("room-create-result", (data) => {
  if (data.result) {
    // 방 생성 성공 시 room_in 함수 호출
    alert(data.msg);
    // 방장이 방 생성 후 바로 입장하므로 limit과 비밀코드 체크하지 않고 room_in 호출
    //room_in(data.roomname); // -> 해당 roomname을 가진 방으로 유저를 입장시키는 함수
  } else {
    // 방 생성 실패
    alert(data.msg);
  }
});
});