import React,  { useState, useEffect}  from 'react';
import { Container,  Image } from 'react-bootstrap';

import { useUtils } from '../customHooks';

import { ImageLib, Engine } from '../comm';
import { useHistory } from 'react-router';

export default (props)=> {
  const history =  useHistory();
  const { copyableShow, showString, show } = useUtils();
  const [ list, setList ] = useState([]);
  const [ tm, setTm ] = useState(0);

  const eng = new Engine();

  const lazyLoad = (list)=>{
    for (let i=0; i < list.length; i++) {
      if (!list[i].meta) {
        eng.get(list[i].uri, v=> {
          list[i].meta=v
          setList(list);
          setTm(new Date().getTime())
        });
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
    lazyLoad(list)

  }, [ props.NFTs ]);

  const infoList =  <Container fluid={true} className="text-left">
  {list.map((v, k)=> !v.meta || !v.meta.name ? '' : 
    <Container key={k}  className="float-left p-3"  style={{width:'9rem'}}>
        <Container  className="alert-info rounded p-2">
          <Image src={v.meta.image} style={{width:'6rem'}}/>
        </Container>
        
    </Container>
  )}
     <Container className="clearfix"/>
  </Container>

const iconList =  <Container fluid={true} className="text-left">
  {list.map((v, k)=> !v.meta || !v.meta.name ? '' : 
    <Container key={k} className="float-left"  style={{width:'3.5rem'}}>
        <Image src={v.meta.image} style={{width:'3rem'}}/>
    </Container>
  )}
     <Container className="clearfix"/>
  </Container>

  return props.type === 'icon' ?  iconList : infoList;
}