import Engine from './comm/Engine';
import { SettingStore } from './stores';

export default class LoadMeta {
  data = {networksMeta:[],  imagesMeta:{}, cache : {}};

  initLoad ( callback) {
    const me = this;
    const eng = new Engine();

    eng.get('/metaData/images.json', v=>{
      me.data.imagesMeta = v;
      eng.get('/metaData/networks.json', async v=>{
        me.data.networksMeta=v;
        callback(true);
      });
    });   
  }

  loadStoreData () {
    let localMyContracts = [];
    try {
      localMyContracts = JSON.parse(localStorage.getItem('localMyContracts'));
     } catch (e) {}
     SettingStore.dispatch({type:'addMyProject', project:localMyContracts});

     let CurrentWallet = {
      provider : null,
      account : null,
      balance : null,
      network : {}
     } 
    try {
      if (localStorage.getItem('CurrentWallet')) {
       // CurrentWallet = JSON.parse(localStorage.getItem('CurrentWallet'));
      }
     } catch (e) {}
     SettingStore.dispatch({type:'valueCurrentWallet', value:CurrentWallet});
  }

}
export { LoadMeta };