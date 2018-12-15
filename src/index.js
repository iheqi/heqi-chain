const vorpal = require('vorpal')();
const Blockchain = require('./blockchain');
const Table = require('cli-table');

function formatLog(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  const head = Object.keys(data[0]);
  var table = new Table({
    head,
    colWidths: Array(head.length).fill(18)
  });

  const res = data.map(obj => {
    return head.map(key => JSON.stringify(obj[key], null, 1));
  })

  table.push(...res);
  console.log(table.toString());
}


const blockchain = new Blockchain();

vorpal.command('mine <miningRewardAddress>', '挖矿')
      .action(function(args, cb) {
        const newBlock = blockchain.mine(args.miningRewardAddress);
        if (newBlock) {
          formatLog(newBlock);
        }
        cb();
      });

vorpal.command('chain', '查看区块链')
      .action(function(args, cb) {
        formatLog(blockchain.blockchain);
        cb();
      });

vorpal.command('trans <from> <to> <amount>', '转账')
      .action(function(args, cb) {
        let trans = blockchain.transfer(args.from, args.to, args.amount);
        if (trans) {
          formatLog(trans);
        }
        cb();
      })

vorpal.command('detail <index>', '查看区块详情')
      .action(function(args, cb) {
        const block = blockchain.blockchain[args.index];
        console.log(JSON.stringify(block, null, 2));
        cb();
      });

vorpal.command('blance <address>', '查看余额')
      .action(function(args, cb) {
        const blance = blockchain.getBalanceOfAddress(args.address);
        formatLog({address: args.address, blance});
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


