const dgram = require('dgram');

class P2p {
  constructor() {
    this.peers = [];
    this.seed = { port: 8001, address: 'localhost' };
    this.udp = dgram.createSocket('udp4');
    this.remote = {};
  }

  init() {
    this.bindP2p();
    this.bindExit();
  }

  bindP2p() {
    this.udp.on('message', (msg, remote) => {
      console.log(`${remote.address}:${remote.port}: ${msg}`);
      const action = JSON.parse(msg);

      if (action.type) {
        this.dispatch(action, remote);  
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
        type: 'newpeer',
        data: 'Hi,种子,我是新节点！'
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
      case 'newpeer': {
        this.send({
          type: 'remoteAddress',
          data: remote
        }, remote.port, remote.address);

        this.send({
          type: 'peerlist',
          data: this.peers
        }, remote.port, remote.address);

        this.boardcast({
          type: 'sayhi',
          data: remote
        });

        this.peers.push(remote);
        break;
      }
      case 'remoteAddress': { // 新节点得到种子节点告诉的ip和端口
        this.remote = action.data;
        break;
      }
      case 'peerlist': {
        const newPeers = action.data;
        this.addPeers(newPeers);
        break;
      }
      case 'sayhi': {
        const remote = action.data;
        this.peers.push(remote);
        // console.log(`我是${this.remote.address}:${this.remote.port},欢迎新节点!`);
        this.send({
          type: 'hi'
        }, remote.port, remote.address);
        break;
      }  
      case 'hi':
        console.log(`${remote.address}:${remote.port}: Hi`);
        break;
      default:
        console.log('无此action.type!');
    }
  }  

  addPeers(newPeers) {
    newPeers.forEach(peer => {
      if (!this.peers.find(val => this.isEqualPeer(peer, val))) {
        this.peers.push(peer);
      }
    });
  }

  isEqualPeer(p1, p2) {
    return p1.address === p2.address && p2.port === p2.port;
  }

  boardcast(action) {
    this.peers.forEach(peer => {
      this.send(action, peer.port, peer.address);
    });
  }
}


module.exports = P2p;