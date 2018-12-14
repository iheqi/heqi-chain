const crypto = require('crypto');

class Blockchain {
  constructor () {
    this.blockchain = [];
    this.data = [];
    this.difficulty = 4;

    const hash = this.computedHash(0, '0', Date.now(), 'Hello heqi-chain', 1);

    console.log(hash);
  }

  mine() {

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