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
    // this.data = [];
    this.difficulty = 3;
    // const hash = this.computedHash(0, '0', Date.now(), 'Hello heqi-chain!', 1);
  }

  getLastBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  mine() {
    const newBlock = this.generateNewBlock();

    if (this.isVaildBlock(newBlock) && this.isVaildChain()) {
      this.blockchain.push(newBlock);
    } else {
      console.log('error, invalid block.');
    }
  }

  generateNewBlock() {
    let nonce = 0;
    const index = this.blockchain.length;
    const data = 'Hello heqi-chain!';
    const prevHash = this.getLastBlock().hash;
    const timestamp = Date.now();
    let hash = this.computedHash(index, prevHash, timestamp, data, nonce);

    while (hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      nonce++;
      hash = this.computedHash(index, prevHash, timestamp, data, nonce);
    }
    console.log({
      hash,
      nonce,
      timestamp,
      prevHash,
      data,
      index
    });

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

let bc = new Blockchain();
bc.mine();
bc.mine();
bc.blockchain[1].index = 100;
bc.mine();
bc.mine();