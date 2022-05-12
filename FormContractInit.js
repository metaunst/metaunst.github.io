import React, { useState, useEffect }  from 'react';
import { Container, Form, Button, Image  } from 'react-bootstrap';
import { IPFSEngine , Engine } from '../comm';
import { SettingStore } from '../stores';
import {  Link , useParams } from "react-router-dom";

import { useUtils, useUIComponents } from '../customHooks';
import  {  useEthereum } from '../contracts';

export default (props) => {
  const { mutable } = useEthereum();
  const { showNetworkName } = useUIComponents();

  const [ locked, setLocked ] = useState(null);

  const [ project, setProject ] = useState('');
  const [ formrec, setFormrec ] = useState({});

    const ipfs = new  IPFSEngine ();
    const eng = new Engine();
    const [ err, setErr ] = useState('');


    const handleTextChange = (e)=>{

    }

    const initContract = ()=> {
      eng.loadingOn();
      mutable({
        name: 'suezProject',
        address: project.address,
        method : ['_init'],
        data : ['subnet contract','SIDC', 'https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/1.json']
      },v=>{
        console.log('initContrac==>', v);
        if (v.status === 'success') {
            // props.fn.getProject();
         } else {
          setErr(v.message)
         }
        
        eng.loadingOff();
      });
    }

    const contractLogo = <Image src={project.image} className="float-left mr-3" style={{width:'6rem'}}/>

    useEffect(() => {
      if (props.project.address) {
        setProject(props.project);
      }
    }, [ props.project ]);

    const form = ()=> <Container fluid={true} className="alert-secondary border border-success p-3 rounded clearfix" style={{minHeight:'6rem'}}>
      Input from
      =={JSON.stringify(project)}==

          <Form.Control type="text" defaultValue={formrec.name}
            placeholder="Enter a project name (Limit 32 characters)" className="p-1 m-0 mb-2 border"
            onChange={e=>handleTextChange(e, 'name')}/>

          <Form.Control as="textarea" rows={3} placeholder="Description (Limit 320 characters)" 
            className="p-1 m-0 mb-2 border"  onChange={e=>handleTextChange(e, 'description')} />
          
          <Form.Control type="text" defaultValue={formrec.name}
            placeholder="Application github" className="p-1 m-0 mb-2 border"
            onChange={e=>handleTextChange(e, 'name')}/>

    </Container>;

    const body = ()=> <Container fluid={true} className="masterCard p-3 clearfix text-left" style={{minHeight:'6rem'}}>
        {contractLogo} 
        <Container className="p-0 m-0 pl-3 ml-3">
          Initial setup the project.
          {/*The project was locked by owner. */}
        </Container> 
        <Container className="p-0 m-0 pl-3 ml-3">
          <Button className="btn btn-success m-1" onClick={()=> initContract()}>init Me</Button>
        </Container>
        <Container className="clearfix"></Container> 
        
        <Container fluid={true} className="p-0 m-0 mt-3">
          {form()}
        </Container>

        <Container fluid={true} className="p-0 m-0 pl-3 mt-3 text-danger">
          {err}
        </Container>

        <Container className="clearfix"></Container>  
      </Container>

  return body();
}