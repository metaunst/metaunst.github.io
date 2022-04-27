import Web3 from 'web3';
import  { useEthereumNetwork  } from '../contracts';
import { SettingStore } from '../stores';

export default (contractType, contractAddr)=> {

  const network =  'https://rinkeby.infura.io/v3/3af2ebd23289490dbe29d3034e2887ce';
  const { currentWallet } = useEthereumNetwork();

  const abi = require(`./abis/${contractType}`).default;
  const web3 = new Web3(network);
  const contractPublic = new web3.eth.Contract(abi,contractAddr);


  const  createProject = async (callback)=> {
    if (! currentWallet.web3) return true;
    const ABI = require(`./abis/${contractType}`);
    const byteCode = require(`./byteCode/${contractType}`);
    const deployingContract = new currentWallet.web3.eth.Contract(ABI.default).deploy({
        data: byteCode.default.object,
        arguments: []
    });
    const estGas = await deployingContract.estimateGas();
    try {
      const p = await deployingContract.send({
        from: currentWallet.account,
        gas: Math.round(estGas * 1.05)
      });
      callback({status:'success', address:p.options.address});
    } catch (e) {
      callback({status:'failure', address:e.message});
    }

  }

    const getContractInfo = async (callback) => {
      let data = {};
      const po = SettingStore.getState().po;
      
      const idx = po.findIndex(v=>v.address === contractAddr);
      if (idx !== -1) {
        if (!po[idx].data || !po[idx].data.name) {
          data.name = await contractPublic.methods.name().call();
          data.symbol = await contractPublic.methods.symbol().call();
         // const projects = await contractPublic.methods._getAllTokensUrls().call();
         SettingStore.dispatch({type:'updatePo', data: { address: contractAddr, data : data }});
        } else {
          data = {...!po[idx].data ? {} : po[idx].data};
        }
      }
      if (callback) callback( data);
         
    }

    return  { getContractInfo,  createProject  }

}