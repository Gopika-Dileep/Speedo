import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./features/auth/pages/login"
import Dashboard from "./features/user/page/Dashboard"
import Tripdetails from "./features/user/page/Tripdetails"
import { ToastProvider } from "./context/ToastContext"

function App(){
  return(
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/trip-details" element={<Tripdetails/>}/>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App