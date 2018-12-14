const crypto = require('crypto');

const initBlock = {
  index: 0,
  data: 'Hello heqi-chain!',
  prevHash: '0',
  timestamp: 1544792455313,
  nonce: 4250,
  hash: '00049946ecd84533d70ae601208c45aebcc0f6ef19482e55b46f131ddb1693f1'
}

class Blockchain {
  constructor () {
    this.blockchain = [initBlock];
    this.data = [];
    this.difficulty = 3;

    const hash = this.computedHash(0, '0', Date.now(), 'Hello heqi-chain', 1);
  }

  getLastBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  mine() {
    let nonce = 0;
    const index = this.blockchain.length;
    const data = 'Hello heqi-chain!';
    const prevHash = this.getLastBlock().hash;
    // const prevHash = '0'
    const timestamp = Date.now();

    let hash = this.computedHash(index, prevHash, timestamp, data, nonce);

    while (hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      nonce++;
      hash = this.computedHash(index, prevHash, timestamp, data, nonce);
    }

    console.log(hash, nonce, timestamp);
  }

  generateNewBlock() {

  }

  computedHash(index, prevHash, timestamp, data, nonce) {
    return crypto.createHash('sha256')
                 .update(index + prevHash + timestamp + data + nonce)
                 .digest('hex');
  }

  isVaildBlock() {

  }

  isVaildChain() {

  }
}

let bc = new Blockchain();
bc.mine();