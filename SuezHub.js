import React,  { useState, useEffect }  from 'react';
import { Container,  Card, Row, Col, Button } from 'react-bootstrap';

import { useUtils } from '../customHooks';
import { useEthereum } from '../contracts';
import { ImageLib } from '../comm';

import { useHistory } from 'react-router';
import { SuezHubDetails } from './';

import { UserContext } from '../comm';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faBuilding, faLandmark } from '@fortawesome/free-solid-svg-icons'

export default (props)=> {
  const history =  useHistory();

  // cache /
  const { copyableShow, showString, show } = useUtils();
  
  const [ viewType, setViewType ] = useState('');
  const [ contract, setContract ] = useState({});
  const { imutable  } = useEthereum();
  const [ nfts, setNfts ] = useState({});

  useEffect(()=>{
    imutable({
      name: 'suezHub',
      address: props.contract.address,
      method : ['name', 'symbol', '_getAllTokensUrls'],
      mapping: { _getAllTokensUrls:'nfts' }
    },v=>{
      if (v.status === 'success') { 
        props.contract.data = v.data;
      }
      setContract(props.contract);
      setViewType(props.type);
    });

  }, [ props.contract ]);

  const nameAddress = (name, addr)=><span className="float-left border border-secondary p-0 pl-2 pr-2 pb-2 rounded">
      <Container className="text-left p-0"><span className="m-0 bg-secondary text-light rounded" style={{fontSize:'0.6rem'}}>{show(contract.address, 6)} </span></Container>
      <Container className="text-left p-0"><b>{!name?'':showString(name,16)}</b></Container>
    </span>

  const itemIcon = ()=> <Container className="p-1 m-0 float-left text-center" 
  style={{ width: '10%', minWidth:'8rem',height:'4rem' }}>
      <Card border="warning"  className={`hover-shadow p-0 rounded topButton border`}  
        onClick={()=>history.push('/postOffice/' + contract.address)}
          style={{ width:'100%', height:'100%' }}>
          <Card.Body className="p-0 text-warning text-left ">
              <Row>
                  <Col className="d-flex align-items-center m-0 text-center" xs={3}>
                    <Container fluid={true} className="clearfix text-center text-warning p-1 pt-2">
                      <FontAwesomeIcon size="2x" icon={ faLandmark } className="pt-1"/>
                    </Container>
                  </Col>
                  <Col xs={9} style={{fontSize:'0.76rem', lineHeight:'0.8rem',width: '20rem'}} 
                      className="d-flex align-items-center p-1 pl-3 pr-3 pt-2 text-wrap text-left text-warning ow">
                       {!contract || !contract.data || !contract.data.name  ? show(contract.address,4) : 
                          showString(contract.data.name,28)}
                      
                  </Col>
              </Row>
          </Card.Body>
      </Card>
  </Container>

const addProjectBox =   <Container  className="float-left p-2 pr-3 pt-3 mt-2" style={{width:'9.6rem'}}>
<Container className="border border-info p-0 m-0 bg-info hover-shadow rounded" style={{width:'100%'}}
    onClick={()=>history.push('/CreateProject/' + contract.address) }>
    <Container style={{height:'1rem'}}></Container>
    <Container  className="d-flex align-items-center justify-content-center p-0 text-center text-light" 
      style={{width:'100%', height:'3rem', margin:'auto'}}>
        Add a project  
    </Container>
    <Container  className="d-flex align-items-center justify-content-center bg-info p-0 text-center text-light" 
      style={{width:'100%', height:'6rem', margin:'auto'}}>
      <Container fluid={true} className="text-center">
        <FontAwesomeIcon size="5x" icon={ faPlusCircle }className="m-0 p-0 alert-info rounded-circle"/></Container>
    </Container>
    <Container style={{height:'2rem'}}></Container>
</Container>
</Container>;

const postOfficeMainCard = ()=> !contract ? '' : 
 <Container fluid={true} className={'m-0 mb-3 p-3 alert-success border border-success rounded'} style={{minHeight:'48rem'}}>
  <span className="pr-3  float-left" style={{width:'4.8rem'}}>
    <ImageLib v="postOffice" setting={{ className: 'border border-secondary shade',  
    style: {width:'3.6rem', borderRadius: '50%'}}} />

  </span>
  <span className="mr-3 text-secondary  float-left" style={{fontSize:'2rem'}}>
    <b>{contract.data.name}</b><span className="ml-2 bg-secondary text-light rounded" style={{fontSize:'0.6rem'}}>{copyableShow(contract.address, 5)} </span>
    <span className="" style={{fontSize:'1rem'}}>{!contract || !contract.data || !contract.data.nfts? '' : contract.data.nfts.length}</span>
  </span>
  <Container className="clearfix"/>
  {addProjectBox}

  <SuezHubDetails type="box" po={contract.address} NFTs={!contract || !contract.data || !contract.data.nfts? [] : contract.data.nfts} />
</Container>;


  const postOfficeCard = ()=> !contract ? '' : 
      <Container fluid={true} className={'m-0 mb-3 p-3 alert-secondary rounded hover-shadow clearfix'}
        onClick={()=> history.push('/postOffice/' + contract.address)} >
      <span className="mr-3 float-left">
        <ImageLib v="postOffice" setting={{ className: 'border border-secondary shade',  style: {width:'3.5rem', borderRadius: '50%'}}} />
      </span>


      <span className="p-0 m-0 float-left">
        {!contract || !contract.data ? '' : nameAddress(contract.data.name, contract.address)}
      </span>
      <span className="p-3 m-0 float-right">
        <h3>{!contract || !contract.data || !contract.data.nfts? '' : contract.data.nfts.length}</h3>
      </span>
      <span className="p-3 m-0 float-left">
        <SuezHubDetails type="icon" NFTs={!contract || !contract.data || !contract.data.nfts? [] : contract.data.nfts} />
      </span>
      <Container className="clearfix"/>
     
    </Container>;

  return !viewType ? '' : 
          viewType === 'mainCard'? postOfficeMainCard() : 
                viewType === 'itemIcon'? itemIcon() : postOfficeCard()
   
}