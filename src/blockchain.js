const crypto = require('crypto');
const rsa = require('./rsa');
const Block = require('./block');

const initBlock = {
  index: 0,
  transactions: 'Hello heqi-chain!',
  prevHash: '0',
  timestamp: 1544792455313,
  nonce: 4250,
  hash: '00049946ecd84533d70ae601208c45aebcc0f6ef19482e55b46f131ddb1693f1'
};

class Blockchain {
  constructor() {
    this.blockchain = [initBlock];
    this.transactions = []; // pendingTransactions
    this.difficulty = 3;
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

    const timestamp = Date.now();
    const transObj = { from, to, amount, timestamp };
    transObj.signature = rsa.sign(transObj);
    this.transactions.push(transObj);
    return transObj;
  }

  isValidTrans(trans) {
    return trans.from === '0' ? true : rsa.verify(trans, trans.from);
  }

  addTrans(trans) {
    // consolo.log('交易合法?', this.isValidTrans(trans));
    if (this.isValidTrans(trans)) {
      this.transactions.push(trans);
    }
  }

  mine() {
    const newBlock = this.generateNewBlock();

    // if (!this.data.every(val => isValidTrans(val))) {
    //   return false;
    // }
    // console.log(this.data, 'data')

    this.transactions = this.transactions.filter(val => this.isValidTrans(val)); // 过滤不合法的2

    if (this.isValidBlock(newBlock) && this.isValidChain()) {
      this.blockchain.push(newBlock);
      this.transactions = [];
      return newBlock;
    } else {
      console.log('error, invalid block.');
    }
  }
  generateNewBlock() {
    // let nonce = 0;
    const index = this.blockchain.length;
    const transactions = this.transactions;
    const prevHash = this.getLastBlock().hash;
    // const timestamp = Date.now();

    const newBlock = new Block(index, prevHash, transactions);
    newBlock.mineBlock(this.difficulty);
    return newBlock;
  }
  getBalanceOfAddress(address) { // 查询余额
    let blance = 0;
    for (var i = 0; i < this.blockchain.length; i++) {
      const block = this.blockchain[i];
      for (const trans of block.transactions) {
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

  isValidBlock(newBlock, lastBlock = this.getLastBlock()) { // 这里还要验证？fuck，本来就是这样来的
    if (newBlock.index === 0) {
      return true;
    }
    if (newBlock.index !== lastBlock.index + 1 ||
        newBlock.timestamp <= lastBlock.timestamp ||
        newBlock.prevHash !== lastBlock.hash ||
        newBlock.hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty) ||
        newBlock.hash !== this.computedHash(newBlock)
    ) {
      return false;
    }
    return true;
  }

  computedHash({ index, prevHash, timestamp, data, nonce }) {
    return crypto.createHash('sha256')
      .update(index + prevHash + timestamp + data + nonce)
      .digest('hex');
  }

  isValidChain(chain = this.blockchain) {
    for (let i = 2; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (!this.isValidBlock(currentBlock, previousBlock)) {
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
