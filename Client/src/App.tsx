import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./features/auth/pages/login"
import Dashboard from "./features/user/page/Dashboard"



function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App