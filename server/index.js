'use strict'


const debug = require('debug')('fiek-ws')
const yargs = require('yargs')
    .alias('p', 'port')
    .alias('h', 'host')
    .option('port', {type: 'number', required: true}) // argumentet qe don mi marr nga cli
    .option('host', {type: 'string', required: true})
    .argv // mi lidh argumentet ne objekt

const FiekWs = require('./fiek-ws')

// destrukto argumentet
const {port, host} = yargs 
const server = new FiekWs({port:port, host:host})

server.on('listening', () => {
    // me inicializu funksionalitetin masi t hapet serveri
    server.init()
    debug('WS server started listening on host: %s on port %d', host, port)
})


// tcp connection
// topics mu nda
// 