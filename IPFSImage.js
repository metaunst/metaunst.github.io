import React, { useState, useEffect, useContext }  from 'react';
import { Image } from 'react-bootstrap';
import { Engine } from './';
export default (props)=> {
    const eng = new Engine();
    const [ base64, setBase64 ] = useState('');
    useEffect(()=>{
        loadImage(props.src);
    }, [ props ]);

    const loadImage = (url) => {
        if (eng.parseIpfsUrl(url)) {
            eng.callIpfsJsonpContent('img', url,  setBase64, 12); 
        } else {
            setBase64(url);
        }

    }
    return !base64? '' : <Image src={base64} className={props.className} style={props.style} onClick={props.onClick} />
}