// Avatar를 선택
function selAvatar(id){
  var list=document.querySelectorAll("#avata > li")
  list.forEach(element => {
    if(element.id==id){
      if(element.className=="selected"){
        element.className=""
      }else{
        element.className="selected"
      }
    }else{
      element.className=""
    }
  });

}

//선택한 Avatar의 id를 리턴, 선택하지 않은 경우 X 리턴
function checkAvatar(){
  var list=document.querySelectorAll("#avata > li")
  var retValue="X"
  list.forEach(element => {
    if(element.className=="selected"){
      retValue=element.id
    }
  });
  return retValue
}

// 로그인 시도 -> "login"을 emit
// socket.emit("login",data)
// data = {nickname,avatar}
var loginForm = document.getElementById('loginForm');
var nicknameInput = document.getElementById('nickname');
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (nicknameInput.value) {
    let val=checkAvatar()
    if(val!="X"){
      socket.emit('login',{
        nickname:nicknameInput.value,
        avatar:val        
      })
    }else{ // avatar를 선택하지 않고 submit 누른 경우
      alert("Select Avatar")
    }
  }else{ // nickname을 입력하지 않고 submit 누른 경우
    alert("Input nickname")
  }
});


// 서버로부터 로그인 결과 받음 -> "login-result"를 listen하고 lobbyArea 보여주기 및 currentArea 변경
// socket.emit("login-result",data)에 대한 listener
// data = {result: true/false, msg, rooms,nickname,img}
socket.on('login-result',(data)=>{
  if(!data.result) //로그인 실패
    alert(data.msg);
  else{ // 로그인 성공
    alert(data.msg) 
    // html의 loginArea를 감추고 lobbyArea 보여주기
    document.getElementById('loginArea').className="d-none"
    document.getElementById('lobbyArea').className=""
    currentArea="lobby"

    loginInfo=data // client단에서 자신의 nickname과 img 접근하게 하기위함

    // lobby의 active한 room list update
    // lobby_roomUpdate(data.rooms)
  }
})