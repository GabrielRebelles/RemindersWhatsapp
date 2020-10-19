import React from "react";
import Login from './login'

class App extends React.Component {

    constructor(){
        super();//con esto heredamos todas las propiedades de React.Component

        this.state={
            phone:'',
            description:'',
            time:'',
            reminders:[],
            _id:'',
        }
        this.addTask=this.addTask.bind(this);   //para vincular el metodo con el constructor
        this.handleChange=this.handleChange.bind(this);
        this.jwtValidate=this.jwtValidate.bind(this)
        this.logout=this.logout.bind(this)
        this.parseDate=this.parseDate.bind(this)
    }


    handleChange(event){
        let {name,value}=event.target;//en event.target estan los valores de los campos
        
        this.setState({
            [name]:value
        })
    }

    addTask(event){
		let url
		let method
		const description = this.state.description
        const time = moment(this.state.time).valueOf()
        const phone = this.state.phone.toString().split('').filter((char)=>{return !isNaN(char) && char!=" "}).join('')

        if(time>=moment().valueOf()){        
            if (this.state._id) {
                url=`api/${this.state._id}`
                method = "PUT"
            }else{
                url=`api`
                method = "POST"
            }	
            fetch(location.origin+location.pathname+url,{     //esto envia un post al srv:
                method: method,         
                body: JSON.stringify({phone,time,description}),
                headers:{
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    authorization: "Bearer " + localStorage.getItem("JWT-TASKS"),
                }
            })
            .then(res=>res.json())
            .then(data=>{
                M.toast({html:data.message});
                if(!data.err)this.setState({phone:'',description:'',_id:''});
                this.fetchTask()
            })
            .catch(err=>console.log(err));	
        }else{
            M.toast({html:"Fecha invalido: la fecha ya pasó"});
        }

        event.preventDefault();
    }

    fetchTask(){
        fetch(location.origin+location.pathname+'api',{
            method:"GET",
            headers:{
                Accept: "application/json",
				"Content-Type": "application/json",
				authorization: "Bearer " + localStorage.getItem("JWT-TASKS"),
            }
        })  //con esto pedimos todas las tareas con un get
        .then(res=>res.json())
        .then(data=>{
            this.setState({reminders:data})               
        })
    }

    deleteTask(id){
        if(confirm('Esta seguro de eliminar el recordatorio?')){
            fetch(location.origin+location.pathname+`api/${id}`,{
            method: 'DELETE',         
            body: JSON.stringify(this.state), 
            headers:{
                Accept: "application/json",
				"Content-Type": "application/json",
				authorization: "Bearer " + localStorage.getItem("JWT-TASKS"),
            }
            })
            .then(res=>res.json())
            .then(data=>{
                M.toast({html:'Recordatorio eliminado'}); 
                this.fetchTask()
            })
            .catch(err=>console.log(err));
        }
    }

    editTask(id){
        fetch(location.origin+location.pathname+`api/${id}`,{
            method:"GET",
            headers:{
                Accept: "application/json",
				"Content-Type": "application/json",
				authorization: "Bearer " + localStorage.getItem("JWT-TASKS"),
            }
        })
        .then(res=>res.json())
        .then(data=>{  
            console.log(data);
            this.setState({
                phone: data[0].phone,
                description: data[0].description,
                time: data[0].time,
                _id: data[0]._id
            });
        }) 
        
    }

    componentDidMount(){
        this.jwtValidate();
		this.fetchTask();
		this.setState({time:moment().format("yyyy-MM-DDTHH:mm")})
    }

    jwtValidate(){
        if(localStorage.getItem("JWT-TASKS")){
			fetch(location.origin+location.pathname+`api/validatelogin`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					'authorization': "Bearer " + localStorage.getItem("JWT-TASKS"),
				}
			})
			.then((res) => {
                if(res.status===401)localStorage.clear();
                return res.json()
            })
            .then((res)=>{this.setState({username:res.username})})
		}
    }

    logout(){
        localStorage.clear()
        this.forceUpdate()
	}
	
	parseDate(date){// change format: 1602892860000 to "yyyy-MM-ddThh:mm"
		return moment(date).format("yyyy-MM-DDTHH:mm")
	}

	render() {
        if(!localStorage.getItem("JWT-TASKS")) return <Login></Login>


		return (
			<div >
				{/*NAVEGACION*/}
				<nav className="light-blue darken-4" style={{display:"flow"}}>
					<div className="container">
						<a href="/" className="brand-logo left ">
							<h5 style={{marginLeft:"1ch"}} className="left">
                            Recordatorios
                            </h5>
						</a>
                        <ul id="nav-mobile" className="right">
                            <li><a>{screen.width>600?this.state.username:""}</a></li>
							<li><a style={{marginRight:`${screen.width<600?"-10vw":""}`}} onClick={this.logout}>Cerrar sesion</a></li>
						</ul>
					</div>
				</nav>

                                

                {/*CONTENIDO*/}
				<div className="container">
					<div className="row">
						<div className="col s12 m5" >
							<div className="card">
								<div className="card-content">
									<form onSubmit={this.addTask}>										
										<div className="row">
											<div className="input-field col s12">
                                                <span style={{fontSize:"13px", color:"#455a64"}}>Descripcion</span><br/>
                                                <textarea
                                                    name="description" 
                                                    onChange={this.handleChange}
                                                    className="materialize-textarea" 
                                                    value={this.state.description}>
                                                </textarea>
											</div>
										</div>                                        
                                        <div className="row">
											<div className="input-field col s12">
                                            <span style={{fontSize:"13px", color:"#455a64"}}>Fecha</span><br/>
                                                <input 
                                                id="fecha"
                                                type="datetime-local" 
                                                placeholder=""
												name="time" 
												value={this.state.time?this.parseDate(this.state.time):this.state.time}
                                                onChange={this.handleChange}
                                                />
                                                <label for="fecha"></label>
											</div>
										</div>                                        
                                        <div className="row">
											<div className="input-field col s12">
                                            <span style={{fontSize:"13px", color:"#455a64"}}>Numero de Whatsapp</span><br/>
												<input
                                                    onChange={this.handleChange}
                                                    name="phone"
													type="tel"
                                                    placeholder="Ej: 54 9 11 3482-4698"
                                                    value={this.state.phone}
												/>
											</div>
										</div>
                                        <button type="submit" className="btn light-blue darken-4">Enviar</button>
									</form>
								</div>
							</div>
						</div>
						<div className="col s12 m7" style={{marginLeft:`${screen.width<600?"-2vw":""}`}}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{maxWidth: "14ch",width:"20ch",wordWrap:"break-word"}}>Descripcion</th>
                                        <th style={{maxWidth: "14ch",width:"20ch",wordWrap:"break-word"}}>Fecha</th>
                                        <th style={{maxWidth: "14ch",width:"20ch",wordWrap:"break-word"}}>Whatsapp</th>
                                        <th>Editar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.reminders.map(task=>{
											//let tiempo = new Date(task.time).toLocaleDateString()
											let tiempo = new Date(task.time).toLocaleString()
											//let tiempo = new Date(task.time).toString()
                                            return(
                                                <tr key={task._id}>
                                                    <td style={{maxWidth: "14ch",width:"20ch",wordWrap:"break-word"}}>{task.description}</td>
                                                    <td style={{maxWidth: "14ch",width:"20ch",wordWrap:"break-word"}}>{tiempo}</td>
                                                    <td style={{maxWidth: "14ch",width:"20ch",wordWrap:"break-word"}}>{task.phone}</td>
                                                    <td>
                                                        <button className="btn-small light-blue darken-4" 
                                                        onClick={()=>this.deleteTask(task._id)}>
                                                            <i className="material-icons">delete</i>
                                                        </button>
                                                        <button className="btn-small light-blue darken-4" 
                                                        onClick={()=>this.editTask(task._id)} 
                                                        style={{marginTop: '5px'}}>
                                                            <i className="material-icons">edit</i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
