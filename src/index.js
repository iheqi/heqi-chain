const vorpal = require('vorpal')();
// const Blockchain = require('./blockchain');
const Table = require('cli-table');
const rsa = require('./rsa');
const { P2p, blockchain } = require('./p2p');

function formatLog(data) {
  if (!data || data.length === 0) {
    return;
  }
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


// const blockchain = new Blockchain();
const p2p = new P2p();
p2p.init();

vorpal.command('mine', '挖矿')
      .action(function(args, cb) {
        const newBlock = blockchain.mine(rsa.keys.pub);
        if (newBlock) {
          formatLog(newBlock);
        }
        cb();
      });

vorpal.command('blockchain', '查看区块链')
      .action(function(args, cb) {
        formatLog(blockchain.blockchain);
        cb();
      });

vorpal.command('trans <to> <amount>', '转账')
      .action(function(args, cb) {
        // 默认本地公钥为转出地址了
        let trans = blockchain.transfer(rsa.keys.pub, args.to, args.amount);
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

vorpal.command('pub', '查看本地公钥')
      .action(function(args, cb) {
        console.log(rsa.keys.pub);
        cb();
      });  

vorpal.command('chat <msg>', '广播聊天')
      .action(function(args, cb) {
        p2p.boardcast({
          type: 'hi',
          data: args.msg
        });
        cb();
      });

vorpal.command('peers', '查看所有节点')
      .action(function(args, cb) {
        formatLog(p2p.peers);
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


