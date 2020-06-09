// const { write } = require("fs")

// const render
const renderChatMsg = (from, msg) => {
  // per me qit From: permi chat nese nuk e ke shkrujt msg ti
  const innerHtml = from ? `<div>From ${from}:</div><div>${msg}</div>` : msg
  const html = `
  <div class="w-100">
    <div class="chat-msg ${from ? 'chat-msg-other' : ''}">
    ${innerHtml}
    </div>
  </div>`

  $('.chat-body').append(html)
}

const renderVideoFrame = (from, data) => {
  let imgElement = document.getElementById(from)
  if (!imgElement) {
    $('.chat-video-container').append(`<img class="chat-video" id="${from}"/>`)
    imgElement = document.getElementById(from)
  }
  imgElement.src = data
}

const FPS = 60 // 60 fps
// kur transferoni video ne web socketa shkon ni transfer i nsnapshotave jo video format, (jpeg t kompresum) edhe caktohen sa frame per sekond doni mi transferu

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
  navigator.getUserMedia =  navigator.getUserMedia ||  navigator.webkitGetUserMedia ||  navigator.mozGetUserMedia ||   navigator.msgGetUserMedia

  if (navigator.getUserMedia) {
    // callback on success
    // navigator.getUserMedia({video: true, audio: true},
    navigator.getUserMedia(
      { video: true },
      stream => {
        // per me attach streamin te video
        video.srcObject = stream
        const $topic = $('#topic-txt')
        // tash e bojme output video e shfaqim sa here t kem frames
        recInterval = setInterval(() => {
          context.drawImage(video, 0, 0, context.width, context.height)
          const topic = $topic.val()
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



// PART 1

// funksionaliteti per me shkru ne web socket
let ws = null

// request object instantioation
const Http = new XMLHttpRequest()
const url = 'https://localhost:44379/api/chathistories'

// metode ndihmese
const isWsOpen = () => {
  return ws && ws.readyState === WebSocket.OPEN
}

let loadChatHistory = (topicId) => {
  Http.open('GET', `https://localhost:44379/api/chathistories/movieId/${topicId}`)
  Http.send()
  Http.onreadystatechange = e => {
    chat_history = Http.responseText
    // console.log(Http.responseText)
  }

    data = [
    { from: '3', msg: 'ckemi' },
    { from: '1', msg: 'ckemi' },
    { from: '1', msg: 'ckemi' },
    { from: '5', msg: 'ckemi' },
    { from: '1', msg: 'ckemi' }
  ]
  for (let index = 0; index < data.length; index++) {
    renderChatMsg(data[index].from, data[index].msg)
  }
  
}

// havera t backendit 
// me juve i kom tri kerkes
// kom me ja u qu ni get request me mi pru filmat edhe id-t e tyne
// kom me ja u qu ni get request me e marr chatin historyn per ni topic t caktum https://localhost:44379/api/chathistories/movieId/?
// kom me ju u qu post requesta sikur 
// {
//       'topic': int(topicid),
//       'from': string(uid),
//       'msg': string(msg)
// }

let movies = null




const openWs = () => {
  if (isWsOpen()) return

  // socketi hapet ne momentin e instancimit
  ws = new WebSocket('ws://127.0.0.1:7070')
  // ws = new WebSocket('ws://192.168.0.247:7070')


  // get movies and from db
  
  Http.open('GET', 'url to movies')
  Http.send()
  Http.onreadystatechange = e => {
    movies = Http.responseText
    // console.log(Http.responseText)
  }

  movies = {id:1, movie: 'borebardha'}
  
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const element = object[key];
      
    }
  }
  console.log(movies.sd, movies[sd])
  // Http.open('GET', url)
  // Http.send()
  // // anonymous function that handles asynchron. requests (see https://stackoverflow.com/questions/247483/http-get-request-in-javascript)
  // Http.onreadystatechange = e => {
  //   console.log(Http.responseText)
  // }
  ws.addEventListener('open', onWsOpen)
  ws.addEventListener('close', onWsClose)
  ws.addEventListener('error', onWsError)
  ws.addEventListener('message', onWsMessage)
}

// recreate ws.addEventlistener('open', )  and see cka pranon funksion
const onWsOpen = event => {
  console.log('ws connected to server')
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
    const { from, topic, payload } = data
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

//helper

const wsSubscribeToTopic = topic => {
  if (!isWsOpen()) {
    alert('WS is not open')
    return
  }

  // get chat history for topic



  if (!topic) return
  $(".chat-body").empty();

  const data = JSON.stringify({ cmd: 'topic:sub', topic: topic })
  ws.send(data)

  loadChatHistory(topic.id)
}

const wsUnsubscribeToTopic = topic => {
  if (!isWsOpen()) {
    alert('WS is not open')
    return
  }
  $(".chat-body").empty();

  if (!topic) return
  const data = JSON.stringify({ cmd: 'topic:unsub', topic: topic })
  ws.send(data)
}

const wsCreateToTopic = topic => {
  if (!isWsOpen()) {
    alert('WS is not open')
    return
  }
  $(".chat-body").empty();

  if (!topic) return
  const data = JSON.stringify({ cmd: 'topic:create', topic: topic })
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
  })
  ws.send(data)
}

// duhet mi bind qito funksionalitete

$(document).ready(() => {
  $('#msg-form').submit(ev => {
    ev.preventDefaul()
    ev.stopPropagation()
  })

  $('#topic-form').submit(ev => {
    ev.preventDefaul()
    ev.stopPropagation()
  })

  $('#ws-connect').click(() => {
    openWs()
  })

  $('#ws-create').click(() => {
    const topic = $('#topic-txt').val()
    wsCreateToTopic(topic)
  })

  $('#ws-sub').click(() => {
    const topic = $('#topic-txt').val()
    wsSubscribeToTopic(topic)
  })

  $('#ws-unsub').click(() => {
    const topic = $('#topic-txt').val()
    wsUnsubscribeToTopic(topic)
  })

  $('#send-msg').click(() => {
    const topic = $('#topic-txt').val()
    const msg = $('#msg-text').val()
    if (!topic || !msg) return

    wsWriteToTopic(topic, { type: 'text', msg })
    renderChatMsg(null, msg)
  })

  $('#send-video').click(() => {
    openCam()
  })
})
