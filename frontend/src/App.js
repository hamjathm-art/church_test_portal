import React, { useState } from 'react';
import Loginform from './components/loginform/loginform';
import './App.css'
import 'react-datepicker/dist/react-datepicker.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard/Dashboard.jsx';
// import Navbar from './components/Navbar/navbar.jsx';
import Footer from './components/footer/footer.jsx';
import Certificates from './pages/certificate/Certificates.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Announcements from './pages/Announcement/Announcements.jsx';
import Intentions from './pages/Massbooking/Intentions.jsx';
import Requests from './pages/Request/Requests.jsx';
import Baptism from './pages/Baptism/baptism.jsx';
import Marriage from './pages/Marriage/marriage.jsx';
import Confirmation from './pages/Conformation/confirmation.jsx';
import Burial from './pages/Death/death.jsx';
import Objection from './pages/Objection/Objection.jsx';
import Family from './pages/Family/family.jsx';
import Receipt from './pages/Receipt/receipt.jsx';
import Voucher from './pages/Voucher/voucher.jsx';
import RegisterForm from './components/registerform/registerform.jsx';



const App = () => { 

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));


  return (
    
    <BrowserRouter>
          {isAuthenticated ? (
                    //if loged in, show sidebar + pages
                    <>
                    {/* <Navbar /> */}
                    <div className='slidebar1'>
                        <Sidebar setIsAuthenticated={setIsAuthenticated}>
                            <Routes>
                              <Route path="/"element={<Dashboard/>}/>
                              <Route path="/dashboard"element={<Dashboard/>}/>
                              <Route path="/announcements"element={<Announcements/>}/>
                              <Route path="/intentions"element={<Intentions/>}/>
                              
                              {/* Certificates */}
                              <Route path="/Certificates"element={<Certificates/>}/>
                                 <Route path="/baptism" element={<Baptism/>}/>
                                 <Route path="/marriage" element={<Marriage/>}/>
                                 <Route path="confirmation" element={<Confirmation/>}/>
                                 <Route path="death" element={<Burial/>}/>
                                 <Route path="objection" element={<Objection/>}/>
                              
                              <Route path="/requests"element={<Requests/>}/>
                              <Route path="/family" element={<Family/>}/>
                              <Route path="/receipt" element={<Receipt/>}/>
                              <Route path="/voucher" element={<Voucher/>}/>
                              <Route path="*" element={<Navigate to="/dashboard"/>}/>
                            </Routes>
                        </Sidebar>
                        </div>
                         <Footer />
                        </>
                  ) : (

                    //If not logged in, show only login page
                    <Routes>
                        <Route path="/login" element={<Loginform setIsAuthenticated={setIsAuthenticated}/>}/>
                        <Route path="/register" element={<RegisterForm/>}/>
                        <Route path="*" element={<Navigate to="/login"/>}/>
                    </Routes>
          )}
    </BrowserRouter>


    
  );
};

export default App;