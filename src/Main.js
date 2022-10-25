import React, { useState, useEffect } from 'react';
import { Routes , Route } from 'react-router-dom';
import { useMoralis } from "react-moralis";
import Home from './pages/Home';
import Mint from './pages/Mint';
import SuperFuckingDuperMint from './pages/SuperFuckingDuperMint'
const Main = () => {
  const { isInitialized, Moralis, enableWeb3,} = useMoralis();
  const connectorId = window.localStorage.getItem("connectorId");
  useEffect(() => {
    enableWeb3({ provider: connectorId });
  }, []);
  
  return (
    <Routes> {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path='/' element={<Home/>}></Route>
      <Route exact path='/sfdm' element={<SuperFuckingDuperMint/>}></Route>
    </Routes>
  );
}

export default Main;
