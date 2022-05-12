import React  from 'react';
import { Container,  Image } from 'react-bootstrap';
import { Link } from "react-router-dom";
import  WalletAccount   from './WalletAccount.js'; 

export default (props)=> {
  return (
      <Container fluid={true} className="p-1 pt-2 pl-2 pr-2">
        <img className="mr-2 mt-1 float-left" 
          src="/images/ethereum-gold.svg" style={{height:'2.4rem'}}/>
          <Link to="/">
            <h2 className="p-1 float-left text-warning">X chain NFT</h2>
          </Link>
        <WalletAccount/>
        <Container className="clearfix p-0"></Container>
    </Container>
  );
}

