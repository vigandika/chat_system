const http = require('http')

const data = JSON.stringify({
    uid: 'uid',
    topic: 'topic',
    msg: msg
})
const options = {
    hostname:'127.0.0.1',
    port: 80,
    path: '/path qitu ?',
    method: 'POST',
    headers:{
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}

const req = http.request(options,(res)=>{
    debug(`statusCode: ${res.statusCode}`)
    res.setEncoding('utf-8')

    res.on('data',(chunk)=>{
        debug(d)
    })
    res.on('end',()=>{
        debug('No more data in response')
    })
})
req.on('error',(err)=>{
    debug(err)
})
// write data to request body
req.write(data)
req.end()