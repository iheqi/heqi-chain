const dgram = require('dgram');

class P2p {
  constructor() {
    this.peers = [];
    this.seed = { port: 8001, address: 'localhost' };
    this.udp = dgram.createSocket('udp4');
  }

  init() {
    this.bindP2p();
    this.bindExit();
  }

  bindP2p() {
    this.udp.on('message', (msg, rinfo) => {
      console.log(`服务器收到：${msg} 来自 ${rinfo.port}`);
      const action = JSON.parse(msg);

      if (action.type) {
        this.dispatch(action, rinfo);
      }
    });

    this.udp.on('listening', () => {
      const address = this.udp.address();
      console.log(`服务器监听 ${address.address}: ${address.port}`);
    });   
    
    const port = Number(process.argv[2] || 0);
    this.startNode(port);
  }

  startNode(port) {
    this.udp.bind(port);

    if (port !== 8001) {
      this.send({
        type: 'newpeer'
      }, this.seed.port, this.seed.address);
    }
  }

  send(msg, port, address) {
    this.udp.send(JSON.stringify(msg), port, address);
  }

  bindExit() {
    process.on('exit', () => {
      console.log('[信息]：网络一线牵，珍惜这段缘，再见！');
    });
  }

  dispatch(action, remote) {
    switch (action.type) {
      case 'newpeer':
        console.log('你好，新朋友！');
        break;
      default:
        console.log('无此action.type!');
    }
  }  
}


module.exports = P2p;