import React,  { useState, useEffect}  from 'react';
import { Container,  Image } from 'react-bootstrap';
import { Engine,  IPFSImage } from '../comm';
import { useHistory } from 'react-router';

export default (props)=> {
  const history =  useHistory();

  const [ list, setList ] = useState([]);
  const [ tm, setTm ] = useState(0);

  const eng = new Engine();
  const lazyLoad = (list)=>{
    if (props.type !== 'icon') {
      for (let i=0; i < list.length; i++) {
        if (!list[i].meta) {
          const m =  eng.parseIpfsUrl(list[i].uri);
          if (!m) {
            eng.ipfsFetch(list[i].uri, v=> {
              list[i].meta=v
              setTm(new Date().getTime())
            });
          } else {
            
            eng.callIpfsMeta(list[i].uri,  (v)=>{
              list[i].meta=v;
               setTm(new Date().getTime())
            }, 8);
            
          }
        }
      }
    }
  }
  useEffect(()=>{
    const list = [];
    for (let i in props.NFTs) {
      const idx = list.findIndex(v=>v.uri === props.NFTs[i]);
      if (idx === -1) {
        list.push({uri : props.NFTs[i]});
      }
    }
    setList(list);
    lazyLoad(list);

  }, [ props.NFTs ]);

  const infoList =  <Container fluid={true} className="text-left pt-3">
  {list.map((v, k)=> !v.meta || !v.meta.name ? '' : 
    <Container key={k}  className="float-left p-2 pr-3" style={{width:'9.6rem'}}>
      <Container className="cristal hover-hander p-0 m-0 rounded" style={{width:'100%'}}  onClick={()=>history.push(`/project/${props.po}/${k}`)}>
          <Container  className=" d-flex align-items-center justify-content-center p-3 text-center" 
            style={{width:'100%', height:'7rem', margin:'auto'}}>
            <IPFSImage  className="justify-content-center"
              src={v.meta.image} style={{maxWidth:'100%', maxHeight:'100%', cursor:'pointer',  borderRadius: '50%' }} />
          </Container>
          <Container  className="p-1 pt-2 text-center border-top bg-secondary" style={{height:'4rem'}}>
            {!v.meta.description ? v.meta.name : v.meta.description}
          </Container>  
      </Container>
    </Container>
  )}
     <Container className="clearfix"/>
  </Container>

const iconList =  <Container fluid={true} className="text-left">
  {list.map((v, k)=> !v.meta || !v.meta.name ? '' : 
    <Container key={k} className="float-left"  style={{width:'3.5rem'}}>
        {/*<Image src={v.meta.image} style={{width:'3rem'}}/>*/}
    </Container>
  )}
     <Container className="clearfix"/>
  </Container>

  return props.type === 'icon' ?  iconList : infoList;
}