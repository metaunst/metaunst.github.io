import { SettingStore } from '../stores';
class Engine {
   // constructor(prop) {}
    ipfsMain    = SettingStore.getState().ipfs.main;
    ipfsQ       = SettingStore.getState().ipfs.Q;
    popupOn = (popup)=> {
        SettingStore.dispatch({type:'popupTrigger', popup:popup});
    }
    popupOff = (popup)=> {
        SettingStore.dispatch({type:'popupTrigger', popup: false});
    }
    loadingOn = ()=> {
        SettingStore.dispatch({type:'addLoading', id: this.id});
    }
    loadingOff = ()=> {
        SettingStore.dispatch({type:'removeLoading', id: this.id});
    }

    ipfsUri = (uri)=>{
        const idx = uri.indexOf(this.ipfsMain);
        return idx === -1 ? uri : uri.replace(this.ipfsMain, `https://${this.ipfsQ[Math.floor(Math.random() * this.ipfsQ.length)]}/ipfs/`)
    }

    parseIpfsUrl = (url)=>{
        const patt = /(.*)\/([^\?]+)\?([^\/]+)$/;
        const m = url.match(patt);
        return !m || m.length !== 4 ? false : { path: m[1], ipfsCode: m[2], jpCode : m[3]};
    }

    ipfsMainUri = (uri, tp)=>{
        const patt = /(.*)\/([^\?]+)$/;
        const m = uri.match(patt);
        return !m || !m[2]? uri :this.ipfsMain + m[2];
    }

    plugInJsDom = (url, timeoutEnforce) => {
        if (timeoutEnforce) {
            console.log('--need -timeoutEnforce-========-->', url, timeoutEnforce);
        } 
        const target = document.getElementsByTagName('script')[0] || document.head;
        const script = document.createElement('script');
        script.src =  timeoutEnforce? this.ipfsMainUri(url) : this.ipfsUri(url);
        console.log('---ipfsMainUri-=====call===script.src-->', script.src);
        target.parentNode.insertBefore(script, target);
    }

    callIpfsMeta = (orgurl, callback, cacheSeconds)=>{
        const me = this;
        const obj = this.parseIpfsUrl(orgurl);
        const url = this.ipfsUri(`${obj.path}/${obj.jpCode}`);
        const key = obj.ipfsCode;
        if (!window.jpQ) {
            window.jpQ = {Q:{}, ctl:{}};
            setInterval( ()=>{
                const {Q, ctl} =  window.jpQ;
                for (const k in ctl) {
                    let foo = ctl[k].foo;
                    if (Q[k]) {
                        if (ctl[k].data) {
                            for (let d in foo) {
                                foo[d](ctl[k].data) 
                            }
                            foo = {};
                        } else {
                            let needForce = '';
                            for (let d in foo) {
                                if (new Date().getTime() - parseInt(d) > 6000) {
                                    needForce = ctl[k].uri;
                                    foo[new Date().getTime() + Math.random()] = foo[d];
                                    delete  foo[d];
                                    console.log(url, 'uri000==>',  needForce, 'needForce', d, ctl[k].uri, foo)
                                }
                                break;
                            }
                            if (needForce) {
                                console.log(url, 'uri007==>', 'needForce=?', needForce);
                                me.plugInJsDom(needForce, true);
                            }
                        }
                    }
                    if (!Object.keys(foo).length
                        && (!cacheSeconds ||  new Date().getTime() - ctl[k].created > (cacheSeconds * 1000))
                    ) { 
                        delete ctl[k];
                        delete Q[k];
                    }
                }
            }, 300);
        }
        const {Q, ctl} =  window.jpQ;

        if (!Q[key]) {
            ctl[key] = !ctl[key] ? { foo:  {}, created: new Date().getTime()} : ctl[key];
            ctl[key].foo[new Date().getTime() + Math.random()] = callback;
            ctl[key].uri = url;
            Q[key] =  (data)=> {
                ctl[key].data = data;
                ctl[key].created = new Date().getTime();
            };
            this.plugInJsDom(url);
        } else {
            if (ctl[key]) ctl[key].foo[new Date().getTime() + Math.random()] = callback;
        }
    }

    callIpfsJsonpImage = (orgurl, callback, cacheSeconds = 30)=>{
        const me = this;
        const obj = this.parseIpfsUrl(orgurl);
        const url = this.ipfsUri(`${obj.path}/${obj.jpCode}`);
        const key = obj.ipfsCode;
        if (!window._img)  window._img = {};
        if (!window._jsonp) {
            window._jsonp = { };
            setInterval( ()=>{
                const _jsonp = window._jsonp;
                for (const k in _jsonp) {
                    const foo = _jsonp[k].foo;
                    if (window._img[k]) {
                        if (_jsonp[k].data) {
                            for (let d in foo) {
                                foo[d](_jsonp[k].data) 
                            }
                            _jsonp[k].foo = {};
                        } else {
                            let needForce = '';
                            for (let d in foo) {
                                if (new Date().getTime() - parseInt(d) > 6000) {
                                    needForce = window._jsonp[k].uri;
                                    foo[new Date().getTime() + Math.random()] = foo[d];
                                    delete  foo[d];
                                }
                            }
                            if (needForce) {
                                console.log(url, 'uri001==>', 'needForce=?', needForce);
                                me.plugInJsDom(needForce, true);
                             
                            }
                        }
                    }
                    if (!Object.keys(foo).length
                        && (!cacheSeconds ||  new Date().getTime() - _jsonp[k].created > (cacheSeconds * 1000))
                    ) { 
                        delete  window._img[k];
                        delete _jsonp[k];
                    }
                }
            }, 300);
        }

        if (!window._img[key]) {
            if (!window._jsonp[key]) window._jsonp[key] = { foo:  {}, created: new Date().getTime()};
            window._jsonp[key].foo[new Date().getTime() + Math.random()] = callback;
            window._jsonp[key].uri = url;
            window._img[key] =  (data)=> {
                window._jsonp[key].data = data;
                window._jsonp[key].created = new Date().getTime();
            };
            this.plugInJsDom(url);
        } else {
            window._jsonp[key].foo[new Date().getTime() + Math.random()] = callback;
        }
    }

    fetchWithTimeout = async (url, options = {}) => { 
        options.timeout = !options.timeout? 8000 : options.timeout;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), options.timeout);
        const response = await fetch(url, {
          ...options,
          signal: controller.signal  
        });
        clearTimeout(id);
        return response;
      }
    // -- it main used for base64 image or contents retrive with lass cache time used with IPFS image together -- 
    ipfsFetch = async (uri, options = {}, callback,  timeoutEnforce) => {
        const me = this;
        options.timeout = !options.timeout? 12000 : options.timeout;
        const nuri = !timeoutEnforce? this.ipfsUri(uri) : this.ipfsMainUri(uri);
        console.log('-- nuri99-->',  nuri, timeoutEnforce,  this.ipfsMainUri(uri));
        this.get(nuri, options, (v)=>{
            if (v && v.status === 'error') {
                if (!timeoutEnforce) me.ipfsFetch(uri, options = {}, callback,  true);
                console.log('ipfsFetch with err=>', uri, 'v=>', v);
            } else {
                callback(v);
            }
        });
    }

    get = async (uri, options = {}, callback)=>{
        options.timeout = !options.timeout? 12000 : options.timeout;
        try {
            const response = await this.fetchWithTimeout( uri, options);
           
            const niu = await response.json();
            console.log('---response---888999-->', '===uri===>', uri, response, callback, 'niu===>', niu);
            if (callback) callback(niu);
        } catch (e) {
            if (callback) callback({status:'error', uri, message:e.message});
        }
    }

    post = (uri, data, auth, callback)=>{
        //const me = this;
        fetch(uri, {
            method: 'POST',
            data : data,
            herder: {
                        
            }
        }
        ).then(v=>{
            return v.json()
        }).then((data)=> {    
            callback(data);
        }).catch((err) => {
            callback({status:'failure', message:err.message});
        });
    }


    getContent = (uri,  callback)=>{
        // const me = this;
        fetch(uri, {
            method: 'GET',
        }).then(v=>{
            return v.text()
        }).then((data)=> {
            callback(data);
        }).catch((err) => {
            callback('err');
        });
    }
}

export default Engine;