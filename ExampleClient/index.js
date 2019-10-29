questionArray = [
    ["Questions/VisualRev/0.png", "Questions/VisualRev/1.png"],
    ["Questions/VisualComp/0.png", "Questions/VisualComp/1.png"],
    ["Questions/CodeComp/0.png", "Questions/CodeComp/1.png"],
    ["Questions/CodeRev/0.png", "Questions/CodeRev/1.png"],
    ["Questions/ProseComp/0.png", "Questions/ProseComp/1.png"],
    ["Questions/ProseRev/0.png", "Questions/ProseRev/1.png"]
];
var onBreak = true;
var folderIndex = -1;
var usedFolders = [];
var imageIndex = 0;

var timerActive = false;
var qTimerActive = false;
var qTimer = null;
var myTimer = null;
var minutesLeft = 2;
var secondsLeft = 0;

const MASTER_IP = "127.0.0.1"; //INPUT SECOND PC IP ADDRESS HERE

var mSocket = new WebSocket("ws://" + MASTER_IP + ":3002");
mSocket.onopen = () => {
	sendSRecord();
}

function noClicked() {
    sendNo();
    incrementImage();
}

function yesClicked() {
    if (onBreak == true) {
        sendStart();
        document.getElementById("instructionText").innerText = "";
        document.getElementById("noButton").disabled = false;
        document.getElementById("noButton").innerText = "No";
        document.getElementById("noButton").className = "button";
        document.getElementById("yesButton").innerText = "Yes";
        if (timerActive) {
            clearInterval(myTimer);
            minutesLeft = 1;
            secondsLeft = 60;
        }
        onBreak = false;
    } else {
        sendYes();
    }
    incrementImage();
}

function incrementImage() {
    if (folderIndex == -1) {
        folderIndex = getNewFolderIndex();
        if (folderIndex == 2 || folderIndex == 3) {
            secondsLeft = 60;
        } else {
            secondsLeft = 30;
        }
        qTimer = setInterval(questionTimer, 1000);    
        qTimerActive = true; 
    } 
    else {
        imageIndex++;
        if (imageIndex >= questionArray[folderIndex].length) {
            clearInterval(qTimer);
            qTimerActive = false;
            sendStop();
            usedFolders.push(folderIndex);
            if (usedFolders.length == questionArray.length) {
                quitApplication();
            } else {
                folderIndex = getNewFolderIndex();
                imageIndex = -1;
                startBreak();
                return;
            }
        } else {
            if (qTimerActive) {
                clearInterval(qTimer);
            }
            if (folderIndex == 2 || folderIndex == 3) {
                secondsLeft = 60;
            } else {
                secondsLeft = 30;
            }
            qTimer = setInterval(questionTimer, 1000);    
            qTimerActive = true;  
        }
    }
    document.getElementById("imageQ").src = questionArray[folderIndex][imageIndex];
}

function questionTimer() {
    secondsLeft--;
    if (secondsLeft < 0) {
        noAnswer();
        incrementImage();
    } else if (secondsLeft % 10 == 0) {
        sendIntervalMark();
    }
}

function startBreak() {
    document.getElementById("imageQ").src = "null.jpg";
    document.getElementById("instructionText").style.fontSize = "xx-large"; 
    onBreak = true;
    timerActive = true;
    document.getElementById("noButton").disabled = true;
    document.getElementById("noButton").className = "disabledButton";
    document.getElementById("yesButton").innerText = "Start";
    secondsLeft = 60;
    minutesLeft = 1;
    document.getElementById("instructionText").innerText = minutesLeft + "m " + secondsLeft + "s";
    myTimer = setInterval(countDownFunc, 1000);
}

function countDownFunc() {
    secondsLeft--;
    if (secondsLeft < 0) {
        minutesLeft--;
        if (minutesLeft < 0) {
            yesClicked();
        } else {
            secondsLeft = 59;
            document.getElementById("instructionText").innerText = minutesLeft + "m " + secondsLeft + "s";
        }
    } else {
        document.getElementById("instructionText").innerText = minutesLeft + "m " + secondsLeft + "s";
    }
}

function getNewFolderIndex() {
    foundValid = false;
    newIndex = -1;
    while (!foundValid) {
        newIndex = Math.floor(Math.random() * questionArray.length);
        if (notContained(newIndex, usedFolders)) {
            foundValid = true;
            sendFolderID(newIndex);
        }
    }
    return newIndex;
}

function notContained(value, array) {
    for (index=0; index<array.length; index++) {
        if (array[index] == value) {
            return false;
        }
    }
    return true;
}

function sendFolderID(id) {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: id.toString()
    }
    mSocket.send(JSON.stringify(messageObj));
}

function sendSRecord() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "Record"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function sendIntervalMark() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "Interval"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function noAnswer() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "Timeout"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function sendNo() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "No"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function sendYes() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "Yes"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function sendStart() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "Start"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function sendStop() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "Stop"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function sendQuit() {
    messageObj = {
        time: Date.now(),
        type: "Mark",
        value: "Quit"
    }
    mSocket.send(JSON.stringify(messageObj));
}

function quitApplication() {
    sendStop();
    sendQuit();
    document.getElementById("noButton").disabled = true;
    document.getElementById("noButton").className = "disabledButton";
    document.getElementById("yesButton").disabled = true;
    document.getElementById("yesButton").className = "disabledButton";
    document.getElementById("instructionText").innerText = "Thank you for your participation";
}