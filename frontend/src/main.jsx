import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
// import "./index.css";
// import { BrowserRouter } from "react-router-dom";
// import { AuthContextProvider } from "./context/AuthContext.jsx";
// import { SocketContextProvider } from "./context/SocketContext.jsx";
// import axios from "axios";

// axios.defaults.baseURL = "http://localhost:5000";
// axios.defaults.withCredentials = true;

// ReactDOM.createRoot(document.getElementById("root")).render(
// 	<React.StrictMode>
// 		<BrowserRouter>
// 			<AuthContextProvider>
// 				<SocketContextProvider>
// 					<App />
// 				</SocketContextProvider>
// 			</AuthContextProvider>
// 		</BrowserRouter>
// 	</React.StrictMode>
// );
