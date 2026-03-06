import React, { useState, Suspense, lazy } from 'react';
import './App.css'
import 'react-datepicker/dist/react-datepicker.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from './components/PageLoader/PageLoader';
import Sidebar from './components/Sidebar';
import Footer from './components/footer/footer.jsx';

const Loginform = lazy(() => import('./components/loginform/loginform'));
const RegisterForm = lazy(() => import('./components/registerform/registerform.jsx'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard.jsx'));
const Certificates = lazy(() => import('./pages/certificate/Certificates.jsx'));
const Announcements = lazy(() => import('./pages/Announcement/Announcements.jsx'));
const Intentions = lazy(() => import('./pages/Massbooking/Intentions.jsx'));
const Requests = lazy(() => import('./pages/Request/Requests.jsx'));
const Baptism = lazy(() => import('./pages/Baptism/baptism.jsx'));
const Marriage = lazy(() => import('./pages/Marriage/marriage.jsx'));
const Confirmation = lazy(() => import('./pages/Conformation/confirmation.jsx'));
const Burial = lazy(() => import('./pages/Death/death.jsx'));
const Objection = lazy(() => import('./pages/Objection/Objection.jsx'));
const Family = lazy(() => import('./pages/Family/family.jsx'));
const Receipt = lazy(() => import('./pages/Receipt/receipt.jsx'));
const Voucher = lazy(() => import('./pages/Voucher/voucher.jsx'));



const App = () => { 

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));


  return (
    
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>


    
  );
};

export default App;