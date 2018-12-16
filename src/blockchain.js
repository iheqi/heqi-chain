const crypto = require('crypto');
const rsa = require('./rsa');
const dgram = require('dgram');

const initBlock = {
  index: 0,
  data: 'Hello heqi-chain!', 
  prevHash: '0',
  timestamp: 1544792455313,
  nonce: 4250,
  hash: '00049946ecd84533d70ae601208c45aebcc0f6ef19482e55b46f131ddb1693f1'
}

// class Block {
// 	constructor(timestamp, transactions, previousHash = '') {
// 		this.previousHash = previousHash;
// 		this.timestamp = timestamp;
// 		this.transactions = transactions;
// 		this.nonce = 0;
// 		this.hash = this.calculateHash();
//   }
// }

class Blockchain {
  constructor () {
    this.blockchain = [initBlock];
    this.data = []; // pendingTransactions
    this.difficulty = 3;
    // const hash = this.computedHash(0, '0', Date.now(), 'Hello heqi-chain!', 1);

    this.peers = [];
    this.seed = { port: 8001, address: 'localhost' };
    this.udp = dgram.createSocket('udp4');
    this.init();
  }

  init() {
    this.bindP2p();
    this.bindExit();
  }

  bindP2p() {
    this.udp.on('message', (msg) => {

    });
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


  getLastBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  transfer(from, to, amount) {
    if (from !== '0') {
      const blance = this.getBalanceOfAddress(from);
      if (blance < amount) {
        console.log('not enough', from, blance, amount);
        return false;
      }
    }
    const transObj = { from, to, amount };
    const sig = rsa.sign(transObj);
    transObj.sig = sig;
    this.data.push(transObj);
    return transObj;
  }

  isVaildTrans(trans) {
    return rsa.verify(trans, trans.from)
  }

  mine(miningRewardAddress) {
    const newBlock = this.generateNewBlock();

    // if (!this.data.every(val => isVaildTrans(val))) {
    //   return false;
    // }

    this.data = this.data.filter(val => isVaildTrans(val)); // 过滤不合法的2

    if (this.isVaildBlock(newBlock) && this.isVaildChain()) {
      this.blockchain.push(newBlock);
      this.data = [];
      this.transfer('0', miningRewardAddress, 20); // 矿工奖励,视频是先加奖励了再清空，错了
      return newBlock;
    } else {
      console.log('error, invalid block.');
    }
  }
	getBalanceOfAddress(address) { // 查询余额
		let blance = 0;
		for (var i = 0; i < this.blockchain.length; i++) {
      const block = this.blockchain[i];
			for (const trans of block.data) {
				if (address === trans.to) {
					blance += trans.amount;
				}				
				if (address === trans.from) {
					blance -= trans.amount;
				}
			}
		}
		return blance;
	}
  generateNewBlock() {
    let nonce = 0;
    const index = this.blockchain.length;
    const data = this.data;
    const prevHash = this.getLastBlock().hash;
    const timestamp = Date.now();
    let hash = this.computedHash(index, prevHash, timestamp, data, nonce);

    while (hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      nonce++;
      hash = this.computedHash(index, prevHash, timestamp, data, nonce);
    }

    return {
      hash,
      nonce,
      timestamp,
      prevHash,
      data,
      index
    }
  }

  computedHashForBlock({index, prevHash, timestamp, data, nonce}) {
    return this.computedHash(index, prevHash, timestamp, data, nonce);
  }

  computedHash(index, prevHash, timestamp, data, nonce) {
    return crypto.createHash('sha256')
                 .update(index + prevHash + timestamp + data + nonce)
                 .digest('hex');
  }

  isVaildBlock(newBlock, lastBlock=this.getLastBlock()) { // 这里还要验证？fuck，本来就是这样来的
    if (newBlock.index !== lastBlock.index + 1 ||
        newBlock.timestamp <= lastBlock.timestamp ||
        newBlock.prevHash !== lastBlock.hash ||
        newBlock.hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty) ||
        newBlock.hash !== this.computedHashForBlock(newBlock)
    ) {
      return false;
    }
    return true;
  }

  isVaildChain(chain=this.blockchain) {
    for (let i = 2; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (!this.isVaildBlock(currentBlock, previousBlock)) {
        return false;
      }
    }

    if (JSON.stringify(chain[0]) !== JSON.stringify(initBlock)) {
      return false;
    }
    return true;
  }
}

module.exports = Blockchain;

// let bc = new Blockchain();
// bc.mine();
// bc.mine();
// bc.blockchain[1].index = 100;
// bc.mine();
// bc.mine();