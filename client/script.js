// funksionaliteti per me shkru ne web socket
let ws = null

// request object instantioation
// const url = 'https://localhost:44379/api/chathistories'

// metode ndihmese
const isWsOpen = () => {
  return ws && ws.readyState === WebSocket.OPEN
}

let loadChatHistory = (movie_name) => {

  let got_chat_response = false

  const chat_req = new XMLHttpRequest()
  // Get chat history by movie name
  chat_req.open('GET',`https://172.0.4.18:5001/api/chathistories/movies/${movie_name}`,true)
  chat_req.onreadystatechange = e =>{
    chat_history = JSON.parse(chat_req.responseText.toString('utf-8'))
    if (!got_chat_response){
    for (let index = 0; index < chat_history.length; index++) {
      renderChatMsg(chat_history[index].from, chat_history[index].message)
    } 
    got_chat_response = !got_chat_response 
    }
  }
  chat_req.send()
}



let movies = null


const openWs = () => {
  if (isWsOpen()) return

  // socketi hapet ne momentin e instancimit
  ws = new WebSocket('ws://172.0.1.152:7070')
  data = [
    { from: '3', msg: 'ckemi' },
    { from: '1', msg: 'ckemi' },
    { from: '1', msg: 'ckemi' },
    { from: '5', msg: 'ckemi' },
    { from: '7', msg: 'ckemi' }
  ]
  
  

  const Http = new XMLHttpRequest()

  


  let movies = null

  got_movies_response = false


  Http.open('GET', 'https://172.0.4.18:5001/api/movies')
  Http.onreadystatechange = e => {
    movies = JSON.parse(Http.responseText.toString('utf-8'))
    movie_and_id = {}
    if (!got_movies_response){
    for (let index = 0; index < movies.length; index++) {
      renderDropdownList(movies[index].name)

    }
    got_movies_response = true

  }
}
  Http.send()

  ws.addEventListener('open', onWsOpen)
  ws.addEventListener('close', onWsClose)
  ws.addEventListener('error', onWsError)
  ws.addEventListener('message', onWsMessage)
}

// recreate ws.addEventlistener('open', )  and see cka pranon funksion
const onWsOpen = event => {
  console.log('ws connected to server')
  var name = prompt("Jepe emrin ?")
  const data = JSON.stringify({ cmd: 'topic:init', name: name })

  ws.send(data)

}

const onWsClose = event => {
  alert(`ws connection closed with cod)e ${event.reason} and code ${event.code}`)

  ws.removeEventListener('open', onWsOpen)
  ws.removeEventListener('close', onWsClose)
  ws.removeEventListener('error', onWsError)
  ws.removeEventListener('message', onWsMessage)
}

const onWsError = ev => {
  console.error('ws error', ev)
}

const onWsMessage = ev => {
  try {
    const data = JSON.parse(ev.data.toString('utf-8'))
    const { from, topic, payload } = data // from = {123:'hej}
    // switch (topic) {
    // case 'chat':
    const { type, msg } = payload
    switch (type) {
      case 'text':
        renderChatMsg(from, msg)
        break
      case 'video':
        renderVideoFrame(from, msg)
        break
    }
    // break
    // }
  } catch (error) {
    console.error(error)
  }
}





// Communication with Server
const wsSubscribeToTopic = topic => {
  if (!isWsOpen()) {
    alert('WS is not open')
    return
  }

  // get chat history for topic



  if (!topic) return
  $(".chat-body").empty();

  const data = JSON.stringify({ cmd: 'topic:sub', topic: topic })
  loadChatHistory(topic)
  ws.send(data)

  // loadChatHistory(topic.id)
}

const wsUnsubscribeToTopic = topic => {
  if (!isWsOpen()) {
    alert('WS is not open')
    return
  }
  $(".chat-body").empty();

  if (!topic) return
  const data = JSON.stringify({ cmd: 'topic:unsub', topic: topic })
  console.log(data)
  ws.send(data)
}

const wsWriteToTopic = (topic, payload) => {
  if (!isWsOpen()) {
    alert('WS is not open')
    return
  }
  if (!topic || !payload) return
  const data = JSON.stringify({
    cmd: 'topic:write',
    topic: topic,
    payload: payload
    // movieId: movie_and_id[topic]
  })
  ws.send(data)
  $('#msg-text').val("")

}



// Binding Events

$(document).ready(() => {
  $('#msg-form').submit(ev => {
    ev.preventDefault()
    ev.stopPropagation()
  })

  $('#topic-form').submit(ev => {
    ev.preventDefault()
    ev.stopPropagation()
  })

  $('#ws-connect').click(() => {
    openWs()
  })

  $('#ws-sub').click(() => {
    const topic = $('#ws-create').find(":selected").text()
    // const topic = $('#topic-txt').val()
    wsSubscribeToTopic(topic)
  })

  $('#ws-unsub').click(() => {
    const topic = $('#ws-create').find(":selected").text()
    wsUnsubscribeToTopic(topic)
  })

  $('#send-msg').click(() => {
    const topic = $('#ws-create').find(":selected").text()
    const msg = $('#msg-text').val()
    if (!topic || !msg) return

    wsWriteToTopic(topic, { type: 'text', msg })
    renderChatMsg(null, msg)

  })

  $('#send-video').click(() => {
    videoRecording = !videoRecording
    openCam()
  })
  $('#msg-text').keypress(function (e) {
    if (e.which == 13) {
      $("#send-msg").click();
    }
  });
})



// rendering 


const renderDropdownList = (movies) => {
    const html = `<option value = ${movies}>${movies}</option>`
    $('#ws-create').append(html)
  }





// const render
const renderChatMsg = (from, msg) => {
  // per me qit From: permi chat nese nuk e ke shkrujt msg ti
  const innerHtml = from ? `<div>From ${from}:</div><div>${msg}</div>` : msg
  const html = `
  <div class="w-100", id='messages'>
    <div class="chat-msg ${from ? '' : 'chat-msg-you'}">
    ${innerHtml}
    </div>
  </div>`

  $('.chat-body').append(html)
  $('.chat-body').scrollTop($('.chat-body')[0].scrollHeight)

}

const renderVideoFrame = (from, data) => {
  let imgElement = document.getElementById(from)
  if (!imgElement) {
    $('.chat-video-container').append(`<img class="chat-video" id="${from}"/>`)
    imgElement = document.getElementById(from)
  }
  imgElement.src = data
}

const FPS = 120

// dy diva t njejte, video dergohet te klienti tjeter kurse canvasi osht self cam
const video = document.getElementById('chat-video-src')
// ne canvas shfaqen frames
const canvas = document.getElementById('self-cam')
const context = canvas.getContext('2d')
context.height = canvas.height
context.width = canvas.width
let recInterval = null
let videoRecording = false

const openCam = () => {
  if (videoRecording) return
  if (!isWsOpen()) alert('ws is not open')
  //navigator property e browserit
  // njona prej ktyne bon        default              chrome dhe safari                    mozilla                         microsoft edge
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia

  if (navigator.getUserMedia) {
    // callback on success
    navigator.getUserMedia(
      { video: true },
      stream => {
        // per me attach streamin te video
        video.srcObject = stream
        if(!videoRecording) stream.getTracks().forEach(track => track.stop())
        const $topic = $('#topic-txt')
        // tash e bojme output video e shfaqim sa here t kem frames
        recInterval = setInterval(() => {
          context.drawImage(video, 0, 0, context.width, context.height)
          const topic = $('#ws-create').find(":selected").text()
          if (topic) {
            const msg = canvas.toDataURL('image/jpeg', 1) // take snapshot from canvas as jpeg
            wsWriteToTopic(topic, { type: 'video', msg })
          }
        }, FPS)
      },
      err => {
        console.error(err)
      }
    )
  }
}
