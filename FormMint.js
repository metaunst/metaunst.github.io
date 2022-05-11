import React, { useState, useEffect }  from 'react';
import { Container, Form, Button, Image  } from 'react-bootstrap';
import { IPFSEngine , Engine } from '../comm';
import { SettingStore } from '../stores';
import {  Link , useParams } from "react-router-dom";

import { useUtils, useUIComponents } from '../customHooks';
import  {  useEthereum } from '../contracts';

export default (props) => {
  const { copyableShow } = useUtils();
  const { getCurrentWallet, isWalletNetwork, mutable, Ximutable, getProjectinfo } = useEthereum();
  const { showNetworkName } = useUIComponents();

  const [ locked, setLocked ] = useState(null);

  const [ contract, setContract ] = useState('');
  const [ project, setProject ] = useState('');
  const [ formrec, setFormrec ] = useState({});
  const [ mint, setMint ] = useState('');
    

    const ipfs = new  IPFSEngine ();
    const eng = new Engine();
    const [ err, setErr ] = useState('');

    const checkStatus = ()=> {
      Ximutable(project.wallet, {
        name: 'suezProject',
        address: project.address,
        method : ['_tokensCount']
      },v=>{
        console.log('checkStatus==>', v);
        // if (v.status === 'success') { console.log(contract, 'test--2->',v)}
      });
    }


    const handleTextChange = (e)=> {
        let rec = {};
        if (mint === 'youtube') {
          const videoId = youtubeUrlParser(e.target.value);
          if (!videoId) {
            setErr('Incorrected video url');
          } else {
            rec = {
              "name":`#${videoId}`,"description":`Youtube Movie #${videoId}`,
              "image":`https://i.ytimg.com/vi/${videoId}/hq720.jpg`,
              "video": {
                  "format":"youtube",
                  "url" : `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
              },
              "edition":6,"date":new Date().getTime(),
              "attributes":[{"name":"LightBlue#50","rarity":"original"},{"name":"Regular#80","rarity":"original"}
              ]
            }
            setFormrec(rec);
          }
        } else {
          try {
            rec = JSON.parse(e.target.value);
          } catch (err) {}
          if (!Object.keys(rec).length ) {
            setErr('Incorrected metadata format');
          } else {
            setFormrec(rec);
          }
        }

    }

    function youtubeUrlParser(url) {
      const videoId = /^https?\:\/\/(www\.)?youtu\.be/.test(url) ? url.replace(/^https?\:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/,"$2") : url.replace(/.*\?v\=([\w-]{11}).*/,"$1");
      return videoId;
    }; 


    const initContract = ()=> {
      eng.loadingOn();
      mutable({
        name: 'suezProject',
        address: project.address,
        method : ['_init'],
        data : ['Foodies Community','dishFu', 'https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/1.json']
      },v=>{
        console.log('initContrac==>', v);
        if (v.status === 'success') { console.log('contract', 'test--2->',v)}
        props.fn.getProject();
        eng.loadingOff();
      });
    }

    const mintNFT = async ()=> {
      eng.loadingOn();
      if (err) {
        return true;
      }
      const code  = await ipfs.uploadData(formrec);

      mutable({
        name: 'suezProject',
        address: project.address,
        method : ['_mintNFT'],
        data : [`https://ipfs.io/ipfs/${code}`]
      },v=>{
        console.log('mintNFT==>', v);
        if (v.status === 'success') { 
          eng.loadingOff();
          setMint('');
          props.fn.getNfts();
        }
          
      });
    }
    const isWalletMintable = ()=>{
      const currentWallet = getCurrentWallet();
      return isWalletNetwork(project.network);
    }

    const contractLogo = <Image src={project.image} className="float-left mr-3" style={{width:'6rem'}}/>

    useEffect(() => {
      if (props.project.address) {
        setProject(props.project);
      }
    }, [ props.project ]);

    const infoInMintable = ()=> <Container fluid={true} className="alert-warning border border-warning p-3 rounded clearfix" style={{minHeight:'6rem'}}>
         {contractLogo} 
        <p className="p-0 m-0 pl-3 ml-3">
          The project is  unmintable! the network of your walllet is <span className="highlightme">{ showNetworkName(getCurrentWallet().network) }</span>. 
          but the project is on <span className="highlightme">{ showNetworkName(project.network) } </span>.
        </p> 
        <p className="p-0 m-0 pl-3 ml-3 text-info">* If you want to mint your nft. 
          plesae switch your wallet network to <span className="highlightme">{ showNetworkName(project.network) } </span>.</p>
        <Container className="clearfix"></Container>  
    </Container>

      const formInit = ()=> <Container fluid={true} className="alert-success border border-success p-3 rounded clearfix" style={{minHeight:'6rem'}}>
        {contractLogo} 
        <Container className="p-0 m-0 pl-3 ml-3">
          The project was locked by owner. 
        </Container> 
        <Container className="p-0 m-0 pl-3 ml-3">
          <Button className="btn btn-success m-1" onClick={()=> initContract()}>init Me</Button>
        </Container>
        
        <Container className="clearfix"></Container>  
        </Container>

    const mintForm = ()=> <Container fluid={true} className="alert-warning border border-warning p-3 rounded clearfix" style={{minHeight:'6rem'}}>
        {contractLogo} 
        <Container fluid={true} className="p-1" style={{backgroundColor:'#eee'}}>

          { mint === '' &&  <Container fluid={true} className="p-2">

            Contract <span className="text-info">{copyableShow(project.address, 5)}</span> is running on the network <b>{project.network.title}</b>
            <Container className="clearfix"></Container>

            <Container  fluid={true} className="text-left p-3">
            <Button className="btn btn-md btn-warning ml-3" onClick={()=>{ setMint('youtube') } }>Mint YouTube</Button>
            <Button className="btn btn-md btn-warning ml-3" onClick={()=>{ setMint('metadata') } }>Mint Metadata</Button>
          </Container>


          <Container className="clearfix"></ Container>

          </Container>}

          { mint === 'metadata' && <Container fluid={true} className="p-2">
                Mint NFT from metadata<span className="text-danger ml-3">{err}</span>
                <Form.Control as="textarea" defaultValue="" 
                    placeholder="paste your metadata" className="p-2 m-0 mb-2 border"
                    rows="3" onChange={handleTextChange}/>
                {formButtons()}
            </Container>} 

          {mint === 'youtube' &&
            <Container fluid={true} className="p-2">
              Mint NFT from youtube code<span className="text-danger ml-3">{err}</span>
              <Form.Control as="textarea" defaultValue="" 
                  placeholder="paste your metadata" className="p-2 m-0 mb-2 border"
                  rows="3" onChange={handleTextChange}/>
              {formButtons()}
            </Container>}

              {mint === 'success' && <Container fluid={true} className="p-2">
                Mint request sent successfully. It may take a few minutes blockchain process.
                <Button className="btn btn-md btn-warning float-right" onClick={()=>{ setMint('') } }>Continue to mint tokn(s)</Button>
                <Container className="clearfix"></Container>
              </Container>}
            </Container>
      </Container>

    const formButtons = ()=> <Container fluid={true} className="clearfix">
      <Button className="btn btn-sm btn-secondary m-2 float-right" onClick={()=>  setMint('')  }>Cancel</Button>
      <Button className="btn btn-sm btn-info m-2 float-right" onClick={()=>  mintNFT()  }>Submit</Button>
    </Container>

  return !project.address? `Loading ...` : !isWalletMintable()? infoInMintable() : project.locked? formInit() :  mintForm();
}