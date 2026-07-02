import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../../auth/api/authapi"
import { setLogout } from "../../../store/slice/authSlice"


export default function Dashboard(){
    const dispatch = useDispatch()
    const navigate = useNavigate()

    async function handleLogout(){
        try{
            await logout()
            dispatch(setLogout());
            navigate('/')
        }catch(error){
            console.log(error)
        }
    }
    return(
        <>
        <p>Dashboard</p>
        <button onClick={handleLogout}>Logout</button>
        </>
    )
}