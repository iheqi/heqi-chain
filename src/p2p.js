const dgram = require('dgram');
const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

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

      this.peers.push(this.seed);
    } else {
      this.remote = this.seed;
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
        // 1
        this.send({
          type: 'remoteAddress',
          data: remote
        }, remote.port, remote.address);

        // 2
        this.send({
          type: 'peerlist',
          data: this.peers
        }, remote.port, remote.address);

        // 3
        this.boardcast({
          type: 'sayhi',
          data: remote
        });

        // 4
        this.send({
          type: 'blockchain',
          data: JSON.stringify({
            blockchain: blockchain.blockchain,
            trans: blockchain.transactions
          })
        }, remote.port, remote.address);

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
        this.send({
          type: 'hi',
          data: 'Hi'
        }, remote.port, remote.address);
        break;
      }  
      case 'hi':
        console.log(`${remote.address}:${remote.port}: ${action.data}`);
        break;
      case 'blockchain': {
        let data = JSON.parse(action.data);
        this.replaceChain(data.blockchain);
        this.replaceTrans(data.trans);
        break;
      }
      case 'mine': {
        const newBlock = action.data.newBlock;
        const lastBlock = blockchain.getLastBlock();
        if (lastBlock.hash === newBlock.hash) { // 处理泛洪， 停止
          console.log('重复的消息');
          return;
        } 

        if (blockchain.isValidBlock(newBlock, lastBlock)) {
          console.log(action, action.data, action.remote);
          console.log(`[信息]：${action.data.remote.port}挖矿成功了`);
          blockchain.blockchain.push(newBlock);
          blockchain.transactions = [];
          this.boardcast({ // 泛洪
            type: 'mine',
            data: {
              newBlock,
              remote: action.data.remote
            }
          });          
        } else {
          console.log('[消息]: 区块不合法');
        }
        break;
      }

      case 'trans': { // 收到交易请求
        const trans = action.data;

        console.log('收到交易广播', blockchain.transactions.find(v => this.isEqual(v, trans)));
        if (!blockchain.transactions.find(v => this.isEqual(v, trans))) { // 处理泛洪
          console.log(`收到交易广播: ${trans.from}-${trans.to}-${trans.amount}`);
          blockchain.addTrans(trans);
          this.boardcast({
            type: 'trans',
            data: trans
          });
        }
        break;
      }
      default:
        console.log('无此action.type!');
    }
  }  
  addPeers(newPeers) {
    newPeers.forEach(peer => {
      if (!this.peers.find(val => this.isEqual(peer, val))) {
        this.peers.push(peer);
      }
    });
  }

  // isEqualPeer(p1, p2) {
  //   return p1.address === p2.address && p2.port === p2.port;
  // }

  isEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length != keys2.length) {
      return false;
    }

    return keys1.every(key => obj1[key] === obj2[key]);
  }

  boardcast(action) {
    this.peers.forEach(peer => {
      this.send(action, peer.port, peer.address);
    });
  }

  replaceChain(newChain) {
    if (newChain) {
      if (newChain.length === 1) {
        return;
      }

      if (blockchain.isValidChain(newChain) && newChain.length > blockchain.blockchain.length) {
        blockchain.blockchain = JSON.parse(JSON.stringify(newChain));
      } else {
        console.log('[错误]: 非法链');
      }
    }
  }

  replaceTrans(trans) {
    if (trans.every(v => blockchain.isValidTrans(v))) {
      blockchain.transactions = trans;
    }
  }
}


module.exports = {
  P2p,
  blockchain
};