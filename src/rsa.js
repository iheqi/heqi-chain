var fs = require('fs');
var EC = require('elliptic').ec;
 
// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC('secp256k1');

// 生成公私钥对象
var keypair = ec.genKeyPair();

function getPubByPrv(prv) {
  return ec.keyFromPrivate(prv).getPublic('hex').toString();
}

function generateKeys() {
  const fileName = './wallet.json';
  try {
    let res = JSON.parse(fs.readFileSync(fileName));

    if (res.prv && res.pub && getPubByPrv(res.prv) === res.pub) {
      keypair = ec.keyFromPrivate(res.prv);
      return res;
    } else {
      console.log('验证失败！');
    }

  } catch (error) {
    // 文件不存在或者非法，则重新生成
    const res = {
      prv: keypair.getPrivate('hex').toString(),
      pub: keypair.getPublic('hex').toString()
    }

    fs.writeFileSync(fileName, JSON.stringify(res));
    return res;
  }
}

// 私钥签名

function sign({from, to, amount}) {
  const bufferMsg = Buffer.from(`${from}-${to}-${amount}`);
  let signature = Buffer.from(keypair.sign(bufferMsg).toDER()).toString('hex');
  return signature;
}

// 公钥验证
function verify({from, to, amount, signature}, pub) {
  const keypairTemp = ec.keyFromPublic(pub, 'hex');
  // console.log(keypairTemp, 'keypairTemp', pub);

  const bufferMsg = Buffer.from(`${from}-${to}-${amount}`);
  return keypairTemp.verify(bufferMsg, signature);
}

const trans = { 
  from: 'heqi', 
  to: 'ceido', 
  amount: 100 
};

const transFalse = { 
  from: 'heqi1', 
  to: 'ceido', 
  amount: 100 
};

const keys = generateKeys();

const signature = sign(trans);
trans.signature = signature;
transFalse.signature = signature;
// console.log('signature', signature);

console.log(verify(trans, keys.pub));
console.log(verify(transFalse, keys.pub));