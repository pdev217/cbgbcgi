import logo from '../logo.svg';
import Header from '../components/Header'
import React, { useState, useEffect } from 'react';

import '../static/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function SuperFuckingDuperMint() {
  return (
    <div className="App">
      <div className='super-fucking'>
        <Header /><br /><br />
        <div className='super d-flex align-items-center flex-column flex-lg-row'>
          <div className='text'>
            <div className='title'>
              <img src='./Group 92.png' />
            </div><br />
            <p>
              We are <span>AUCTIONING</span> only <span className='twenty-one'>21</span><span> ANIMATED GIF</span>s
              of the leads of the film. It’s an exclusive club. Each is one of
              a kind muesum quality. Imagine our punkers at the New York MET.
              For those special 21 they will also <span>GET THEMSELVES ANIMATED INTO
                THE FILM</span>, their NAME ON THE WALL and one of the <span>TOKENS</span> too!
            </p>

            <a className="button buy" style={{ background: "red" }} href="https://testnets.opensea.io/collection/cbgb-v4">
              Buy Super F*cking Duper
            </a>
          </div>
          <div className='text'>
            <img src='https://i.ibb.co/zZF2KvN/Super-F-cking-Duper-trans4.gif' />
          </div>
        </div>

        <br /><br />
        <div className='animated-title'>
          <img src='./Group 94.png' className='img-fluid' />

        </div>
        {/* <div className='click'><br />
          (CLICK ON EACH TO EXPAND)
        </div> */}
        <br /><br /><br />
        <div className='container'>
          <div className='row'>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Hilly Dances(Smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Hilly Kristal</div>
              <div className='animated-text'>"Godfather of Punk"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/blondie dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Blondie</div>
              <div className='animated-text'>"First Lady of Punk"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/The Ramones Dance(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>The Ramones</div>
              <div className='animated-text'>"The First True Punk Rock Group"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Stiv Bators Dances (smaller).gif' className='img-fluid' />
              <div className='animated-headline'> Stiv Bators</div>
              <div className='animated-text'>"The first of Stiv Bators"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Lisa Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Lisa Kristal</div>
              <div className='animated-text'>"Brains Behind CBGB"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Cheetah Dances (smaller.gif' className='img-fluid' />
              <div className='animated-headline'>Cheetah Chrome</div>
              <div className='animated-text'>“Protopunk Guitarist”</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Merv Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Merv</div>
              <div className='animated-text'>"Bartender of CBGB" </div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Byrne Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>David Byrne</div>
              <div className='animated-text'>"Talking Heads"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Sleazy Agent Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Sleazy Agent</div>
              <div className='animated-text'>"One of Many"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Lou Reed Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Lou Reed</div>
              <div className='animated-text'>"Velvet Underground"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Patti Smith Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Patti Smith</div>
              <div className='animated-text'>“Punk Poet Laureate”</div>
            </div>

            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Genya Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Genya Ravan</div>
              <div className='animated-text'>“a.k.a. Goldie”</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Terry Ork dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Terry Ork</div>
              <div className='animated-text'>"Manager of Punk"</div>
            </div>
            <div className='col-lg-4'>
              <img src="https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Hilly's Mom Dances(smaller).gif" className='img-fluid' />
              <div className='animated-headline'>Hilly's Mom</div>
              <div className='animated-text'>"Mother of Godfather of Punk"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Iggy Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Iggy Pop</div>
              <div className='animated-text'>"Self-Mutilator First Stage Diver"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Mad Mountain Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Mad Mountain</div>
              <div className='animated-text'>"Protector of Punk"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Dog Dances(small).gif' className='img-fluid' />
              <div className='animated-headline'>Hilly’s Dog</div>
              <div className='animated-text'>"Jonathan the Dog"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Sting Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'> Sting</div>
              <div className='animated-text'>"The Police"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Idaho Dances(small).gif' className='img-fluid' />
              <div className='animated-headline'>Idaho</div>
              <div className='animated-text'>"Hilly’s Favorite Drunk"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Wayne County Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Wayne County</div>
              <div className='animated-text'>"First Drag Queen of Punk"</div>
            </div>
            <div className='col-lg-4'>
              <img src='https://cbgb.mypinata.cloud/ipfs/QmazprkjugkMwoYC3Q1PY5oQ8ZSQZZoPCFZb7ovWzHejKB/Taxi Dances(smaller).gif' className='img-fluid' />
              <div className='animated-headline'>Taxi</div>
              <div className='animated-text'>"First Sound Mixer of Punk"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperFuckingDuperMint;
