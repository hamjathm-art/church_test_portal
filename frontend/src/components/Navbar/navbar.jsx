import React  from "react";
import './navbar.css';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import logo from '../../assets/mobile-logo-fi.png';
import Slidebar from '../Sidebar';

const Navbar = () =>{
      const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);   
    return(
        <>
             <div className="navbar">
     <Button variant="primary" onClick={handleShow} style={{width:"70px"}} id="button">
        Menu
      </Button>
      <img src={logo} style={{width:"50%"}} />

      <Offcanvas show={show} onHide={handleClose}>  
        <Offcanvas.Header closeButton>
        </Offcanvas.Header>

          <Slidebar />

      </Offcanvas>
            </div>
        </>
    );
}
export default Navbar