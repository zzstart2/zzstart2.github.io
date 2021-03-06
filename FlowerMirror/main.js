$(function(){
  $.oPageLoader();
});

var pointID = 0;//初始化生成小花朵的ID
var magicFlag = 1;//初始化花神的flag，0为红，1为蓝
var score = 0;//统计玩家得分
var gameEnd = 0;//游戏结束flag，1表示已结束
var speed = 800;
var movespeed = 20;
var messageList = $('#messages');
var numofPlayed = 0;
var sh;

var mid=new Array();
mid[1] = "piano/raw/c4.ogg";
mid[2] = "piano/raw/e4.ogg";
mid[3] = "piano/raw/g4.ogg";
mid[4] = "piano/raw/c5.ogg";

var messagesRef = new Firebase('https://flowermirror.firebaseio.com/');
var messageField = $('#score');

var userID = Math.round(1000*Math.random());
var localusername = "Kid"+userID;
document.getElementById("loginNameInput").setAttribute("value", localusername);

function init(){
  pointID = 0;
  score = 0;
  gameEnd = 1;
  speed = 800;
  movespeed = 20;
  document.getElementById("score").setAttribute("value", "0 点");
};

$("#plus").slideUp();

function begin(){
  gameEnd = 0;
  sh = window.setInterval(function createPoint(){
  if(gameEnd === 0){
    var smallPoint = document.createElement("div");
    smallPoint.setAttribute("class", "smallPoint");

    //随机一种花的颜色
    var pointType = Math.round(Math.random());
    if(pointType === 0){
      //console.log("000"+pointType);
      smallPoint.setAttribute("typeID", "0");
      smallPoint.id="pointRed";
    }else{
      //console.log(pointType);
      smallPoint.setAttribute("typeID", "1");
      smallPoint.id="pointBlue";
    };

    //将花朵随机放置在外围圆圈上
    var x;
    var y;
    var angle = 2*Math.PI*Math.random();
    x = $("#outerCircle").offset().left + 300 + 250*(Math.cos(angle));
    y = $("#outerCircle").offset().top + 300 + 250*(Math.sin(angle));
    //console.log(x);
    //console.log(y);

    $(".outerCircle").append(smallPoint);
    smallPoint.style.left = (x - 15) + "px";
    smallPoint.style.top = (y - 15) + "px";

    if(movespeed > 3){
      movespeed = movespeed-(score/20);
    }

    //控制花朵运动向中心
    var pointsh = window.setInterval(function(){
      if(gameEnd === 0){
        distance2 = getDistanceToCenter(x, y, 30, 30);
        if(distance2 > 800){
          x-=2*Math.cos(angle);
          y-=2*Math.sin(angle);
          smallPoint.style.left = (x - 15) + "px";
          smallPoint.style.top = (y - 15) + "px";
        }else{//到达中心后判断是否终止游戏
          if(smallPoint.getAttribute("typeID") === ""+magicFlag){//得分
            score ++;
            document.getElementById("score").setAttribute("value", score+" 点");
            //console.log(score);
            pointID ++;
            smallPoint.setAttribute("typeID", "2");
          }
          else if(smallPoint.getAttribute("typeID") === "0" || smallPoint.getAttribute("typeID") === "1"){//游戏终止
            pointID ++;
            smallPoint.setAttribute("typeID", "2");
            alert("游戏结束，你获得了"+score+"点花缘。成绩已经上传~~");
            var message = messageField.val();
            messagesRef.push({name:localusername, score:message});
            init();
            sh = window.clearInterval(sh);
            function giveResult(){
              var base = document.createElement("div");
              base.setAttribute("class", "signinBase");
              base.id = "resultBase";
              $(".mainbody").append(base);
            };
          }
          smallPoint.remove();
          pointsh = window.clearInterval(pointsh);
        }
      }else{
        smallPoint.remove();
        pointsh = clearInterval(pointsh);
      }
    }, movespeed);
  }
}, speed);
};

function getDistanceToCenter(x, y, dx, dy){
  var cx = x + dx/2 - $("#outerCircle").offset().left;
  var cy = y + dy/2 - $("#outerCircle").offset().top;
  var distance2 = (cx - 315)*(cx - 315) + (cy - 315)*(cy - 315);
  return distance2;
};

$("#start").on('click', function(e){
  gameEnd = 0;
  $('#signinBase').remove();
  sh = window.clearInterval(sh);
  begin();
});

$("#plus").on('click', function(e){
  $(".leftbar").slideDown();
  $("#plus").slideUp();
});

$(".scorePic").on('click', function(e){
  $(".leftbar").slideUp();
  $("#plus").slideDown();
});

$("#startButton").on('click', function(e){
  gameEnd = 0;
  localusername = $("#loginNameInput").val();
  begin();
  $('#signinBase').remove();
});

$(document).keypress(function (e){
  console.log(e.keyCode);
  if (e.keyCode === 115){
    console.log("space");
    if(magicFlag === 0){
      magicFlag = 1;
      $(".centerCircle").css({"background-image": "url(src/centerCircleBlue.png)"});
    }else if(magicFlag === 1){
      magicFlag = 0;
      $(".centerCircle").css({"background-image": "url(src/centerCircleRed.png)"});
    }
  }
});

messagesRef.on("value", function(snapshot) {
}, function (errorObject) {
  alert("The read failed: " + errorObject.code);
});

messagesRef.limitToLast(15).on('child_added', function (snapshot) {
  //GET DATA
  var data = snapshot.val();
  var username = data.name || "anonymous";
  var message = data.score;

  //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
  var messageElement = $("<li>");
  var nameElement = $("<strong></strong>");
  nameElement.text(username+"  ");
  messageElement.text(message).prepend(nameElement);

  //ADD MESSAGE
  messageList.append(messageElement);

  //SCROLL TO BOTTOM OF MESSAGE LIST
  messageList[0].scrollTop = messageList[0].scrollHeight;
  changeHeight();
});

setTimeout("changeHeight()",5);

function changeHeight(){
  var beforeHeight = $("#messages").scrollTop();
  $("#messages").scrollTop($("#messages").scrollTop()+20);
  var afterHeight = $("#messages").scrollTop();
  if(beforeHeight == afterHeight){
    //alert("ok");
  }else{
    setTimeout("changeHeight()",5);
  };
};
