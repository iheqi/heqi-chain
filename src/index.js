const vorpal = require('vorpal')();
const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

vorpal.command('mine', '挖矿')
      .action(function(args, cb) {
        const newBlock = blockchain.mine();
        if (newBlock) {
          console.log(newBlock);
        }
        cb();
      });

vorpal.command('chain', '查看区块链')
.action(function(args, cb) {
  console.log(blockchain.blockchain);
  cb();
});

vorpal.delimiter("heqi-chain =>")
.show();      

// vorpal.command('hello', '你好啊')
//       .action((args, cb) => {
//         console.log(args);
//         console.log('你好');
//         cb();
//       });
    
// vorpal.exec('hello');


