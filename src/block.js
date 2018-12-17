const crypto = require('crypto');

class Block {
  constructor(index, prevHash, transactions) {
    this.index = index;
    this.prevHash = prevHash;
    this.transactions = transactions;

    this.timestamp = Date.now();
    this.nonce = 0;

    this.hash = 'pending';
  }

  mineBlock(difficulty) {
    this.hash = this.computedHash(this);

    while (this.hash.substring(0, difficulty) !== '0'.repeat(difficulty)) {
      this.nonce++;
      this.hash = this.computedHash(this);
    }
  }

  computedHash({ index, prevHash, timestamp, data, nonce }) {
    return crypto.createHash('sha256')
      .update(index + prevHash + timestamp + data + nonce)
      .digest('hex');
  }
}

module.exports = Block;
