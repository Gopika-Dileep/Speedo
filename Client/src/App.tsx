import { useState } from "react";
import type {FormEvent } from "react";


function App(){
    const [form , setForm] = useState({email:"",password:""})

    function handleChange(e: React.ChangeEvent<HTMLInputElement>){
       setForm({...form ,[e.target.name]:e.target.value})
    }

    function handleSubmit(e:FormEvent<HTMLFormElement>){
      e.preventDefault()
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

export default App