const ChessContent = artifacts.require('ChessContent');
const OpenChess = artifacts.require('OpenChess');

contract('ChessContent', accounts => {
  let chessContent;
  let openChess;
  const owner = accounts[0];
  const creator = accounts[1];
  const buyer = accounts[2];
  const buyer2 = accounts[3];

  const url = 'https://openchess.io/json/{id}.json';
  const firstType = '0x8000000000000000000000000000000100000000000000000000000000000000';
  const firstNFT  = '0x8000000000000000000000000000000100000000000000000000000000000001';

  before(async () => {
    chessContent = await ChessContent.new(url, 5, { from: owner });
    openChess = await OpenChess.new(chessContent.address, { from: owner });
  });

  it('Create Master NFT', async () => {
    const result = await chessContent.create(url, true, { from: creator });
    // console.log(JSON.stringify(result, null, 2));
    expect(result.receipt.logs[0].args.role).to.equal(firstType);
  });

  it('Mint copies', async () => {
    // console.log(web3.utils.toBN(firstType).toString());
    const result = await chessContent.mintBatch(creator, web3.utils.toBN(firstType).toString(), 10, [], { from: creator });
    // console.log(JSON.stringify(result, null, 2));
    // console.log(await chessContent.nfOwners(web3.utils.toBN(firstType).add(web3.utils.BN(1)).toString()));
    expect(result.receipt.logs[0].args.ids[0].toString()).to.equal(web3.utils.toBN(firstNFT).toString());
  });

  it('Set Metadata', async () => {
    const result = await chessContent.setMetadata(web3.utils.toBN(firstNFT).toString(), {
      price: web3.utils.toWei('1').toString(),
      status: '1'
    }, { from: creator });
    const readResult = await chessContent.getMetadata(web3.utils.toBN(firstNFT).toString());
    expect(readResult).to.eql([ web3.utils.toWei('1').toString(), '1' ]);
  });

  it('Set Type commission', async () => {
    const result = await chessContent.setTypeCommission(web3.utils.toBN(firstType).toString(),
                                                       25, { from: creator });
    const readResult = await chessContent.getTypeCommission(web3.utils.toBN(firstType).toString());
    // console.log(readResult.toString());
    expect(readResult.toString()).to.equal('25');
  });

  it('Buy NFT without approval form buyer', async () => {
    const result = await openChess.buy(web3.utils.toBN(firstNFT).toString(), {
      from: buyer,
      value: web3.utils.toWei('1'),
    }).catch(err => {
      // console.log(JSON.stringify(err, null, 2));
      expect(err.reason).to.equal('ERC1155: caller is not owner nor approved');
    });
    if (result) {
      throw new Error('should not be allowed');
    }
  });

  it('Buy NFT with approval', async () => {
    const approval = await chessContent.setApprovalForAll(openChess.address, true, { from: creator });
    const result = await openChess.buy(web3.utils.toBN(firstNFT).toString(), {
      from: buyer,
      value: web3.utils.toWei('1'),
    });
    //console.log(JSON.stringify(result, null, 2));
  });

  it('Buy attempt on Not for Sale', async () => {
    const result = await openChess.buy(web3.utils.toBN(firstNFT).toString(), {
      from: buyer2,
      value: web3.utils.toWei('1'),
    }).catch(err => {
      expect(err.reason).to.equal('ChessContent#buy: not for sale');
    });
    if (result) {
      throw new Error('should not be allowed');
    }
  });

  it('2nd buyer: wrong price', async () => {
    const mdResult = await chessContent.setMetadata(web3.utils.toBN(firstNFT).toString(), {
      price: web3.utils.toWei('2').toString(),
      status: '2'
    }, { from: buyer });
    const approval = await chessContent.setApprovalForAll(openChess.address, true, { from: buyer });
    const result = await openChess.buy(web3.utils.toBN(firstNFT).toString(), {
      from: buyer2,
      value: web3.utils.toWei('1'),
    }).catch(err => {
      expect(err.reason).to.equal('ChessContent#buy: price dont match');
    });
    if (result) {
      throw new Error('should not be allowed');
    }
  });

  it('2nd buyer: success scenario', async () => {
    const result = await openChess.buy(web3.utils.toBN(firstNFT).toString(), {
      from: buyer2,
      value: web3.utils.toWei('2'),
    });
  });

});
