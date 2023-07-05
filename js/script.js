const config = {
    mode: 'rtc',
    codec: 'vp8'
}

// const options = {
//     appId: '7aed4c69656b47c4a98c2f7d19e18678',
//     channel: 'Health',
//     token: null,

// }

function getUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (let [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  }
  
  const params = getUrlParams();
  const options = {
    appId: params.appid || '7aed4c69656b47c4a98c2f7d19e18678',
    channel: params.channel || 'health-5xi5l9iy',
    token: params.token || null
  };
  
 
  

const rtc = {
    client: null,
    localVideoTrack: null,
    localAudioTrack: null,
}

const btnCam = $('#btnCam');
const btnMic = $('#btnMic');
const btnPlug = $('#btnPlug');
const remote = $('#remote');
const local = $('#local');
let hour = 00;
let minute = 00;
let seconds = 00;
let totalSeconds = 00;



let intervalId = null;
const zeroPad = (num, places) => String(num).padStart(places, '0')

function startTimer() {
  ++totalSeconds;
  hour = Math.floor(totalSeconds /3600);
  minute = Math.floor((totalSeconds - hour*3600)/60);
  seconds = totalSeconds - (hour*3600 + minute*60);

  document.getElementById("hour").innerHTML = zeroPad(hour, 2);
  document.getElementById("minute").innerHTML = zeroPad(minute, 2);
  document.getElementById("seconds").innerHTML = zeroPad(seconds, 2);
}

const join = async() => {
    totalSeconds = 0;
    document.getElementById("hour").innerHTML = '00';
    document.getElementById("minute").innerHTML = '00';
    document.getElementById("seconds").innerHTML = '00';
    intervalId = setInterval(startTimer, 1000);
    rtc.client = AgoraRTC.createClient(config);
    await rtc.client.join(options.appId, options.channel, options.token || null);
}

async function startOneToOneVideoCall() {
    join().then(() => {
      
        startAudio();
        startVideo();
        initiateRTM()
        rtc.client.on('user-published', async(user, mediaType) => {
           
            if (rtc.client._users.length > 1) {
                rtc.client.leave();
                remote.html('<div class="roomMessage"><p class="full">Please Wait Room is Full</p></div>');
                return;
            } else {
                remote.html('');
            }

            await rtc.client.subscribe(user, mediaType);
           
           
            if (mediaType === 'video') {
                const remoteVideoTrack = user.videoTrack;
                remoteVideoTrack.play('remote');


            }
            if (mediaType === 'audio') {
                const remoteAudioTrack = user.audioTrack;
                remoteAudioTrack.play()
            }
          
        });
    });
}


const startVideo = async() => {
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    rtc.client.publish(rtc.localVideoTrack);
    rtc.localVideoTrack.play('local');
}

const startAudio = async() => {
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.client.publish(rtc.localAudioTrack);
    rtc.localAudioTrack.play();
    
}

const stopVideo = () => {
    rtc.localVideoTrack.close();
    rtc.localVideoTrack.stop();
    rtc.client.unpublish(rtc.localVideoTrack);
}

const stopAudio = () => {
    rtc.localAudioTrack.close();
    rtc.localAudioTrack.stop();
    rtc.client.unpublish(rtc.localAudioTrack);
}


//Toggle Camera

// btnCam.click(function() {
//     if ($(this).hasClass('fa-video-camera')) {
//         $(this).addClass('fa-video-slash');
//         $(this).removeClass('fa-video-camera');
//         $(this).css('color', 'red');
//         stopVideo();

//     } else {
//         $(this).addClass('fa-video-camera');
//         $(this).removeClass('fa-video-slash');
//         $(this).css('color', 'black');
//         startVideo();

//     }
// });
btnCam.click(function() {
    if ($(this).hasClass('camera')) {
        $(this).addClass('cameraoff');
        $(this).removeClass('camera');
        $(this).css('color', 'red');
        stopVideo();

    } else {
        $(this).addClass('camera');
        $(this).removeClass('cameraoff');
        $(this).css('color', 'black');
        startVideo();

    }
});
//Toggle Microphone
// btnMic.click(function() {
//     if ($(this).hasClass('fa-microphone')) {
//         $(this).addClass('fa-microphone-slash');
//         $(this).removeClass('fa-microphone');
//         $(this).css('color', 'red');
//         stopAudio()

//     } else {
//         $(this).addClass('fa-microphone');
//         $(this).removeClass('fa-microphone-slash');
//         $(this).css('color', 'black');
//         startAudio();


//     }
// });
btnMic.click(function() {
    if ($(this).hasClass('mic')) {
        $(this).addClass('micoff');
        $(this).removeClass('mic');
        $(this).css('color', 'red');
        stopAudio()

    } else {
        $(this).addClass('mic');
        $(this).removeClass('micoff');
        $(this).css('color', 'black');
        startAudio();


    }
});

//Toggle Join and Leave

// btnPlug.click(function() {
//     if ($(this).hasClass('fas fa-plug')) {
//         $(this).addClass('fa-window-close');
//         $(this).removeClass('fas fa-plug');
//         $(this).css('color', 'red');
//         startOneToOneVideoCall();
//     } else {
//         $(this).addClass('fas fa-plug');
//         $(this).removeClass('fa-window-close');
//         $(this).css('color', 'black');

//         rtc.client.leave();
//         stopVideo();
//         stopAudio();
//     }
// });

btnPlug.click(function() {
    if ($(this).hasClass('call')) {
        $(this).addClass('endcall');
        $(this).removeClass('call');
        $(this).css('color', 'red');
        startOneToOneVideoCall();
    } else {
        $(this).addClass('call');
        $(this).removeClass('endcall');
        $(this).css('color', 'black');
        if (intervalId) {
            clearInterval(intervalId);
          }
        rtc.client.leave();
        stopVideo();
        stopAudio();
    }
});

let appID='05eaabbb774c4979a396833befd13e85'
let uid=String(Math.floor(Math.random()*232))
let token=null
let channelName='main'
let initiateRTM=async()=>{
    let client=await AgoraRTM.createInstance(appID)
    await client.login({uid,token})
    const channel=await client.createChannel(channelName)
    await channel.join()
    let form=document.getElementById('form')
    form.addEventListener('submit',async(e)=>{
        e.preventDefault()
        let message=e.target.message.value
        await channel.sendMessage({text:message,type:'text'})
        form.reset()
        handleMessage({text:message})
    })
    channel.on('ChannelMessage',(message,peerId)=>{
        // console.log('Message:',message)
        // handleMessage(message)
        handleMessage({ text: message.text, peerId });
    })
}
let handleMessage=async(message)=>{
    let messages=document.getElementById('messages')
    let user=document.getElementById('user')
   
    // let messageElement=`<p>${message.text}</p>`
    let messageElement = `<p> ${message.text} </p>`;
    let messageElement2 = `<p>User ${message.peerId}</p>`;
    user.insertAdjacentHTML('beforeend',messageElement2)
    messages.insertAdjacentHTML('beforeend',messageElement)
  
   
}
 // Track the users whose user ID has been displayed

 
 


