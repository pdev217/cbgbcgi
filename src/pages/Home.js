import Header from '../components/Header'
import React, { useState, useEffect, Fragment, Component } from 'react';

import '../static/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useMoralis, useChain, useMoralisFile, useNewMoralisObject } from "react-moralis";
import WOW from 'wowjs';
import { superConf, fokingConf } from '../constants/config';
import axios from "axios"
import Web3 from "web3";
import Spinner from 'react-bootstrap/Spinner';
import abi  from "../constants/CBGBCGI.json";
//toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slider from "react-slick";
/*
  Limit how many buyers get the early supporter bonuses ie first 1000 buyers get cool t-shirt
*/
const LVL_SUPER = "SUPER";
const LVL_SUPER_DUPER = "SUPER DUPER";
const LVL_SUPER_FOKING_DUPER = "SUPER F*CKING DUPER";

const web3 = new Web3(Web3.givenProvider);

function Home() {
  let settings = {
    dots: false,
    arrows:false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
        {
          breakpoint: 1400,
          settings: {
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 1,
          }
        },
        {
            breakpoint: 992,
            settings: {
                infinite: true,
                slidesToShow: 3,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 768,
            settings: {
                infinite: true,
                slidesToShow: 3,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 576,
            settings: {
                infinite: true,
                slidesToShow: 2,
                slidesToScroll: 1 ,
            }
        },
        {
            breakpoint: 480,
            settings: {
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1 ,
            }
        }
      ]
  };

  const [contract, setContract] = useState('');
  const [mintStatus, setMintStatus] = useState(false);
  const { Moralis, account, user } = useMoralis();
  const { saveFile } = useMoralisFile();
  const { save } = useNewMoralisObject("s_d_nfts");
  let tokenUrlArr = [];

  useEffect(() => {
    const contractCode = new web3.eth.Contract(abi.abi, process.env.REACT_APP_CONTRACT_ADDRESS);
    setContract(contractCode)
    console.log(contractCode)
    new WOW.WOW({
      live: false
    }).init();
  },[])

  const mint = async (lev, cat="") => {
    let mintPrice;
    const balance = await getBalance();
    setMintStatus(true)
    if(lev == LVL_SUPER) {
      mintPrice = process.env.REACT_APP_SINGLE_PRICE;
    }
    if(lev == LVL_SUPER_FOKING_DUPER) {
      mintPrice = process.env.REACT_APP_SUPER_F_D_PRICE;
    }
    if(lev == LVL_SUPER_DUPER) {
      mintPrice = process.env.REACT_APP_SUPER_DUPER_PRICE
    }

    console.log("-----balance",balance)
    console.log("-----mint price",mintPrice)

    if(balance*1 < web3.utils.toWei(String(mintPrice))) {
      setMintStatus(false)
      toast.warn(`To mint ${lev}, ${mintPrice} ETH is required.`);
      return;
    }

    const tokenUri = await getTokenURI(lev, cat);
    console.log(tokenUri)

    if(lev == LVL_SUPER || lev == LVL_SUPER_FOKING_DUPER) {
      if(tokenUri) {
        contract.methods
        .mint(String(tokenUri))
        .send({ from: user.get("ethAddress"), value:web3.utils.toWei(String(mintPrice), "ether") })
        .then(async () => {
          setMintStatus(false);
          let totalSupply = await getTotalSupply();
          alertMessage(totalSupply, lev);
        })
        .catch((error) => {
          if(error) {
              setMintStatus(false)}
          }
        )
        // console.log('----minted');
      }
    }else {
      contract.methods
      .doubleMint(tokenUri)
      .send({ from: user.get("ethAddress"), value:web3.utils.toWei(String(mintPrice), "ether") })
      .then(async () => {
        setMintStatus(false);
        let totalSupply = await getTotalSupply();
        alertMessage(totalSupply, lev);
      })
      .catch((error) => {
        if(error) {
            setMintStatus(false)}
        }
      )
    }
  }

  const alertMessage = (totalSupply, lev) => {
    var tymessage = "THANKS FOR MINTING!\n";
    if (lev === LVL_SUPER_DUPER) {
      tymessage += "\nPlease register your SUPER DUPER purchase at https://docs.google.com/forms/d/e/1FAIpQLSeM_1n_kygNYBnM4wDnDD6uUrDVEPrkNQY2twkIU21PwPCelQ/viewform?vc=0&c=0&w=1&flr=0 to receive your SUPER DUPER Benefits!!";
    }
    if (lev === LVL_SUPER_FOKING_DUPER){
      tymessage += "\nPlease register your SUPER F*CKING DUPER purchase at https://docs.google.com/forms/d/e/1FAIpQLScW8Bzp507GPoCJmS_NvdbSFWH2Bk3LFpQZwjwg3qGCr3TosQ/viewform?vc=0&c=0&w=1&flr=0 to receive your SUPER F*CKING DUPER Benefits!!";
    }
    if (totalSupply <= 1000){
      tymessage += "\n\nCongratulations! You are one of the first 1000 to mint! Please register at https://docs.google.com/forms/d/e/1FAIpQLSfoiWLZGHDhOsxsoBxalP0ttPnKtkMcDxazuQp2myqOCHc1Yw/viewform?vc=0&c=0&w=1&flr=0 to receive your First 1000 Benefits!";
    }
    alert(tymessage);
  }

  const getTokenURI = async (lev, cat) => {
    console.log(cat)

    const DB = "s_d_nfts";

    if(lev == LVL_SUPER) {
      // console.log("CBGB "+ String(cat).toUpperCase())
      const excelData = await getExcelData("CBGB "+ String(cat).toUpperCase())
      const random = getRandomInt(2, excelData.length)
      // const random = 2;
      const nftName = excelData[random][1];
      const NFT = Moralis.Object.extend(DB);
      const query = new Moralis.Query(NFT);
      query.equalTo("category", cat);
      query.equalTo("level", lev);
      query.equalTo("name", nftName)
      const row = await query.find();
      console.log(row)

      if(row.length == 0) {
        const pinataCat = await getDataFromPinata(cat);
        //metadata
        const metadata = makeMetaData(excelData, random, pinataCat)
        // const metadata = {
        //   "name": excelData[random][1],
        //   "description": excelData[random][2],
        //   "image": String('https://ipfs.io/ipfs/'+pinataCat.ipfs_pin_hash+'/'+excelData[random][1]),
        //   "attributes": [
        //       {
        //         "trait_type": "character_name",
        //         "value": String(excelData[random][2]),
        //       },
        //       {
        //         "trait_type": "birth_date",
        //         "value": String(excelData[random][3]),
        //       },
        //       {
        //         "trait_type": "character_action",
        //         "value": String(excelData[random][4]),
        //       },
        //       {
        //         "trait_type": "background_image",
        //         "value": String(excelData[random][5]),
        //       },
        //       {
        //         "trait_type": "background_color",
        //         "value": String(excelData[random][6]),
        //       },
        //       {
        //         "trait_type": "text_color",
        //         "value": String(excelData[random][7]),
        //       },
        //       {
        //         "trait_type": "border_color",
        //         "value": String(excelData[random][8]),
        //       },
        //       {
        //           "display_type": "boost_percentage", 
        //           "trait_type": "musical_genius", 
        //           "value": Number(excelData[random][9])
        //       },
        //       {
        //           "display_type": "boost_percentage", 
        //           "trait_type": "hotness", 
        //           "value": Number(excelData[random][10])
        //       },
        //       {
        //         "display_type": "boost_percentage", 
        //         "trait_type": "stamina", 
        //         "value": Number(excelData[random][11])
        //       },
        //       {
        //           "trait_type": "shredability", 
        //           "value": Number(excelData[random][12])
        //       }, 
        //       {
        //           "trait_type": "dancability", 
        //           "value": Number(excelData[random][13])
        //       }, 
        //       {
        //           "trait_type": "drug_tolerance", 
        //           "value": Number(excelData[random][14])
        //       }, 
        //   ]
        // };

        console.log(metadata)
        let metadataurl = await uploadFileToMoralis(metadata);
        let tokenUrl = 'https://ipfs.moralis.io/ipfs/' + metadataurl._hash

        const data = {
          level: lev,
          token_uri: tokenUrl,
          name:excelData[random][1],
          metadata: metadata,
          category: cat
        };
    
        let res = await save(data, {
          onSuccess: (result) => {
            // Execute any logic that should take place after the object is saved.
            console.log("inserted data to DB", result.id);
          },
          onError: (error) => {
            // Execute any logic that should take place if the save fails.
            // error is a Moralis.Error with an error code and message.
            console.log(error)
            return;
          },
        });

        return res.attributes.token_uri;

      }else {
        return row[0].attributes.token_uri;
      }
    }

    if(lev == LVL_SUPER_DUPER) {
      const excelData = await getExcelData("CBGB (SUPER DUPER LEVEL 200) Guitar Picks");
      for (let i = 2; i < 100; i++) {
        const random = getRandomInt(2, i);
        const nftName = excelData[random][1];
        const NFT = Moralis.Object.extend(DB);
        const query = new Moralis.Query(NFT);
        query.equalTo("level", lev);
        query.equalTo("name", nftName)
        const row = await query.find();
        tokenUrlArr.push(row[0].attributes.token_uri)
      }
      return tokenUrlArr;
      // const pinataCat = await getDataFromPinata("(SUPER DUPER LEVEL 200) Guitar Picks".toUpperCase());
    }

    if(lev == LVL_SUPER_FOKING_DUPER) {
      const NFT = Moralis.Object.extend("nfts");
      const query = new Moralis.Query(NFT);
      query.equalTo("category", cat);
      query.equalTo("level", lev);
      const row = await query.find();
      // let metadataurl = await uploadFileToMoralis(row[0].attributes.metadata);
      // let tokenUrl = 'https://ipfs.moralis.io/ipfs/' + metadataurl._hash
      //   console.log(tokenUrl)
      const tokenURI = row[0].attributes.token_uri;
      return tokenURI;
    }
    
  }

  const makeMetaData = (data, order, pinataCat) => {
    const metadata = {
      "name": data[order][1],
      "description": data[order][2],
      "image": String('https://ipfs.io/ipfs/'+pinataCat.ipfs_pin_hash+'/'+data[order][1]),
      "attributes": [
          {
            "trait_type": "character_name",
            "value": String(data[order][2]),
          },
          {
            "trait_type": "birth_date",
            "value": String(data[order][3]),
          },
          {
            "trait_type": "character_action",
            "value": String(data[order][4]),
          },
          {
            "trait_type": "background_image",
            "value": String(data[order][5]),
          },
          {
            "trait_type": "background_color",
            "value": String(data[order][6]),
          },
          {
            "trait_type": "text_color",
            "value": String(data[order][7]),
          },
          {
            "trait_type": "border_color",
            "value": String(data[order][8]),
          },
          {
              "display_type": "boost_percentage", 
              "trait_type": "musical_genius", 
              "value": Number(data[order][9])
          },
          {
              "display_type": "boost_percentage", 
              "trait_type": "hotness", 
              "value": Number(data[order][10])
          },
          {
            "display_type": "boost_percentage", 
            "trait_type": "stamina", 
            "value": Number(data[order][11])
          },
          {
              "trait_type": "shredability", 
              "value": Number(data[order][12])
          }, 
          {
              "trait_type": "dancability", 
              "value": Number(data[order][13])
          }, 
          {
              "trait_type": "drug_tolerance", 
              "value": Number(data[order][14])
          }, 
      ]
    };

    return metadata
  }

  const getTotalSupply = async () => {
    const totalSupply = await contract.methods.totalSupply().call();
    return totalSupply;
  }

  //upload metadata to moralis
  const uploadFileToMoralis = async (metadata) => {
    const base64 = Buffer.from(JSON.stringify(metadata)).toString("base64");

    return saveFile(
        `${metadata.name.slice(0,5)}metadata.json`,
        { base64 },
        {
            type: "base64",
            saveIPFS: true,
            onSuccess: (result) => {return result.ipfs()},
            onError: (error) => {
                console.log(error)
                // setMintStatus(false)
                // toast.error("Please connect your metamask")
            },
        }
    );
  };

  const getExcelData = async (fileName) => {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/getExcelData`, {
        fileName: fileName
    })

    return response.data
  }
  
  const getRandomInt = (min, max) => {
    return Math.floor(min + Math.random() * (max - min))
  }

  const getDataFromPinata = async (cat) => {
    let selectedGroup;

    var config = {
        method: 'get',
        url: 'https://api.pinata.cloud/data/pinList?pageLimit=1000',
        headers: { 
          pinata_api_key: process.env.REACT_APP_PINATA_API,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET,
        }
      };
      
    const res = await axios(config);
    res.data.rows.map(e => {
        if(String(e.metadata.name?.toUpperCase()) == String("CBGB " +cat+" TAKE 2") ) {
            selectedGroup = e;
        }
    })
    return selectedGroup;
  }

  const getBalance = async () => {
    let balance = await web3.eth.getBalance(account);
    return balance
}

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className='intro'>
        <div className='intro-innter'>
          <Header />
          <CountDown targetDate="December 1, 2022" targetTime="00:00:00" />
          <div className='container'>
            <div className='row'>
                <p className="first-paragraph mb-3 mt-4"><span>W</span>elcome to a revolution in filmmaking!</p>
            </div>
          </div>
          <div className="container-fluid video-container">
              {/* <div className='Row'> */}
                <iframe src="https://player.vimeo.com/video/687707772?h=0d651714a3" frameBorder="0" className='responsive-iframes col-12' allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
              {/* </div> */}
            </div>
          <div className='container'>
            <div className='row'>
                <p className="second-paragraph">We're creating a boffo, gonzo, fully animated enhanced version of the 2013 feature film <span className='cbgb-txt'>CBGB</span> about the legendary rock 'n' roll club. </p>
            </div>
          </div>
            <br />
            <br />
        </div>
      </div>
      <div className='about' id="about">
      <div className="container-fluid">
        <div className="row position-relative">
        <img className="img-responsive mx-auto about-bg-img" src="/Layer590.png" style={{ width:'44%' }} />
        <h1 className='theme-heading position-absolute textpurple shadow-white about-font about-heading' style={{top:'7px'}}> About </h1>
        </div>
      </div>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='position-relative'>
              <div className='cheetah-about animate-person'>
                <img src='https://cbgb.mypinata.cloud/ipfs/QmcxhPTm94unWzrjSKjXy551s4papARRCBfPUKYViibny5/Cheetah-dances-smaller.gif' />
              </div>
              <p className='about-first'>
                <span className=''>
                  CBGB
                </span> was the birthplace of punk rock - The legendary club that launched the careers of some of the most influential rockers of all time: Blondie, The Ramones, Patti Smith, Iggy Pop, Talking Heads, and many more...
              </p>
              <div className='lisa-about animate-person'>
                <img src='https://cbgb.mypinata.cloud/ipfs/QmcxhPTm94unWzrjSKjXy551s4papARRCBfPUKYViibny5/Lisa-smaller-for-site.gif' />
              </div>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-2 image-mobile-hidden'>
            <img src='/MT_CBGB_07.png' className='img-responsive shadow-img' width='100%'/>
          </div>
          <div className='col-2 mobile-hidden'>
            <img src='/MT_CBGB_08.png' className='img-responsive shadow-img' width='100%' />
          </div>
          <div className='col-md-4 col-sm-8 mt-auto mb-auto'>
            <p className='about-second fs-4'>
              We are bringing you a side-by-side Director’s Cut of the <span className='cbgb-txt'>2013 CBGB movie</span>. Viewers can enjoy the great soundtrack with or without animation - 
              or with AND without!  Up to you!
              <br />
              <div className='mt-md-5'>
                And we are calling it...
              </div>
              {/* We are taking <span className='second-cbgb textpink'>CBGB</span> the 2013 movie and turning it into a side-by-side Director's Cut fully 3D animated version
             using the exact same soundtrack...  </p> */}
            </p>
          </div>
          <div className='col-2 mobile-hidden'>
            <img src='/MT_CBGB_10.png' className='img-responsive shadow-img' width='100%' />
          </div>
          <div className='col-2 image-mobile-hidden'>
            <img src='/MT_CBGB_11.png' className='img-responsive shadow-img' width='100%' />
          </div>
        </div>
      </div>
        <br /><br /><br />
        <div className="container-fluid">
            <div className='row'>
              <div className='col-lg-8 m-auto'>
                <img src='/heading-cbgb2.png' className='w-100' />
              </div>
            </div>
        </div>
        <div className='country-computer flex-column flex-lg-row'>
        </div>
        <div className='row'>
          <div className='col-4 text-end p-0'>
            <img src='/demo-left.png' className='img-fluid demo-pic demo-pic-alan alan-img wow bounceInLeft' style={{ transform: 'translateX(30px)' }} />
          </div>
          <div className='col-4 p-0'>
            <img src='/demo-mid.png' className='img-fluid demo-pic' />
          </div>
          <div className='col-4 p-0 text-start'>
            <img src='/demo-right.png' className='img-fluid demo-pic demo-pic-alan alan-img wow bounceInRight' data-wow-duration="2s" />
          </div>
        </div>
        <div className='position-relative'>
          <div className='imagine imagine-text col-md-6'> Imagine watching Alan Rickman play CBGB Club Owner Hilly Kristal, AND animated Alan Rickman playing CBGB Club Owner Hilly Kristal. Side-by-side.</div>
          <div className='animate-person hilly-gif'>
            <img src='https://cbgb.mypinata.cloud/ipfs/QmcxhPTm94unWzrjSKjXy551s4papARRCBfPUKYViibny5/Hilly-smaller-for-site.gif' />
          </div>
        </div>
      </div>
      <div className='ways' id="token">
        <div className="container-fluid">
            <div className='row position-relative text-center'>
              <img className="img-responsive m-auto have-3-bg" src="/Layer590.png" style={{ width:'1110px' }}/>
              <h1 className="text-white shadow-purple position-absolute theme-heading line-height1-1 small-headings position-text" style={{top:'55px'}}> You Have <span className='textyellow font-cbgb font-weight400'>3 </span> Ways To Jump Onboard! </h1>
              </div>
        </div>
        <br /><br />

        <div className='super d-flex flex-column flex-lg-row'>
          <div className='container-fluid main-container'>
            <div className='row'>
              <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12'>
                <div className='w-100 h-100 text-center' style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                  <img className='ticket img-responsive' src='/Super Level tokens.png' width='185px' />
                   <div>
                      {/* <h1 className='title super-ticket-title ticket font-cbgb'> Super Level </h1> */}
                      <img src='/heading-super-mobile.png' style={{ width: '80%' }} /> 
                    </div>
                <div className='ticket-blurb px-5 mt-up-ext'>
                  <p className='col-12 text-center mt-2'>
                  Buy one of our <span className='cbgbfont'>11,999</span> individually, artistically
                  handcrafted and completely unique character tokens....
                  </p>
                </div>
                <a href='#bonus' className='w-100'>
                    <img src='./Bonus.png' className='img-responsive wow pulse animated' data-wow-delay="300ms" data-wow-iteration="infinite" width='176px' />
                </a>
        
                <div className='row text-center bottom mt-4'>
                  <div className='col text-center'>
                    <a className="button buy" style={{ background: "red" }} href="#examples">
                      go to Super level
                    </a>
                  </div>
                </div>
              </div>
            </div>
  
              <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12 mt-sm-0 mt-4'>
                <div className='w-100 h-100 text-center' style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                  <img className='ticket img-responsive' src='/Super duper Level 200 extras.png' width='185px' />
                    <div className='mb-2'>
                      {/* <h1 className='title ticket mt-up mb-3 font-cbgb'>Super Duper Level </h1> */}
                      <img src='/heading-super-duper-mobile.png' style={{ width: '80%' }} /> 
                    </div>
                <p className='ticket-blurb px-5 mt-up-ext'>
                  Buy one of the <span  className='cbgbfont'>200</span> and you get to be in the film.
                  Yep, you heard that right. All good rock 'n' roll pictures
                  need devoted fans. At this level we will animate you into
                  the film. You will also get your <span>NAME ON THE WALL</span> and a <span> TOKEN</span> too!
                </p>

                <div className='text-center bottom mt-super'>
                  <div className='col text-center'>
                    <a className="button buy bg-yellow text-red" style={{ background: "red" }} href="#duper">
                      <span className='valign'>
                        go to Super Duper
                      </span>
                    </a>
                  </div>
                </div>
              </div>
          </div>
            
        
            <div className='col-lg-4 col-md-4 col-sm-12 col-xs-12 mt-sm-0 mt-4'>
                <div className='w-100 h-100 text-center' style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                  <img className='ticket img-responsive' src='/Super-f_@king-duper-Level-21.png' width='185px'/>
                   <div>
                      {/* <h1 className='title tickets font-cbgb'> Super F*cking Duper Level </h1> */}
                      <img src='/heading-super-f-duper-mobile.png' style={{ width: '80%' }} /> 
                    </div> 
                <div>
                  <p className='ticket-blurb text-center px-5'>
                    We are SELLING only <span  className='cbgbfont'>21</span><span> ANIMATED GIFs </span>
                    of the leads of the film. It’s an exclusive club. Each is one-of-a kind museum quality. Imagine our punkers at the New York MET.
                    For those special 21 they will also <span>GET THEMSELVES ANIMATED INTO
                      THE FILM</span>, their <span>NAME ON THE WALL</span> and one of the <span>TOKENS</span> too!
                  </p>
                </div>
                <div className='text-center w-100 mt-duper'>
                  <div className='col text-center'>
                    <a className="button buy sfdm-button" href="#superDuper">
                      go to Super F*cking Duper
                    </a>
                  </div>
                </div>
              </div>
            </div>


            </div>
          </div>
        </div>
        <br />
        <br />
        <div id='examples'>
          <div className="container-fluid">
            {/* <div className='row position-relative text-center'>
              <img className="img-responsive example-bg-img mx-auto" src="/Layer590.png" style={{ width:'1029px'}} />
              <h1 className='position-absolute text-white shadow-purple theme-heading line-height1-1 fontsize4rem font-cbgb' style={{top:'25px'}}> super level</h1>
            </div> */}
            <div className='row'>
              <div className='col-lg-10 m-auto'>
                <img src='/heading-super.png' className='w-100' />
                {/* <img src='/heading-super-mobile.png' className='w-100 mobile-image' /> */}
              </div>
            </div>
            <div className='row position-relative text-center'>
              {/* <img className="img-responsive example-bg-img mx-auto" src="/Layer590.png" style={{ width:'1029px'}} /> */}
              <h1 className='text-white shadow-purple theme-heading line-height1-1 small-heading'> Example Of The <span className='textyellow font-cbgb font-weight400'> 21 </span>  Character NFTs </h1>
            </div>

            <div className='row mb-3'>
                <p className='text-white small-hd'>(Hover over each to see variations)</p> 
            </div>
          </div>
          <br />
          <div className='container-fluid'>
            <div className='row example-image'>
              {
                superConf.map((e) => (
                  <div className='col-lg-4 position-relative text-center' key={e.id}>
                    <img id={e.category} 
                    className='ex-img'
                    src={e.img}/>
                    <div className='name'>{e.name}</div>
                    <div className='role'>{e.role}</div>
                    <div className='row'>
                      <div className='col-4 m-auto px-1'>
                        <button 
                        className='mint' 
                        name="" 
                        width="100%"
                        disabled={mintStatus}
                        onClick={() => mint(LVL_SUPER, e.category)}
                        >
                          <span className={mintStatus?'d-none':'d-block'}>Mint Super</span>
                          <div className={mintStatus?'d-block':'d-none'}>
                              <Spinner
                                  as="span"
                                  animation="grow"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                              /> loading
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        <br />

        </div>
        <br /><br /><br />
        <div className='purple' id='bonus'>
          <div className="container-fluid">
               <div className='row position-relative'>
                  <img className="img-responsive bonus-bg-img mx-auto lg-img-3" src="/Layer590.png" style={{ width:'1100px' }} />
                  <h1 className='text-white shadow-purple position-absolute font-cbgb line-height1-1 fontsize4rem text-wrap' style={{ top:'40px' }}> Bonus For First <span className='textyellow font-cbgb font-weight400'> 1000 </span> Holders  
                  </h1>
                  
                </div>
          </div>
          <div className="container-fluid">
                <div className='row text-center'>
                  <img className="img-responsive m-auto wow zoomIn" src="/Bonus-01.png" style={{width:'478px'}}/>
              </div>
          </div>
          <div className='position-relative'>
            <div className='animate-person lou-gif'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmcxhPTm94unWzrjSKjXy551s4papARRCBfPUKYViibny5/Lou-Reed-smaller-for-site.gif' alt="lou reed gif" />
            </div>
            <p className='text-white bonus-para mt-4'>
              For the first <span className='thousand'>1000</span> who purchase tokens we will add <span className='thousand'>YOUR NAME</span> to the illustrious storied walls of our animated Club.
              Your name or band name (completely up to you) will be featured as another sticker or poster or a bit of graffiti and it will be immortalized alongside Blondie, The Ramones, The Police and more. Pretty cool, right?
            </p>
            <div className='animate-person terry-gif'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmcxhPTm94unWzrjSKjXy551s4papARRCBfPUKYViibny5/Terry-Ork-smaller-for-site.gif' alt="lou reed gif" />
            </div>
          </div>
          <br />

          <div className="container-fluid">
            <img className="img-responsive wow fadeInLeft" src="/Group 87 1.png" width='80%'/>
          </div>
          <br />
          <br />
          <div className="container-fluid" id='duper'>
            {/* <div className='row position-relative'>
                <img className="img-responsive mx-auto put-bg-img lg-img-1" src="/Layer590.png" style={{ width:'900px' }} />
                  <h1 className='theme-heading text-white shadow-purple position-absolute fontsize4rem font-cbgb' style={{top:'30px'}}> Super Duper Level </h1>
              </div> */}
              <div className='row'>
                <div className='col-lg-10 m-auto'>
                  <img src='/heading-super-duper.png' className='w-100' />
                </div>
              </div>
          </div>
          <div className="container-fluid">
            <div className='row position-relative'>
                {/* <img className="img-responsive mx-auto put-bg-img" src="/Layer590.png" style={{ width:'900px' }} /> */}
                  <h1 className='theme-heading text-white small-heading'> We Put  You Into The Film!! </h1>
              </div>
          </div>
          <br /><br />
          <div className="container">
            <div className='row justify-content-center align-items-center'>
              <div className='col-md-3'>
                <img src="/randomrudu1.png" className='w-100 img-responsive' />
              </div>
              <div className='col-md-3 offset-md-1'>
                <img src="/randomrude-arrow.png" className='w-100 img-responsive animate__animated animate__shakeX animate__infinite' />
              </div>
              <div className='col-md-3 offset-md-1'>
                <img src="/randomrude2.png" className='w-100 img-responsive' />
              </div>
              <div className='col-md-6'>
                <img src="/randomrude3.png" className='w-100 img-responsive' />
              </div>
            </div>
          </div>
          <p className='apear mt-2'>And appear as an extra in the new side-by-side animated version of <span> CBGB </span></p>
          <button 
          className='mint mint-sfd text-red bg-yellow' 
          disabled={mintStatus}
          onClick={() => mint(LVL_SUPER_DUPER)} 
          style={{ width: 'fit-content' }}>
            <span className={mintStatus?'d-none':'d-block'}>Mint Super Duper</span>
            <div className={mintStatus?'d-block':'d-none'}>
                <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                /> loading
            </div>
          </button>
          <div className='row m-auto' style={{ width: '63%' }}>
            <div className='col-12'>
              <p className='apear text-light mt-2'>AND RECEIVE ONE OF THE 200 EXCLUSIVE GOLD GUITAR PICK NFTS!!</p>
            </div>
            <div className='col-lg-4 px-3'>
              <div className='flip-animated'>
                <div className='animate__animated animate__fadeInRight wow animated_duration2s'>
                  <img src='/Blondie2CBG.jpg' className='w-100' alt='' style={{ boxShadow: '0px 1px 8px 2px #fff' }} />
                </div>
              </div>
            </div>
            <div className='col-lg-4 px-3'>
              <div className='flip-animated'>
                <div className='animate__animated animate__fadeInRight wow animated_duration2s'>
                  <img src='/Genya2CBGB.jpg' className='w-100' alt='' style={{ boxShadow: '0px 1px 8px 2px #fff' }} />                  
                </div>
              </div>
            </div>
            <div className='col-lg-4 px-3'>
              <div className='flip-animated'>
                <div className='animate__animated animate__fadeInRight wow animated_duration2s'>
                  <img src='/Cheetah2CBGB.jpg' className='w-100' alt='' style={{ boxShadow: '0px 1px 8px 2px #fff' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <br/>

        <br />
        <div className='super-fucking'>
          <div id='superDuper' className="container-fluid">
              {/* <div className='row position-relative'>
                  <img className="img-responsive mx-auto animated-bg-img lg-img-2" src="/Layer590.png" style={{ width:'1100px' }}/>
                    <h1 className='position-absolute theme-heading text-light shadow-purple fontsize4rem font-cbgb lg-text-2' style={{ top: '40px' }}> Super F*cking Duper Level </h1>
                  </div> */} 
                  <div className='row'>
                    <div className='col-lg-10 m-auto'>
                      <img src='/heading-super-f-duper.png' className='w-100' />
                      {/* <img src='/heading-super-f-duper-mobile.png' className='w-100 mobile-image' /> */}
                    </div>
                  </div>
          </div>
          <h1 className='theme-heading text-white shadow-purple fontsize34px font-weight400'> 21 Animated NFTS </h1>
          <div className="container-fluid">
            <p className='text-white small-hd'>(Hover or click on each to expand)</p>
          </div>
          <br /><br /><br />
          <div className='container-fluid'>
            <div className='row'>
                
              {
                fokingConf.map((e) => (
                  <div className='col-lg-4 col-sm-4 col-6' key={e.category}>
                    <img 
                    src={e.img} 
                    className='thumbnail img-fluid' />
                  
                    <div className='animated-headline'>{e.title}</div>
                    <div className='animated-text'>{e.smallTitle}</div>
                    <div className='animated-text'>{e.desc}</div>
                    <div className='col-lg-4 col-md-6 m-auto px-1'>
                        <button 
                        className='mint mint-sfd sfdm-button' 
                        disabled={mintStatus}
                        onClick={() => mint(LVL_SUPER_FOKING_DUPER, e.category)}>
                          <span className={mintStatus?'d-none':'d-block'}>Mint Super F*cking Duper</span>
                          <div className={mintStatus?'d-block':'d-none'}>
                              <Spinner
                                  as="span"
                                  animation="grow"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                              /> loading
                          </div>
                        </button>
                    </div>
                  </div>
                ))
              }
              
            </div>
          </div>
        </div>
        <br/>
      </div>
      <div className='our-manifesto' id="manifesto">
        <div className="container-fluid">
            {/* <div className='row position-relative'>
                <img className="img-responsive manifest-bg-img" src="/our-manifesto.png"/>
                  <h1 className='textred theme-heading shadow-yellow position-absolute font-cbgb fontsize4rem ' style={{top:'17px'}}> Our Manifesto </h1>
                </div> */}
                <div className='row'>
                  <div className='col-lg-10 m-auto'>
                    <img src='/heading-our-manifesto.png' className='w-100' />
                  </div>
                </div>
        </div>
        <br />
        <div className='row'>
          <div className='col-12'>
          <p>
            Rock 'n' roll musicians and the filmmakers that follow them have been telling stories infused with the music they love since that first rock 'n' roller strung an electric guitar and cranked up the volume. And right beside them some crazy film student decided to capture it on video. The birth of the Music Video. Those songs and those stories, though radical and revolutionary at first, shaped our culture today. At CBGB CGI we believe that storytellers and artists deserve an outlet where they can be valued and supported without having to bow to the machine of big media. So we’re tilting the model on its head and testing a new architecture using NFTs that can connect storytellers directly with their audience and essentially decentralize content production. But we are going even further: we are designing this so that our NFT holders will reap the rewards alongside the investors (Film CBGB LLC), the filmmakers and actors and everyone else. We are all in this together -- if CBGB CGI is a runaway hit, and we firmly believe it will, the entire community will prosper. And those with a greater piece of it, those NFT holders, will see greater rewards!!
          </p>
          </div>
        </div>
      </div>
      <div className='roadmap' id="roadmap">
        <div className="container">
          {/* <div className='row position-relative text-center roadmap-heading'>
            <img className="img-responsive mx-auto roadmap-bg-img" src="/Layer590.png" style={{ width:'70%' }}/>
              <h1 className='theme-heading textorange shadow-white position-absolute font-cbgb fontsize4rem' style={{top:'17px'}}> RoadMap </h1>
          </div> */}
          <div className='row'>
                <div className='col-lg-10 m-auto'>
                  <img src='/roadmap.png' className='w-100' />
                </div>
              </div>
        </div>
        <div className='container'>
          {/* May */}
          <div className='row'>
            <div className='col-lg-4 col-md-4 col-sm-4'>
              <div className='first-sec'>
                <div className='roadmap-title'>March 2022</div>
                <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> CBGB CGI website development</div></div>
                <br />
                <img className="img-responsive" src='./TerryOrk2-rmap.jpg' width='100%' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
              </div>
            </div>
            <div className='col-lg-3 col-md-3 col-sm-3 text-center'>
              <img className="img-responsive arrow-offset roadmap-arrow animate__animated animate__shakeY animate__infinite" src="/red-arrow.png" width='80%' height='auto'/>
            </div>
            <div className='col-lg-5 col-md-5 col-sm-5'>
              <div className='second-sec align-items-center justify-content-between flex-column flex-lg-row'>
                <div className='m-right'>
                  <div className='roadmap-title'>December, 2022</div>
                  <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> Launch of CBGB CGI tokens.</div>
                    <div className='d-flex'><div className='me-2'>-</div> Hosting of monthly Discord chat with filmmakers and behind the scene crew. </div>
                    <div className='d-flex'><div className='me-2'>-</div> The first 1000 owners of the NFT tokens will have their  names written on the walls of the animated club. </div>
                    <div className='d-flex'><div className='me-2'>-</div> 200 Super Duper Level holders will have their names added to the walls and be animated into the feature film. </div>
                    <div className='d-flex'><div className='me-2'>-</div> 21 Super F*cking Duper Level holders will have their  names added to the walls and be animated into the film. </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
           {/* June */}


          <div className='row mb-5'>
            <p className='after-sec roadmap-text text-center' style={{ color: '#6cda1f' }}><strong> *Film production Greenlight after 1000 NFTs are sold </strong></p>
          </div>
          <div className='row'>
              <div className='col-lg-5 col-md-5 col-sm-5'>
                  <div className='third-sec d-flex mb-5 justify-content-between flex-column flex-lg-row'>
                    <div className='order-1'>
                      <div className='roadmap-title'> February 2023</div>
                      <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> Deadline for receiving owner names from 1000 Super Level, the 200 Super Duper Level and the 21 Super F*cking Duper Level holders to be added to the walls of our animated club.</div>
                        <div className='d-flex'><div className='me-2'>-</div> Deadline for receiving owner photos to animate the likenesses of the 200 Super Duper Level and 21 Super F*cking Duper Level holders.</div>
                        <div className='d-flex text-nowrap'><div className='me-2'>-</div> Animation team will begin YOUR animation!</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-lg-3 col-md-3 col-sm-3 text-center'>
                  <img className="img-responsive arrow-offset roadmap-arrow animate__animated animate__shakeY animate__infinite" src="/red-arrow.png" width='80%' height='auto'/>
                </div>
                <div className='col-lg-4 col-md-4 col-sm-4'>
                  <img className="img-responsive order-2" src='./Lisa2CBGB-rmap.jpg' width='97%' height='auto' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
                </div>
          </div>


          {/* december */}
          <div className='row mt-2'>
              <div className='col-lg-5 col-md-5 col-sm-5 roadmap-mobile-hidden'>
                  <div className='forth-sec d-flex mb-5 align-items-center justify-content-between flex-column flex-lg-row'>
                    <img src='./Hilly2CBGB-rmap.jpg' className='img-responsive' width='80%' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
                  </div>
                </div>
                
                  <div className='col-lg-3 col-md-3 col-sm-3 text-center'>
                  <img className="img-responsive arrow-offset roadmap-arrow animate__animated animate__shakeY animate__infinite" src="/red-arrow.png" width='80%' height='auto'/>
                </div>

            <div className='col-lg-4 col-md-4 col-sm-4'>
                    <div className='m-right'>
                      <div className='roadmap-title'> June 2023</div>
                      <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> Quarterly showing of finished sections of the Director's cut will begin. This access is exclusive to token holders (all passes can view).</div>
                        <div className='d-flex'><div className='me-2'>-</div> Film production will continue.</div>
                      </div>
                    </div>
                  </div>
          
          </div>
           {/* december */}


          {/* February */}
          <div className='row'>

            <div className='col-lg-5 col-md-5 col-sm-5'>
                <div className='order-1'>
                  <div className='roadmap-title'> September 2023</div>
                  <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> Color check teasers of the film with filmmakers.</div>
                  </div>
                </div>
              </div>
          
            <div className='col-lg-3 col-md-3 col-sm-3 text-center'>
              <img className="img-responsive arrow-offset roadmap-arrow animate__animated animate__shakeY animate__infinite" src="/red-arrow-180.png" width='80%' height='auto'/>
            </div>  


            <div className='col-lg-4 col-md-4 col-sm-4'>
              <div className='fifth-sec d-flex justify-content-between align-items-center mb-5 flex-column flex-lg-row mt-up-img'>
                <img src='./Genya2CBGB-rmap.jpg' className='img-responsive order-2' width='97%' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
              </div>
            </div>
    

          </div>
           {/* February */}

           
          <div className='row'>
              <div className='col-lg-4 col-md-4 col-sm-4'>
                  <div className='sixth-sec d-flex justify-content-between align-items-center flex-column flex-lg-row mt-up-img'>
                    <img src='./Blondie2CBGB-rmap.jpg' className='img-responsive' width='100%' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
                  </div>
                </div>

                <div className='col-lg-4 col-md-4 col-sm-4 text-center'>
                  <img className="img-responsive arrow-offset roadmap-arrow animate__animated animate__shakeY animate__infinite" src="/red-arrow.png" width='50%' height='auto'/>
                </div>
        
                <div className='col-lg-4 col-md-4 col-sm-4'>
                  <div className='m-right'>
                    <div className='roadmap-title'>December 2023</div>
                    <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> Film production complete</div>
                    </div>
                  </div>
                </div>

          </div>
          <div className='row'>

          <div className='col-lg-5 col-md-5 col-sm-5'>
                <div className='order-1'>
                  <div className='roadmap-title'>January 2024</div>
                  <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> Drawings will begin for exclusive screening access of this new version to token holders</div>
                  </div>
                </div>
            </div>

                <div className='col-lg-3 col-md-3 col-sm-3 text-center'>
                  {/* <img className="img-responsive arrow-offset roadmap-arrow" src="/red-arrow.png" width='50%' height='auto'/> */}
                </div>
          
                <div className='col-lg-4 col-md-4 col-sm-4 roadmap-mobile-hidden'>
                  <div className='seventh-sec d-flex justify-content-between align-items-center mb-5 flex-column flex-lg-row mt-up-img'>
                    <img src='./JoeyRamone2CBG-rmap.jpg' className='order-2 img-responsive' width='97%' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
                  </div>
                </div>

          </div>

          {/* <div className='row'>
            <div className='col-lg-4'></div>
          <div className='col-lg-4 col-md-4 col-sm-4 text-center'>
              <img className="img-responsive arrow-offset roadmap-arrow rotate-190" src="/red-arrow.png" width='50%' height='auto'/>
            </div>
            <div className='col-lg-4'></div>
          </div> */}
          <br />
          <div className='row'>
                  
              <div className='col-lg-5 col-md-5 col-sm-5'>
                  <div className='eighth-sec d-flex justify-content-between align-items-center mb-5 flex-column flex-lg-row mt-up-img'>
                    <img src='./Cheetah2CBGB-rmap.jpg' className='img-responsive' width='80%' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
                  </div>
                </div>

                  <div className='col-lg-3 col-md-3 col-sm-3 text-center'>
                    <img className="img-responsive arrow-offset roadmap-arrow animate__animated animate__shakeY animate__infinite" src="/red-arrow.png" width='80%' height='auto'/>
                  </div>
          
                <div className='col-lg-4 col-md-4 col-sm-4'>
                      <div className='m-right'>
                        <div className='roadmap-title'>March 2024</div>
                        <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> Advanced Screening of the new Director's cut version. </div>
                        </div>
                      </div>
                  </div>

          </div>
          <br />
          <div className='row'>
                
                 <div className='col-lg-5 col-md-5 col-sm-5'>
                        <div className='order-1 text-left'>
                          <div className='roadmap-title'>
                            <img src='./Spring 2024.png' className='noShadow' />
                          </div>
                          <div className='roadmap-text' style={{ fontFamily: 'Chelsea Market' }}><div className='d-flex'><div className='me-2'>-</div> The new side-by-side version will be released.</div>
                            <div className='d-flex'><div className='me-2'>-</div> Exclusive Q&A with filmmakers.</div>
                            <div className='d-flex'><div className='me-2'>-</div> Enjoy watching your animated self on screen!</div>
                          </div>
                        </div>
                  </div>

                <div className='col-lg-3 col-md-3 col-sm-3'>
                </div>
          
                  <div className='col-lg-4 col-md-4 col-sm-4'>
                  <div className='ninth-sec d-flex justify-content-between mb-5 flex-column flex-lg-row align-items-center mt-up-img'>
                    <img src='./IggyPop2CBGB-rmap.jpg' className='img-responsive order-2' width='97%' style={{ boxShadow:'1px 1px 13px 6px #8b23c1' }} />
                  </div>
                </div>  

          </div>
        </div>
      </div>

      <div className='behind position-relative'>
        <div className="container-fluid">
          {/* <div className='row position-relative'>
              <img className="img-responsive mx-auto behind-bg-img" src="/Layer590.png" style={{ width:'82%'}} />
                <h1 className='textorange shadow-white theme-heading position-absolute font-cbgb font-weight400 fontsize4rem' style={{top:'30px'}}> Who is Behind This? </h1>
            </div> */}
            <div className='row'>
                <div className='col-lg-10 m-auto'>
                  <img src='/heading-behind.png' className='w-100' />
                </div>
              </div>
        </div>
        <br />
        <p className='sub-headline'>
        The filmmaker behind <span> the new improved Director's Cut animated side-by-side</span> <span className='cheappine' style={{ fontSize:'34px' }}>CBGB CGI </span> is the same person who made
the original 2013 CBGB movie. He is partnering with his longtime friend, a genius filmmaker and an outrageously talented animator.
        </p>
      
        <br />

        <br />
        <div className='container'>
          <div className='row'>
            <div className='col-lg-3 px-0 mb-5 mb-lg-0'>
              <img src='./Randy Miller (Director) and Alan Rickman on Nobel Son.png' className='img-fluid' />
              <div className='behind-headline'>
              <img src='./RANDALL MILLER.png' />
              </div>
              <p className='behind-text'>
                Writer/Director Randall Miller is the director of CBGB, Bottle Shock, Coffee Wars, Nobel Son, Houseguest, Class Act and many more!
                <br />Check him out here:

              </p>
              <br />
              <a className='imdb' href='https://www.imdb.com/name/nm0589168/' target="_blank">

                <img src='./IMDB_Logo_2016.svg.png' />
              </a>
            </div>

            <div className='col-lg-6 mb-5 mb-lg-0 pt-2 px-5'>
              <img src='./Michael-&-Randy.jpg' className='img-fluid mt-1' />
              <p className='behind-text mt-2'>
              Michael and Randy will be conducting <br/> monthly on-air AMAs <br/> <span className='textyellow d-sm-block'> exclusively for all NFT holders </span> on the film business, their experiences, <br />entrepreneurship and everything  <br />in between. </p>
              <p className='behind-text'> A masterclass in how to navigate <br /> the entertainment business.  </p>
              <br />
              <a className='amazon' href="https://www.amazon.com/CBGB-Alan-Rickman/dp/B07Q2G9XGM/ref=sr_1_1?crid=291NR5YK2OQOY&keywords=cbgb+prime+video&qid=1649397679&s=instant-video&sprefix=Cbgb%2Cinstant-video%2C386&sr=1-1" target="_blank">
                Watch the Original CBGB on
                <img src='./image 42.png' />
              </a>
            </div>

            <div className='col-lg-3 px-0'>
              <img src='./Screen Shot 2022-02-16 at 5.58.png' className='img-fluid' /><br />
              <div className='behind-headline'>
              <img src='./Michael Davis.png' />
              </div>
              <p className='behind-text'>
                Writer/Director Michael Davis is the director of Shoot 'Em Up, 100 Girls, 8 Days a Week!
                <br />Check him out here:
              </p>
              <br /><br />
              <a className='imdb' href='https://www.imdb.com/name/nm0205157/' target="_blank">

                <img src='./IMDB_Logo_2016.svg.png' />
              </a>
            </div>

          </div>
          <br />
          {/* <p className='behind-bottom-text'>
            Michael and Randy are the creative force behind this endeavor, they are highly <br /> experienced filmmakers who have brought films both large and small to the big screen and streaming audiences worldwide.
          </p><br />
          <a className='amazon' href="https://www.amazon.com/CBGB-Alan-Rickman/dp/B07Q2G9XGM/ref=sr_1_1?crid=291NR5YK2OQOY&keywords=cbgb+prime+video&qid=1649397679&s=instant-video&sprefix=Cbgb%2Cinstant-video%2C386&sr=1-1" target="_blank">
            Watch the Original CBGB on
            <img src='./image 42.png' />
          </a> */}
        </div>
        <div className='animate-person hilly-mom-gif'>
          <img src='https://cbgb.mypinata.cloud/ipfs/QmcxhPTm94unWzrjSKjXy551s4papARRCBfPUKYViibny5/Hilly%27s-Mom-for-smaller-site.gif' alt="hilly mom small gif" />
        </div>
      </div>

      <div className='keep'>
      <div className="container-fluid">
        {/* <div className='row position-relative'>
           <img className="img-responsive mx-auto keep-bg-img" src="/KEEP UP WITH US - Copy.png" style={{ width:'85%' }} />
           <h1 className='position-absolute text-white theme-heading font-cbgb font-weight400 fontsize4rem' style={{top:'30px', background: 'none'}}> Keep Up With US </h1>
          </div> */}
          <div className='row'>
              <div className='col-lg-10 m-auto'>
                <img src='/heading-keep-up.png' className='w-100' />
              </div>
            </div>
        </div>
        <br /><br /><br />
        <div className='container-fluid'>
        <Slider {...settings}>
          <img src='./Cbgb-bar-1.png' className='img-responsive left-club-img' width='100%' />
          <img src='./Cbgb-Bar-set-2.png' className='img-responsive mid-club-img' width='100%' />
          <img src='./Cbgb-bar-details3.png' className='img-responsive right-club-img' width='100%' />
          <img src='./Cbgb-bar-1.png' className='img-responsive left-club-img' width='100%' />
          <img src='./Cbgb-Bar-set-2.png' className='img-responsive mid-club-img' width='100%' />
          <img src='./Cbgb-bar-details3.png' className='img-responsive right-club-img' width='100%' />
        </Slider >
          {/* <div className='row'>
            <div className='col-4'>
              <img src='./Cbgb-bar-1.png' className='img-responsive left-club-img' width='100%' />
            </div>
            <div className='col-4'>
              <img src='./Cbgb-Bar-set-2.png' className='img-responsive mid-club-img' width='100%' />
            </div>
            <div className='col-4'>
              <img src='./Cbgb-bar-details3.png' className='img-responsive right-club-img' width='100%' />
            </div>
          </div> */}
        <br />
        <br />
          <div className='row'>
            <div className='col-12'>
              <br /><br />
              <p className='text'>
                We will hold monthly online meetings connecting our NFT partners with the artists and animators who are reimagining the original live-action film into a wild new side-by-side animation/live action Director's Cut. 
                And when the film is complete, our token holders will get first premiere access to the film before anyone else  has seen it. Our Intention is to shake things up in pure punk fashion. Enough waiting around for some big studio 
                with their bureaucratic pencil pushers to deem us worthy. We are <span className='textyellow'>CBGB CGI</span> and we are ready to rock!
              </p>
              <br />
              <a className='discord' href='https://discord.gg/kezTCUpK5H' target="_blank">
                Discord
              </a>
            </div>

          </div>
        </div>
      </div>
      <div className='faq position-relative'>
        <div className='row position-relative text-center faq-heading'>
            <img src="/Layer592.png" className='img-fluid m-auto faq-bg-img' style={{width:'65%'}} />
              <h1 className='textorange shadow-white theme-heading position-absolute font-cbgb font-weight400 fontsize4rem' style={{top:'14px'}}> Faq </h1>
        </div> 
        <br /><br />
        <div className='container'>
          <div className='row'>
            <div className='col-12'>
              <Accordion title="Where can we find the smart contract?">
                Yes, you can find our verified smartcontract <a target="_blank" href='https://etherscan.io/address/0x7571F1F750dba62a905D8eA327E5DFCaaCb6ddA3'>here</a>.
              </Accordion>
              <Accordion title="What is the minting price?">
               Super Level NFTs : 0.5 ETH
                <br />
                Super Duper Level NFTs : 5 ETH
                <br />
                Super F*cking Duper NFTs : 10 ETH
              </Accordion>
              <Accordion title="What is CBGB and CBGB CGI?">
                CBGB is a feature film <a href='https://www.imdb.com/title/tt1786751/'>(https://www.imdb.com/title/tt1786751/)</a> that follows the story of Hilly Kristal's New York club from its concept as a venue for "Country, Bluegrass and Blues" to what it ultimately became: the birthplace of underground rock 'n roll and punk. CBGB CGI is the next step in evolution of punk. Through the wizardry of Michael Davis' animation and the collaboration with director Randall Miller, token owners will have the power to transform the original 2013 CBGB MOVIE into the enhanced side-by-side animated Director’s Cut. 
              </Accordion>
              <Accordion title="When will these drop?">
                December 1, 2022              </Accordion>
              <Accordion title="How do I mint CBGB CGI?">
                <br />
                1) Download the <a href='https://metamask.io'>metamask.io</a> extension for the Chrome/Brave browser or app on mobile. This will allow you to make purchases with Ethereum. It can be found in the extensions tab. If you are on mobile, you must use the Metamask App Browser.
                <br />2) You can purchase Ethereum through the Metamask Wallet using Wyre or Send Ethereum from an exchange like Coinbase.

                <br />3) Click on Connect at the top of the page and connect your Metamask. Once joined, you will be able to purchase the NFTs in the mint section. You will be prompted to sign your transaction. FYI, transactions will incur a gas fee.

                <br />4) Once you have made your purchase, your CBGB CGI NFTs will be viewable in your wallet and on OpenSea.
              </Accordion>
              <Accordion title="What are the Terms of Service?">
                <br />
                <p> TERMS OF SERVICE </p>
            ----
               <p> OVERVIEW </p>
               <p> This website is operated by Film CBGB, LLC. Throughout the site, the terms “we”, “us,”
                and “our” refer to Film CBGB, LLC. Film CBGB, LLC offers this website, including all
                information, tools, and services available from this site to you, the user, conditioned
                upon your acceptance of all terms, conditions, policies, and notices stated here.
                By visiting our site and/or purchasing an NFT from us, you engage in our “Service” and
                agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”),
                including those additional terms and conditions and policies referenced herein and/or
                available by hyperlink. These Terms of Service apply to all users of the site, including
                without limitation users who are browsers, vendors, customers, merchants, and/ or
                contributors of content.</p>
                <p> Please read these Terms of Service carefully before accessing or using our website. By
                accessing or using any part of the site, you agree to be bound by these Terms of
                Service. If you do not agree to all the terms and conditions of this agreement, then you
                may not access the website or use any services.</p>
                <p> Any new features or tools which are added to the CBGBCGI.com website shall also be
                subject to the Terms of Service. You can review the most current version of the Terms
                of Service at any time on this page. We reserve the right to update, change, or replace
                any part of these Terms of Service by posting updates and/or changes to our website. It
                is your responsibility to check this page periodically for changes. Your continued use of
                or access to the website following the posting of any changes constitutes acceptance of
                those changes.</p>
                <p> SECTION 1 - ONLINE TERMS </p>
                <p> By agreeing to these Terms of Service, you represent that you are at least the age of
                majority in your state or province of residence, or that you are the age of majority in your
                state or province of residence and you have given us your consent to allow any of your
                minor dependents to use this sit. </p>
                <p> You may not use our NFT for any illegal or unauthorized purpose nor may you, in the
                use of the Service, violate any laws in your jurisdiction (including but not limited to
                copyright laws). </p>
                <p> You must not transmit any worms or viruses or any code of a destructive nature.
                A breach or violation of any of the Terms will result in an immediate termination of your
                Services. </p>

                <p> SECTION 2 - GENERAL CONDITIONS </p>
                <p> We reserve the right to refuse service to anyone for any reason at any time.
                You understand that your content may be transferred unencrypted and involve (a)
                transmissions over various networks; and (b) changes to conform and adapt to technical
                requirements of connecting networks or devices. </p>
                 <p> You agree not to reproduce, duplicate, copy, or exploit any portion of the Service, use of
                the Service, NFTs or access to the Service or any contact on the website through which
                the service is provided, without express written permission by us.</p>
                <p> The headings used in this agreement are included for convenience only and will not limit
                or otherwise affect these Terms.</p>
                <p> SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION </p>
                <p> We are not responsible if information made available on this site is not accurate,
                complete, or current. The material on this site is provided for general information only
                and should not be relied upon or used as the sole basis for making decisions without
                consulting primary, more accurate, more complete or more timely sources of
                information. Any reliance on the material on this site is at your own risk.</p>
                <p> This site may contain certain historical information. Historical information, necessarily, is
                not current and is provided for your reference only. We reserve the right to modify the
                contents of this site at any time, but we have no obligation to update any information on
                our site. You agree that it is your responsibility to monitor changes to our site. </p>
                <p>
                  By providing Film CBGB LLC with your name or band name you are giving Film CBGB LLC permission to use that name and any trademark or copyright in the film in perpetuity in all forms of media known or unknown.
                </p>
                <p> SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES </p>
                <p> Prices for our NFTs are subject to change without notice. </p>
                <p>  We reserve the right at any time to modify or discontinue the Service (or any part or
                content thereof) without notice at any time. </p>
                <p> We shall not be liable to you or to any third-party for any modification, price change,
                suspension, or discontinuance of the Service. </p>
                <p> SECTION 5 - PRODUCTS OR SERVICES (if applicable) </p>
                <p> Certain products or services may be available exclusively online through the website.
                These products or services may have limited quantities and are subject to availability.
                We have made every effort to display as accurately as possible the colors and images
                of our products that appear on the website. We cannot guarantee that your computer
                monitor&#39;s display of any color will be accurate.</p>
                <p> We reserve the right, but are not obligated, to limit the sales of our products or Services
                to any person, geographic region, or jurisdiction. We may exercise this right on a case-
                by-case basis. We reserve the right to limit the quantities of any products that we offer.
                All descriptions of products or product pricing are subject to change at any time without
                notice, at the sole discretion of Film CBGB, LLC. We reserve the right to discontinue
                any product at any time. Any offer for any product or service made on this site is void
                where prohibited.</p>
                <p> We do not warrant that the quality of any products, services, information, or other
                material purchased or obtained by you will meet your expectations or that any errors in
                the Service will be corrected.</p>

                <p> SECTION 6 - OPTIONAL TOOLS </p>
                <p> We may provide you with access to third-party tools which we neither monitor nor have
                any control nor input over. </p>
                <p> You acknowledge and agree that we provide access to such tools “as is” and “as
                available” without any warranties, representations, or conditions of any kind and without
                any endorsement. We shall have no liability whatsoever arising from or relating to your
                use of optional third-party tools. </p>
                <p> Any use by you of optional tools offered through the site is entirely at your own risk and
                discretion and you should ensure that you are familiar with and approve of the terms on
                which tools are provided by the relevant third-party provider(s).</p>
                <p>We may also, in the future, offer new services and/or features through the website
                (including, the release of new tools and resources). Such new features and/or services
                shall also be subject to these Terms of Service.</p>

               <p> SECTION 7 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS </p>
               <p> If, at our request, you send certain specific submissions (for example contest entries) or
                without a request from us you send creative ideas, suggestions, proposals, plans, or
                other materials, whether online, by email, by postal mail, or otherwise (collectively,
                &#39;comments&#39;), you agree that we may, at any time, without restriction, edit, copy, publish,
                distribute, translate, and otherwise use in any medium any comments that you forward
                to us. We are and shall be under no obligation (1) to maintain any comments in
                confidence; (2) to pay compensation for any comments; or (3) to respond to any
                comments.</p>

              <p>  We may, but have no obligation to, monitor, edit, or remove content that we determine
                in our sole discretion are unlawful, offensive, threatening, libelous, defamatory,
                pornographic, obscene, or otherwise objectionable or violates any party’s intellectual
                property or these Terms of Service. </p>
               <p> You agree that your comments will not violate any right of any third-party, including
                copyright, trademark, privacy, personality, or other personal or proprietary right. You
                further agree that your comments will not contain libelous or otherwise unlawful,
                abusive, or obscene material, or contain any computer virus or other malware that could
                in any way affect the operation of the Service or any related website. You may not use a
                false email address, pretend to be someone other than yourself, or otherwise mislead
                us or third-parties as to the origin of any comments. You are solely responsible for any
                comments you make and their accuracy. We take no responsibility and assume no
                liability for any comments posted by you or any third-party.</p>
                <p> SECTION 8 - PERSONAL INFORMATION </p>
                <p> Your submission of personal information through the website is governed by our Privacy
                Policy. To view our Privacy Policy, refer to the link provided.</p>
               <p> SECTION 9 - ERRORS, INACCURACIES AND OMISSIONS </p>
               <p> Occasionally there may be information on our site or in the Service that contains
                typographical errors, inaccuracies, or omissions that may relate to product descriptions,
                pricing, promotions, offers, product shipping charges, transit times, and availability. We
                reserve the right to correct any errors, inaccuracies, or omissions, and to change or
                update information or cancel orders if any information in the Service or on any related
                website is inaccurate at any time without prior notice (including after you have submitted
                your order). </p>
                <p> We undertake no obligation to update, amend, or clarify information in the Service or on
                any related website, including without limitation, pricing information, except as required
                by law. No specified update or refresh date applied in the Service or on any related
                website should be taken to indicate that all information in the Service or on any related
                website has been modified or updated. </p>
                <p> SECTION 10 - PROHIBITED USES </p>
               <p> In addition to other prohibitions as set forth in the Terms of Service, you are prohibited
                from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to
                perform or participate in any unlawful acts; (c) to violate any international, federal,
                provincial, or state regulations, rules, laws, or local ordinances; (d) to infringe upon or
                violate our intellectual property rights or the intellectual property rights of others; (e) to
                harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
                based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or
                disability; (f) to submit false or misleading information; (g) to upload or transmit viruses
                or any other type of malicious code that will or may be used in any way that will affect
                the functionality or operation of the Service or of any related website, other websites, or
                the Internet; (h) to collect or track the personal information of others; (i) to spam, phish,
                pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k)
                to interfere with or circumvent the security features of the Service or any related
                website, other websites, or the Internet. We reserve the right to terminate your use of
                the Service or any related website for violating any of the prohibited uses.</p>
               <p> SECTION 11 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY </p>
               <p> We do not guarantee, represent, or warrant that your use of our service will be
               <p> uninterrupted, timely, secure, or error-free.</p>
                We do not warrant that the results that may be obtained from the use of the service will
                be accurate or reliable. </p>
                <p> You agree that from time to time we may remove the service for indefinite periods of
                time or cancel the service at any time without notice to you. You expressly agree that
                your use of or inability to use the service is at your sole risk. The service and all
                products and services delivered to you through the service are (except as expressly
                stated by us) provided &#39;as is&#39; and &#39;as available&#39; for your use without any representation,
                warranties, or conditions of any kind, either express or implied, including all implied
                warranties or conditions of merchantability, merchantable quality, fitness for a particular
                purpose, durability, title, and non-infringement. </p>
               <p> In no case shall Film CBGB, LLC, CBGB CGI, Unclaimed Freight Productions Inc., or
                their directors, officers, employees, affiliates, agents, contractors, interns, suppliers,
                service providers, or licensors be liable for any injury, loss, or claim, or any direct,
                indirect, incidental, punitive, special, or consequential damages of any kind, including
                without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs,
                or any similar damages, whether based in contract, tort (including negligence), strict
                liability, or otherwise, arising from your use of any of the service or any products
                procured using the service, or for any other claim related in any way to your use of the
                service or any product, including, but not limited to, any errors or omissions in any
                content, or any loss or damage of any kind incurred as a result of the use of the service
                or any content (or product) posted, transmitted, or otherwise made available via the
                service, even if advised of their possibility. Because some states or jurisdictions do not
                allow the exclusion or the limitation of liability for consequential or incidental damages,
                in such states or jurisdictions, our liability shall be limited to the maximum extent
                permitted by law. </p>
                <p> SECTION 12 - INDEMNIFICATION </p>
                <p> You agree to indemnify, defend, and hold harmless Film CBGB, LLC, Unclaimed Freight
                Productions Inc., CBGB CGI and our parent, subsidiaries, affiliates, partners, officers,
                directors, agents, contractors, licensors, service providers, subcontractors, suppliers,
                interns, and employees from any claim or demand, including reasonable attorneys’ fees,
                made by any third-party due to or arising out of your breach of these Terms of Service
                or the documents they incorporate by reference, or your violation of any law or the rights
                of a third-party. </p>
                <p> SECTION 13 - SEVERABILITY </p>
                <p> In the event that any provision of these Terms of Service is determined to be unlawful,
                void, or unenforceable, such provision shall nonetheless be enforceable to the fullest
                extent permitted by applicable law, and the unenforceable portion shall be deemed to
                be severed from these Terms of Service, and such determination shall not affect the
                validity and enforceability of any other remaining provisions. </p>
                <p> SECTION 14 - TERMINATION </p>
                <p> The obligations and liabilities of the parties incurred prior to the termination date shall
                survive the termination of this agreement for all purposes. </p>
                <p> These Terms of Service are effective unless and until terminated by either you or us.
                You may terminate these Terms of Service at any time by notifying us that you no
                longer wish to use our Services or when you cease using our site. If, in our sole
                judgment, you fail, or we suspect that you have failed, to comply with any term or
                provision of these Terms of Service, we also may terminate this agreement at any time
                without notice, and you will remain liable for all amounts due up to and including the
                date of termination; and/or accordingly we may deny you access to our Services (or any
                part thereof).</p>
                <p> SECTION 15 - ENTIRE AGREEMENT </p>
                <p> Any failure on our part to exercise or enforce any right or provision of these Terms of
                Service shall not constitute a waiver of such right or provision.
                These Terms of Service and any policies or operating rules posted by us on this site or
                in respect to The Service constitute the entire agreement and understanding between
                you and us and govern your use of the Service, superseding any prior or
                contemporaneous agreements, communications, and proposals, whether oral or written,
                between you and us (including, but not limited to, any prior versions of the Terms of
                Service). Any ambiguities in the interpretation of these Terms of Service shall not be
                construed against the drafting party.</p>
                <p> SECTION 16 - GOVERNING LAW </p>
               <p> These Terms of Service and any separate agreements whereby we provide you
                Services shall be governed by and construed in accordance with the laws of California.
                Film CBGB LLC is located in Pasadena, California. </p>

                <p> SECTION 17 - CHANGES TO TERMS OF SERVICE </p>
                <p> You can review the most current version of the Terms of Service at any time at this
                page.</p> 
                <p> We reserve the right, at our sole discretion, to update, change, or replace any part of
                these Terms of Service by posting updates and changes to our website. It is your
                responsibility to check our website periodically for changes. Your continued use of or
                access to our website or the Service following the posting of any changes to these
                Terms of Service constitutes acceptance of those changes. </p>

               <p> SECTION 18 - CONTACT INFORMATION </p>
                <p> Questions about the Terms of Service should be sent to us at uncindie@gmail.com.</p>

                <p> PRIVACY POLICY </p>

                <p> This Privacy Policy describes how your personal information is collected, used, and
                shared when you visit or make a purchase from www.cbgbcgi.com (the “Site”).</p>
                <p> PERSONAL INFORMATION WE COLLECT  </p>
                <p> When you visit the Site, we automatically collect certain information about your device,
                including information about your web browser, IP address, time zone, and some of the
                cookies that are installed on your device. Additionally, as you browse the Site, we
                collect information about the individual web pages or products that you view, what
                websites or search terms referred you to the Site, and information about how you
                interact with the Site. We refer to this automatically-collected information as “Device
                Information.”</p>
                <p> We collect Device Information using the following technologies: </p>
                <ul className='terms'>
                  <li>
                    <p>“Cookies” are data files that are placed on your device or computer and often
                    include an anonymous unique identifier. For more information about cookies, and how
                    to disable cookies, visit http://www.allaboutcookies.org. </p>
                  </li>
                  <li>
                    <p>“Log files” track actions occurring on the Site, and collect data including your IP
                      address, browser type, Internet service provider, referring/exit pages, and date/time
                      stamps.</p>
                  </li>
                  <li>
                    <p>“Web beacons,” “tags,” and “pixels” are electronic files used to record information
                      about how you browse the Site.</p>
                  </li>
                </ul>

                <p> Additionally, when you make a purchase or attempt to make a purchase through the
                Site, we may collect certain information from you, including your name, address,
                payment information (including crypto wallet information), email address, and phone
                number.  We refer to this information as “Order Information.” </p>
                <p> When we talk about “Personal Information” in this Privacy Policy, we are talking both
                about Device Information and Order Information.</p>
                <p> HOW DO WE USE YOUR PERSONAL INFORMATION? </p>
                <p> We use the Order Information that we collect generally to fulfill any orders placed
                through the Site (including processing your payment information, arranging for shipping,
                and providing you with invoices and/or order confirmations).  Additionally, we use this
                Order Information to: Communicate with you; Screen our orders for potential risk or
                fraud; and, when in line with the preferences you have shared with us, provide you with
                information or advertising relating to our products or services. </p>
                <p> We use the Device Information that we collect to help us screen for potential risk and
                fraud (in particular, your IP address), and more generally to improve and optimize our
                Site (for example, by generating analytics about how our customers browse and interact
                with the Site, and to assess the success of our marketing and advertising campaigns).
                We share your Personal Information with third parties to help us use your Personal
                Information, as described above.  We also use Google Analytics to help us understand
                how our customers use the Site. You can read more about how Google uses your
                Personal Information here:  https://www.google.com/intl/en/policies/privacy/.  You can
                also opt-out of Google Analytics here:  https://tools.google.com/dlpage/gaoptout.
                Finally, we may also share your Personal Information to comply with applicable laws
                and regulations, to respond to a subpoena, search warrant, or other lawful request for
                information we receive or to otherwise protect our rights.</p>
                <p> As described above, we use your Personal Information to provide you with targeted
                advertisements or marketing communications we believe may be of interest to you.  For
                more information about how targeted advertising works, you can visit the Network
                Advertising Initiative’s (“NAI”) educational page
                at http://www.networkadvertising.org/understanding-online-advertising/how-does-it-
                work. </p>
               <p> You can opt out of targeted advertising by: </p>
               <div className='ps-4'>
                <p>FACEBOOK - https://www.facebook.com/settings/?tab=ads</p>
                <p>
                  GOOGLE - https://www.google.com/settings/ads/anonymous
                </p>
                <p>
                  BING - https://advertise.bingads.microsoft.com/en-us/resources/policies/personalized-ads 
                </p>
               </div>

               <p>Additionally, you can opt out of some of these services by visiting the Digital Advertising
                Alliance’s opt-out portal at:  http://optout.aboutads.info/. </p>
                <p> DO NOT TRACK </p>
                <p> Please note that we do not alter our Site’s data collection and use practices when we
                see a Do Not Track signal from your browser. </p>

                <p> YOUR RIGHTS </p>
                <p> If you are a European resident, you have the right to access personal information we
                hold about you and to ask that your personal information be corrected, updated, or
                deleted. If you would like to exercise this right, please contact us through the contact
                information below. </p>
                <p> Additionally, if you are a European resident we note that we are processing your
                information in order to fulfill contracts we might have with you (for example if you make
                an order through the Site) or otherwise to pursue our legitimate business interests listed
                above.  Additionally, please note that your information will be transferred outside of
                Europe, including to Canada and the United States. </p>

                <p> DATA RETENTION </p>
                <p> When you place an order through the Site, we will maintain your Order Information for
                our records unless and until you ask us to delete this information.
                The Site is not intended for individuals under the age of 16. CBGB, the movie, was
                rated “R” in the US for strong language, acts of violence, drug use, and sexual content.<br /><br />
                CHANGES </p>
                <p> We may update this privacy policy from time to time in order to reflect, for example,
                changes to our practices or for other operational, legal, or regulatory reasons.<br /><br />
                CONTACT US </p>
                <p> For more information about our privacy practices, if you have questions, or if you would
                like to make a complaint, please contact us by e-mail at uncindie@gmail.com or by mail
                using the details provided below: </p>
                <p> Film CBGB, LLC. 556 S. Fair Oaks Ave. #101-212, Pasadena, CA, 91105, United
                States </p>
              </Accordion>
            </div>

          </div>

          <footer>

            <div className='first d-flex justify-content-between flex-column flex-lg-row'>
              <div className='mb-4 mb-lg-0'>
                Connect with us on Discord:
                <a href='https://discord.gg/kezTCUpK5H' target="_blank">
                  <img className='ms-2' src='./discord.svg' />
                </a>

              </div>
              <div>
                © 2022 Film CBGB LLC
              </div>
            </div>
          </footer>
        </div>
        <div className='animate-person genya-gif'>
          <img src='https://cbgb.mypinata.cloud/ipfs/QmcxhPTm94unWzrjSKjXy551s4papARRCBfPUKYViibny5/Genya-smaller-for-site.gif' alt="genya gif" />
        </div>
      </div>
    </div>
  );
}

const Accordion = ({ title, children }) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <div className="accordion-wrapper">

      <div
        className={`accordion-title ${isOpen ? "open" : ""}`}
        onClick={() => setOpen(!isOpen)}
      >
        {title}
      </div>
      <div className={`accordion-item ${!isOpen ? "collapsed" : ""}`}>
        <div className="accordion-content">{children}</div>
      </div>
    </div>
  );
};

class CountDown extends Component {
  state = {
    remaining: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    },
    isExpired: false
  };
  // used to set and clear interval
  timer;
  // used to calculate the distance between "current date and time" and the "target date and time"
  distance;

  componentDidMount() {
    this.setDate();
    this.counter();

    new WOW.WOW({
      live: false
    }).init();
  }

  setDate = () => {
    const { targetDate, targetTime } = this.props,
      // Get todays date and time
      now = new Date().getTime(),
      // Set the date we're counting down to
      countDownDate = new Date(targetDate + " " + targetTime).getTime();

    // Find the distance between now and the count down date
    this.distance = countDownDate - now;

    // target date and time is less than current date and time
    if (this.distance < 0) {
      clearInterval(this.timer);
      this.setState({ isExpired: true });
    } else {
      this.setState({
        remaining: {
          /*Months: Math.floor(this.distance / (1000 * 60 * 60 * 24) / 31),*/
          days: Math.floor(this.distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (this.distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((this.distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((this.distance % (1000 * 60)) / 1000)
        },
        isExpired: false
      });
    }
  };

  counter = () => {
    this.timer = setInterval(() => {
      this.setDate();
    }, 1000);
  };

  render() {
    const { remaining, isExpired } = this.state,
      { targetDate, targetTime } = this.props;

    return (
      <Fragment>
        {!isExpired && targetDate && targetTime ? (
            <div className="container">
              <div className="row">
                <div className="col-4">
                </div>
                <div className="col-lg-4 col-md-4 col-sm-6 col-12 px-5">
                  <div className="bg-clock row px-3">
                    {Object.entries(remaining).map((el, i) => (
                      <div className="col-3 p-0">
                        <div key={i} className="entry">
                          <div key={el[1]} className="entry-value">
                            <span className="count ">{el[1]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-4">
                </div>
              </div>
            </div>
        ) : (
          <p className="alert-danger">Expired</p>
          // 
        )}
      </Fragment>
    );
  }
}
export default Home;
