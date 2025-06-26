import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import { SocketContextProvider } from "./context/SocketContext"; 
import useListenMessages from "./hooks/useListenMessages"; 

function AppContent() {
  const { authUser } = useAuthContext();

  useListenMessages();

  return (
    <Routes>
      <Route
        path="/"
        element={authUser ? <Home /> : <Navigate to={"/login"} />}
      />
      <Route
        path="/login"
        element={authUser ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/signup"
        element={authUser ? <Navigate to="/" /> : <SignUp />}
      />
    </Routes>
  );
}

function App() {
  const { authUser } = useAuthContext();

  return (
    <SocketContextProvider userId={authUser?._id}>
      <div className="p-4 h-screen flex items-center justify-center">
        <AppContent />
        <Toaster />
      </div>
    </SocketContextProvider>
  );
}

export default App;
