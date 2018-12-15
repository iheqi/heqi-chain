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
    return head.map(key => obj[key])
  })

  table.push(...res);
  console.log(table.toString());
}


const blockchain = new Blockchain();

vorpal.command('mine', '挖矿')
      .action(function(args, cb) {
        const newBlock = blockchain.mine();
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

vorpal.delimiter("heqi-chain =>")
.show();      

// vorpal.command('hello', '你好啊')
//       .action((args, cb) => {
//         console.log(args);
//         console.log('你好');
//         cb();
//       });
    
// vorpal.exec('hello');


