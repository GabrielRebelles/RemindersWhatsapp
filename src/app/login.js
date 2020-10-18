import React from 'react'
import Home from './app'

class Login extends React.Component{

    constructor(){
        super()
        this.state={
            Home:'',
            register:false
        }
        this.handleChange=this.handleChange.bind(this)
		this.login=this.login.bind(this)
		this.register=this.register.bind(this)
    }

    login(event){
		fetch('/api/login',{
			method: 'POST',         
			body:JSON.stringify(this.state),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		})
		.then(res=>{
			return res.json()
		})
		.then((res)=>{
            document.getElementById('parrafoLogin').innerHTML=res.message||''            
            document.getElementById('parrafoLogin').classList.remove("green-text")
            document.getElementById('parrafoLogin').classList.add("red-text")
            if (res && res.token){
                localStorage.setItem('JWT-TASKS',res.token);
                this.setState({Home:<Home></Home>})
            }
		})
		.catch((err)=>{
			//solo se puede rechazar por fallo de red o algo impide la solicitud
			console.log(err)
		})
		event.preventDefault()//para que no se reinicie la pag
    }


    register(event){
		fetch('/api/register',{
			method: 'POST',         
			body:JSON.stringify(this.state),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		})
		.then(res=>{
			return res.json()
		})
		.then((res)=>{
            if (res.err){
                document.getElementById('parrafoRegister').innerHTML=res.message||''
                document.getElementById('parrafoRegister').classList.add("red-text")
            }else{
                this.setState({register:false})
                document.getElementById('parrafoLogin').innerHTML=res.message||''
                document.getElementById('parrafoLogin').classList.remove("red-text")
                document.getElementById('parrafoLogin').classList.add("green-text")
            }
		})
		.catch((err)=>{
			//solo se puede rechazar por fallo de red o algo impide la solicitud
			console.log(err)
		})
		event.preventDefault()//para que no se reinicie la pag
    }
    

    handleChange(event){
		const {name,value}=event.target
		this.setState({[name]:value})
	}

    render() {
        if (this.state.Home) return this.state.Home
        
        
        return (
			<React.Fragment>
				<nav className="light-blue darken-4" style={{display:"flow"}} >
                    <div className="container">
                        <a href="/" className="brand-logo left ">
							<h5 style={{marginLeft:"1ch"}} className="left">
                            Recordatorios
                            </h5>
						</a>
					</div>
				</nav>


                {
                this.state.register==false
                ?				
				<div className="row">
					<div className="col s12 m4 offset-m4">

						<div className="card">
							<div className="card-action light-blue darken-4 white-text">
								<h4>Iniciar sesion</h4>
							</div>
							<div className="card-content">
                                <form onSubmit={this.login}>

                                    <div className="form-field">
                                        <label htmlFor="username">Username</label>
                                        <input type="text" name="username" id="username" onChange={this.handleChange}/>
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="password">Password</label>
                                        <input type="password" name="password" id="password" onChange={this.handleChange}/>
                                    </div>
                                    <div className="form-field">
                                        <p className="red-text darken-4" id="parrafoLogin"></p><br/>
                                        <button type="submit" className=" light-blue darken-4 btn-large waves-effect" style={{width:'100%'}} >Iniciar sesion</button>
                                    </div>
                                </form>
                                <p style={{paddingTop:"2vh"}}>¿No tenes cuenta? <a 
                                    href="#" 
                                    onClick={()=>{
                                        this.setState({register:true})
                                        document.getElementById('parrafoLogin').innerHTML=''
                                    }}
                                    >Registrate</a>
                                </p>
							</div>
                            
						</div>
					</div>
				</div>
                :
                <div className="row">
                <div className="col s12 m4 offset-m4">

                    <div className="card">
                        <div className="card-action light-blue darken-4 white-text">
                            <h4>Registrarse</h4>
                        </div>
                        <div className="card-content">
                            <form onSubmit={this.register}>

                                <div className="form-field">
                                    <label htmlFor="username">Username</label>
                                    <input type="text" name="username" id="username" onChange={this.handleChange}/>
                                </div>
                                <div className="form-field">
                                    <label htmlFor="password">Password</label>
                                    <input type="password" name="password" id="password" onChange={this.handleChange}/>
                                </div>
                                <div className="form-field">
                                    <p className="red-text darken-4" id="parrafoRegister"></p><br/>
                                    <button type="submit" className=" light-blue darken-4 btn-large waves-effect" style={{width:'100%'}} >Registrarse</button>
                                </div>
                            </form>
                            <p style={{paddingTop:"2vh"}}>¿Ya tenes cuenta? <a href="#" onClick={()=>{this.setState({register:false})}}>Inicia sesión</a></p>
                        </div>
                        
                    </div>
                </div>
            </div>
                }


			</React.Fragment>
		);
	}
}

export default Login;