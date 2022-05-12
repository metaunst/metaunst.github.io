import { useState, useEffect, useContext }  from 'react';
import { SettingStore } from '../stores';
import Web3 from 'web3';
import { UserContext } from '../comm';
import { useUtils } from '../customHooks';

export default ()=> {

    const { strTpl } = useUtils();
    const { cache, networksMeta } = useContext(UserContext);


    const getMainNet = () =>{
      const idx = networksMeta.findIndex(v=>v.chainId === SettingStore.getState().mainChainId);
      return  networksMeta[idx];
    }

    const getRpc = (network) =>{
      const tpl = !network || !network.rpc  || !network.rpc.length ? '' : network.rpc[0];
      return !tpl? '' :  strTpl(tpl, {INFURA_API_KEY:SettingStore.getState().INFURA_API_KEY});
    }

    const [ currentWallet,  setCurrentWallet ] = useState('');
    const [ currentWeb3,  setCurrentWeb3 ] = useState(null);
   // const [ tm,  setTm ] = useState(0);
    const isLocalWalletExist = !window.ethereum ? false : true;

    const inmutableWatch = ()=>{
      clearInterval(window._itv);
      window._itv = setInterval(()=>{
        for (let k1 in cache) {
          for (let k2 in cache[k1].Q) {
            if (cache[k1].data) {
              cache[k1].Q[k2]({status:'success', data:cache[k1].data});
              delete cache[k1].Q[k2];
            }
            if (new Date().getTime() - parseInt(k2) > 12000) {
              delete cache[k1].Q[k2];
            }
          }
        }
      }, 300);
    } 
    useEffect(inmutableWatch, []);

    const valueCurrentWallet = (v)=>{
        const data = SettingStore.getState().currentWallet;
        for (let k in v) {
            data[k] = v[k];
        }
        data.mainNet = getRpc(getMainNet());
        SettingStore.dispatch({type: 'valueCurrentWallet', value: data})
    }

    const valueCurrentWeb3 = (v)=>{
      SettingStore.dispatch({type: 'valueCurrentWeb3', value: v})
    }

    useEffect(()=>{
      setCurrentWallet(SettingStore.getState().currentWallet);
      setCurrentWeb3(SettingStore.getState().currentWeb3);
      const handleSubscribe = SettingStore.subscribe(() => {
          if (SettingStore.getState()._watcher === 'valueCurrentWallet') {
              setCurrentWallet(SettingStore.getState().currentWallet);
              setCurrentWeb3(SettingStore.getState().currentWeb3);
          }
      });
      return ()=> {
          handleSubscribe();
      }
    }, [])

    /*--
    contractSetting {
      1. abi
      2. byteCode

    }
    -*/

    const createContract = async (contractSetting,  callback)=> {
      if (!currentWeb3) return true;
      const ABI = require(`./abis/${contractSetting.name}`);
      const byteCode = require(`./byteCode/${contractSetting.name}`);
      const deployingContract = new currentWeb3.eth.Contract(ABI.default).deploy({
          data: byteCode.default.object,
          arguments: []
      });
      const estGas = await deployingContract.estimateGas();
      try {
        const p = await deployingContract.send({
          from: currentWallet.account,
          gas: Math.round(estGas * 1.05)
        });
        callback({status:'success', data : { address:p.options.address, network: currentWallet.network } });
      } catch (e) {
        callback({status:'failure',message :e.message});
      }
    }

    const Xmutable = async (currentWeb3, contractSetting, callback)=>{
      if (!currentWeb3) return true;

      const abi = require(`./abis/${contractSetting.name}`).default;
      const contract = new currentWeb3.eth.Contract(abi, contractSetting.address);
      
      try {
        if (!contract.methods[contractSetting.method]) {
          callback({status:'failure', message : 'method does not exist'});
        } else {
          if (typeof contract.methods[contractSetting.method] === 'function') {
            const params = !contractSetting.data?[]:contractSetting.data;
            const q = await contract.methods[contractSetting.method].apply(this,  params);
            const cfg = { from:currentWallet.account};
            if (contractSetting.value) {
                cfg.to = contractSetting.address;
                cfg.value = contractSetting.value;
            }
            
            const estGas = await q.estimateGas(cfg);
            const p = await q.send({...cfg, gas: Math.round(estGas * 1.1)});
            callback({status:'success'});

          }
        }
      } catch (e) {
          callback({status:'failure', contractSetting, message : e.message});
      }
    }

    const Ximutable = async (publicNetwork, contractSetting, callback, nocache) => {
      const id = new Date().getTime() + window.Math.random();
      const methods = typeof contractSetting.method === 'string' ?  [ contractSetting.method ] :  contractSetting.method;
      
      const paramkey = [];
      for (const o in methods) {
        const params = !contractSetting.data || !contractSetting.data[methods[o]]?[]:contractSetting.data[methods[o]];
        paramkey.push(params.join('_'));
      } 
      const cacheKey = contractSetting.address + '_' + methods.join('_') + '_' + paramkey.join('.') ;
      if (nocache) {
        delete cache[cacheKey]();
      }
      if (cache[cacheKey]) {
        if (cache[cacheKey].data) {
          callback({status:'success', data: cache[cacheKey].data})
        } else {
          cache[cacheKey].Q[id] = callback;
        }
      } else {
        cache[cacheKey] = {Q:{}, data:null};
        cache[cacheKey].Q[id] = callback;

        const web3 = new Web3(publicNetwork);
        const abi = require(`./abis/${contractSetting.name}`).default;
        const contractPublic = new web3.eth.Contract(abi, contractSetting.address);
        try {
          if (!contractSetting.method) {
            callback({status:'failure', message : 'method does not exist'});
          } else {
            
            const mapping = !contractSetting.mapping ?  {} :  contractSetting.mapping;
            const data = {};
            for (const o in methods) {
              if (typeof contractPublic.methods[methods[o]] === 'function') {
                contractSetting.data = !contractSetting.data ? {} : contractSetting.data;
                const params = !contractSetting.data[methods[o]]?[]:contractSetting.data[methods[o]];
                data[!mapping[methods[o]] ? methods[o] : mapping[methods[o]]] = 
                    await contractPublic.methods[methods[o]].apply(this, params).call();
              }
            }
            cache[cacheKey].data = data;
          }
        } catch (e) {
            callback({status:'failure', contractSetting, message : e.message});
        }
      }
    }

    const mutable = async (contractSetting, callback)=>{
        if (!currentWeb3) return true;
        Xmutable(currentWeb3, contractSetting, callback);
    }

    const imutable = async (contractSetting, callback, nocache) => {
      Ximutable( getRpc(getMainNet()),contractSetting, callback, nocache);
    }

    const getCurrentWallet = ()=>{
      return  SettingStore.getState().currentWallet;
    }

    const isWalletMainNet = ()=>{
      const wallet =  getCurrentWallet();
      return !wallet || !wallet.network ? false : SettingStore.getState().mainChainId === wallet.network.networkId;
    }

    const isWalletNetwork = (network)=>{
      const wallet =  getCurrentWallet();
      return !wallet || !wallet.network || !network || !network.networkId ? false : network.networkId === wallet.network.networkId;
    }

    return { getMainNet, getRpc, getCurrentWallet, isWalletNetwork,  isWalletMainNet, 
            valueCurrentWeb3, valueCurrentWallet, isLocalWalletExist, 
            mutable, imutable, Xmutable, Ximutable, createContract }
}