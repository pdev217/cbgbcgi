import '../static/Header.css';
import { useMoralis, useChain } from "react-moralis";
import React, { useEffect } from 'react';
function Header() {
    const { isAuthenticated, user, account, authenticate, logout } = useMoralis();
    const { switchNetwork, chainId, chain } = useChain()

    useEffect(() => {
        if(account) {
            if(chainId != process.env.REACT_APP_CHAIN_ID) {
                switchNetwork(process.env.REACT_APP_CHAIN_ID)
            }
        }
    }, [account])

    console.log("isAuthenticate", isAuthenticated)
    console.log("account", account)

    return (
        <div className='header'>
            <div className='container-fluid'>
                <div className='row'>
                    <div className="col-lg-1 col-md-4 col-sm-4 col-4 left-links txt">
                        <a className="txt" href='/#about'>ABOUT</a>
                    </div>
                    <div className="col-lg-1 col-md-4 col-sm-4 col-4 left-links txt">
                        <a className="txt" href='/#manifesto'>MANIFESTO</a>
                    </div>
                    <div className="col-lg-1 col-md-4 col-sm-4 col-4 left-links txt">
                        <a className="txt" href='/#roadmap'>ROADMAP</a>
                    </div>
                    <div className="col-lg-1 col-md-2 col-sm-2 col-2 px-2">
                        <img src="/header-poster-scaled-1.png" className='logo logoposter img-responsive' width='10%'/>
                    </div>
                    <div className="col-lg-1 col-md-2 col-sm-2 col-2 px-2">
                        <img src='/header-poster-scaled-2.png' className='logo logoposter img-responsive' width='10%' />
                    </div>
                    <div className='col-lg-2 col-md-4 col-sm-4 col-4 px-2 mt-auto mb-auto'>
                        <img src='/new-cbgb.png' className='logo logo-cbgb  img-responsive' width='150'/>
                    </div>
                    <div className='col-lg-1 col-md-2 col-sm-2 col-2 px-2'>
                        <img src="/header-poster-scaled-3.png" className='logo logoposter img-responsive' width='10%' />
                    </div>
                    <div className='col-lg-1 col-md-2 col-sm-2 col-2 px-2 px-2'>
                        <img src="/header-poster-scaled-4.png" className='logo logoposter img-responsive' width='10%'/>
                    </div>
    
                    <div className="col-lg-1  col-md-4 col-sm-4 col-4 left-links txt">
                        {/* {isAuthenticated && <a className='airdrop'>AIRDROP </a>}
                        {isAuthenticated && <a className='whitelist'>WHITELIST </a>} */}
                        {!isAuthenticated && <a className='right-links txt pt-2' href="#" onClick={authenticate}>CONNECT WALLET </a>}
                        {isAuthenticated && <a className='connect right-links txt pt-2' href="#" onClick={() => logout()}>DISCONNECT </a>}
                    </div>

                    <div className="col-lg-1  col-md-4 col-sm-4 col-4 left-links txt">
                        <a className='connect right-links txt text-uppercase' href='/#token'>Buy tokens</a>
                    </div>

                    <div className="col-lg-1  col-md-4 col-sm-4 col-4 left-links txt">
                        <a className='connect right-links txt' href='https://discord.com/invite/kezTCUpK5H'>DISCORD</a>
                    </div>
                
                </div>
            </div>
        </div>
    )
}

export default Header;
