import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../modal/AuthModal";
import AuthModal2 from "../modal/AuthModal2";
import aceb from "../assets/aceb_banner1.png";
import westerneng from "../assets/western_eng.png";
import { getUser } from '../utils/auth';


const HomePage = () => {
  //user validation
  const user = getUser();
  //navigator
  const nav = useNavigate();
  //signup refs
  const sName = useRef();
  const sEmail = useRef();
  const sPassword = useRef();
  const sAccountType = useRef();
  //login refs
  const lEmail = useRef();
  const lPassword = useRef();
  //states
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  useEffect(async () => {
    if (user.position == "instructor"){
      nav("./instructor");
      window.location.reload(true);
    }else if (user.position == "dpt_admin" || user.position == "dpt_chair"|| user.position == "asc_chair" || user.position == "director"){
      nav("./admin");
      window.location.reload(true);
    }
	}, []);

  //modal controllers
  const showAuthModal = () => {
    setShow(true)
  }
  const showAuthModal2 = () => {
    setShow2(true) 
  }
  //submit handlers
  const signUp = async (event) => {
    event.preventDefault();
    const signUpObj = {
      name: sName.current.value,
      email: sEmail.current.value, 
      pswrd: sPassword.current.value,
      psn: sAccountType.current.value,
    }
    const res = await fetch(`/api/signUp`,{
      method: 'POST',
      headers: { "Content-Type": "application/json" },
			body: JSON.stringify(signUpObj),
    });
    alert(JSON.stringify(res.status))
  }

  const login = async (event) => {
    event.preventDefault();
    const loginObj = {
      email:lEmail.current.value,
      pswrd:lPassword.current.value,
    }
    const res = await fetch(`/api/login`,{
      method: 'POST',
      headers: { "Content-Type": "application/json" },
			body: JSON.stringify(loginObj),
    });
    if (res.ok){
      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data[1]));
      const position = data[1].position
      if (position == "instructor"){
        nav("./instructor");
        window.location.reload(true);
      }else if (position == "dpt_admin" || position == "dpt_chair"|| position == "asc_chair" || position == "director"){
        nav("./admin");
        window.location.reload(true);
      }
    }else{
      alert("The credentials you entered are incorrect/missing. Please try again.")
    }
  }

  const fieldStyle = {
    display:"block",
    width: "90%",
    marginLeft:"auto",
    marginRight: "auto",

  }

  const selectStyle = {
    display: "block",
    width: "93%",
    marginLeft: "auto",
    marginRight: "auto",
  }
  const authButtonStyle = {
    backgroundColor: "#3F3E3E",
    border: "None",
    color: "#FFFFFF",
    padding: "15px 32px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    cursor: "pointer",
  }

  const buttonStyle = 
    {
      backgroundColor: "#4F2683",
      border: "none",
      color: "white",
      padding: "15px 32px",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      fontSize: "16px",
      margin: "4px 2px",
      cursor: "pointer",
    }
    
    const logoStyle = {
      height: "9vh",
      width: "15vw",
      top: 50,
      left: 0,
      position: "absolute",
    }
    const topmenubar= {
      backgroundColor: "#424141",
      color: "white",
      height: 45,
      margin: 0,
    }

  return (
    <>
      <body>
        <div class="topmenubar" style = {topmenubar}>
          <h1 class ="managertitlehomepage" style = {topmenubar}>Course Outlines Manager</h1>
        </div>
        <div class="image">
          <img
            src={westerneng}
            alt=""
            style={logoStyle}
          />
          <img
            src={aceb}
            alt=""
            style={{
              opacity: 0.5,
              width: "100%",
              height: "50vh",
            }}
          />
          <div
            class="text"
            style={{
              padding: "2px",
              backgroundColor: "#EAEAEA",
            }}
          >
            <p class="infoText" style={{ fontSize: "20px", textAlign:"center"}}>
              Welcome to Western Engineering's Course Outline Manager for the
              department of Electrical and Computer Engineering.
              <br />
              Please sign in with your western email or create an account
            </p>
          </div>
          <div class="middle" style={{ textAlign: "center", marginTop:"3vh"}}>
            <button
              style={buttonStyle}
              onClick = {() => showAuthModal()}
            >
              Sign Up
            </button>
            <button
              style={buttonStyle}
              onClick = {() => showAuthModal2()}
            >
              Log In
            </button>
          </div>
        </div>
      </body>
      <AuthModal onClose={() => setShow(false)} show={show}>
        <form onSubmit = {signUp}>
        <div class="" style = {{marginTop:"1vh"}} >
          <div><label style = {fieldStyle}>Name</label></div>
			    <input style = {fieldStyle} type="text" class="form-control" maxlength="20" placeholder="name..." ref={sName}/>
				</div>
        <div class="" style = {{marginTop:"2vh"}} >
          <div><label style = {fieldStyle}>Email</label></div>
			    <input style = {fieldStyle} type="text" class="form-control" maxlength="20" placeholder="email..." ref={sEmail}/>
				</div>
        <div class="" style = {{marginTop:"2vh"}} >
          <div><label style = {fieldStyle}>Password</label></div>
			    <input style = {fieldStyle} type="password" class="form-control" maxlength="20" placeholder="password..." ref={sPassword}/>
				</div>
        <div class="" style = {{marginTop:"2vh",marginBottom:"2vh"}} >
          <div><label style = {fieldStyle}>Account Type</label></div>
          <div class="select" style={selectStyle}>
            <select  ref={sAccountType}>
            <option value="instructor">Instructor</option>
            <option value="dpt_admin">Department Administrative Staff</option>
            <option value="dpt_chair">Department Chair</option>
            <option value="asc_chair">Associate Chair</option>
            <option value="director">Program Director</option>
            </select>
            <div class="select_arrow">
            </div>
        </div>
				</div>
        <div style = {{textAlign:"center"}} className="modal-footer">
          <input class="button" style={authButtonStyle} type="submit" value={"Sign Up"} onClick={() => setShow(false)}/>
				</div>
        </form>
			</AuthModal>
      <AuthModal2 onClose={() => setShow2(false)} show={show2}>
        <form onSubmit={login}>
        <div class="" style = {{marginTop:"1vh"}} >
          <div><label style = {fieldStyle}>Email</label></div>
			    <input style = {fieldStyle} type="text" class="form-control" maxlength="20" placeholder="email..." ref={lEmail}/>
				</div>
        <div class="" style = {{marginTop:"2vh",marginBottom:"2vh"}} >
          <div><label style = {fieldStyle}>Password</label></div>
			    <input style = {fieldStyle} type="password" class="form-control" maxlength="20" placeholder="password..." ref={lPassword}/>
				</div>
        <div style = {{textAlign:"center"}} className="modal-footer">
          <input class="button" style={authButtonStyle} type="submit" value={"Log In"} onClick = {()=>setShow2(false)}/>
				</div>
        </form>
			</AuthModal2>
    </>
  );
};

export default HomePage;
