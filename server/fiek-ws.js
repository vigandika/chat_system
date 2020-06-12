'use strict'

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const debug = require('debug')('fiek-ws')
const http = require('http')
const axios = require('axios')
// importojme web sokcetin
const WebSocketNode = require('ws')
// uuid A universally unique identifier (UUID) is a 128-bit number used to identify information in computer systems
const uuid = require('uuid').v4
const request = require('request')


class FiekWs extends WebSocketNode.Server {
    
    constructor(options, callback){
        super(options, callback)

        /**@type {{[key:string]: WebSocketNode}} */
        this._clients = {};

        /**@type {{[key:string]: string[] }} 
         *  uuids - klientat qe kane subscribe
        */
        this._channels = {};
        
        /**
         * @type {{[uid:string]:name:string}}
         */
        this._names = {};
        // this.once('listening', )
    }
    
    init(){
        this.on('connection', (ws) => {
            const uid = uuid()
            this._clients[uid] = ws

            ws.on('error', (err)=>{ 
                debug('error occured on client %s:%s', uid, err.toString())
                if (ws.readyState == WebSocketNode.OPEN) ws.close(-1, err.message)
            })

            ws.on('close', (code, reason)=>{
                debug('client %s closed with code %d and reason %s', uid, code, reason)
                this._onClose(uid)
            })

            ws.on('message', (msg)=> {
                try {
                    // subscribe, unsubscribe, create topic, write to topic
                    // formati i subscribe: { cmd: 'topic:sub', topic:<topic> }
                    // formati i unsubscribe: { cmd: 'topic:unsub', topic:<topic> }
                    // create topic: { cmd: 'topic:create', topic:<topic> }
                    // payloadi munet mu kon gjithcka
                    // write to topic: { cmd: 'topic:write', topic:<topic>, payload: * }
                    const data = JSON.parse(msg.toString('utf-8'))
                    // cmd topic i kem gjithqysh edhe i eksportojme nga data
                    const {cmd} = data
                    // if (data.topic == '')
                    // { const {cmd} = data }
                    // else{
                    //     const {cmd, topic} = data}
                    switch(cmd){
                        case 'topic:init': this._names[uid] = data.name;break
                        case 'topic:sub': this._subscribeToTopic(uid, data.topic); break
                        case 'topic:unsub': this._unsubscribeToTopic(uid, data.topic); break
                        case 'topic:write': this._writeToTopic(uid, data.topic, data.payload,this._names[uid]); break
                        default: throw new Error('ERR_INVALID_CMD')
                    }

                } catch (err) {
                    // eventi, argumenti (typically kur nuk pershtatet formati i te dhenave)
                    ws.emit('error', err)
                }
            })
        })
    }

    _onClose(uid){
        // pjesa e timeoutave normalisht ish dasht mu kon
        // nese ekziston kjo
        if (this.clients[uid]){
            if(this.clients[uid].readyState === WebSocketNode.OPEN){
                this._clients[uid].close()
            }
            delete this._clients[uid]
            Object.keys(this._channels).forEach(topic => {
                // unsubscribe from topics
                this._channels[topic] = this._clients[topic].filter(x => x !== uid)
            })
        }
    }

    _createTopic(uid, topic){
        if(this._channels[topic]) throw new Error('ERR_TOPIC_EXISTS')
        // e fusim automatikisht userin aktual
        this._channels[topic] =  [uid]
        debug('client %s created topic %s', uid, topic)
    }

    _subscribeToTopic(uid, topic){
        if(!this._channels[topic]) this._createTopic(uid, topic)
        const t = this._channels[topic]
        if(!t.includes(uid)) t.push(uid)
        debug('client %s subscribed to %s', uid, topic)

    }

    _unsubscribeToTopic(uid, topic){
        let t = this._channels[topic]
        if(!t) throw new Error('ERR_INVALID_TOPIC')
        debug(t)
        this._channels[topicGIT] = t.filter(x => x!==uid)
        debug(this._channels[topic])
        debug('client %s unsubscribed to %s', uid, topic)
    }

    _writeToTopic(uid, topic, payload, name){
        const t = this._channels[topic]
        if(!t) throw new Error('ERR_INVALID_TOPIC')

        if (t.includes(uid)){
        // jo uid e serverit dhe a eshte topic writable
        const msg = JSON.stringify({from: name, topic:topic, payload})
        const msgToDB = JSON.stringify({from: name , name:topic, message:payload.msg})
        
        // var xhr = new XMLHttpRequest();
        // xhr.open('POST','https://192.168.88.40:5001/api/chathistories',true)
        // xhr.setRequestHeader('Content-Type','application/json')

    const data = JSON.stringify({
        from: name , 
        name:topic, 
        message:payload.msg})

// write data to request body

        for (const key of t) {
            debug(payload, msgToDB)
            if(payload.type == 'text'){
            
            axios.post('https://192.168.88.40:5001/api/chathistories',data)

                // req.write(data)
                // req.end()
            // xhr.send(msgToDB)
            if(key === uid) continue
            const client = this._clients[key]
            if (client && client.readyState === WebSocketNode.OPEN ){
                client.send(msg)
                debug(payload, 'sdf')
            
            }
    
        }
            // request.post(
            //     "SHKRUJE URL QITU",
            //     {json:{uid:uid,topic:t,msg:msg}},
            //     function(error,response,message){
            //         if(!error,response.statusCode=200){
            //             debug(message)
            //         }
            //     }
            // )
        }

    }
}
}

module.exports = FiekWs
