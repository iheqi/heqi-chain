const dgram = require('dgram');
const udp = dgram.createSocket('udp4');

udp.on('error', (err) => {
  console.log(`服务器异常：\n${err.stack}`);
});

udp.on('message', (msg, rinfo) => {
  console.log(`服务器收到：${msg} 来自 ${rinfo.port}`);
});

udp.on('listening', () => {
  const address = udp.address();
  console.log(`服务器监听 ${address.address}: ${address.port}`);
});

udp.bind(8002);

function send(msg, port, host) {
  console.log('send message: ', msg, port, host);
  udp.send(Buffer.from(msg), port, host);
}

const port = Number(process.argv[2]);
const host = process.argv[3];

if (port && host) {
  send('你好！', port, host);
}

// console.log(process.argv);
