import React from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import westernLogo from "../assets/western_eng.png"
import "./AuthModal.css";

const AuthModal = (props) => {
	return ReactDOM.createPortal(
		<CSSTransition in={props.show} unmountOnExit timeout={{ enter: 0, exit: 300 }}>
			<div className="modal" onClick={props.onClose}>
				<div className="modal-content" onClick={(e) => e.stopPropagation()}>
					<div className="modal-header">
						<img class = "modal-center" src={westernLogo} alt=""></img>
					</div>
					<div className="modal-body">{props.children}</div>
				</div>
			</div>
		</CSSTransition>,
		document.getElementById("root")
	);
};

export default AuthModal;
