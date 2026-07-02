import { useState } from "react";
import type {FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authapi";
import { setCredentials } from "../../../store/slice/authSlice";

export default function Login(){
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form , setForm] = useState({email:"",password:""})

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
       setForm({...form ,[e.target.name]:e.target.value})
    }

    async function handleSubmit(e:FormEvent<HTMLFormElement>){
      e.preventDefault()
      try{
        const data = await login(form.email , form.password);

        dispatch(setCredentials({user:data.user,accesToken:data.accesToken,}));
        navigate("/dashboard");
      }catch(error){
        console.error(error);
      }
    }

    return(
      <>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" value={form.email} onChange={handleChange}/>
          <input type="password" name="password" value={form.password} onChange={handleChange}/>
          <button type="submit">Submit</button>
        </form>
      </>
    )
}

