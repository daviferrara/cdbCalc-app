import React from 'react';
import './App.css';
import Calendar from 'react-calendar';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function App() {
  return (
    <div className="App">
        Calculadora de CDB
        <CdiForm />
    </div>
  );
}

function pad(val){
    return val<10? '0'+val: val;
}

function taxaCDI(val){
    return Math.pow(((val/100)+1),1/252 ) -1;
}

class CdbResult extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            prices : props.cdiList
        }
    }
    render(){
        if (this.props.cdiList){
           let cdiList =  this.props.cdiList.prices;
           let graphData =[];
           //let prices = cdiList.map(cdi=> parseFloat(cdi.price) );
           let total=1;
           cdiList.forEach( (item,index) => {
                    let valor =  (1 + taxaCDI(item.price ) * (this.props.cdbRate/100)  ) ;
                    total *=valor;
                    let dt = new Date(item.date);
                    let date = (dt.getMonth() +1)+"-"+ dt.getFullYear();
                    graphData.push({dt : date , valor: total*1000 })
                }
           )
           total*=1000;
           return (
                <div>
                    O Resultado do CDB com valor inicial de R$1000,00 é {total.toFixed(2)}
                    <br/>
                    <LineChart
                        width={600}
                        height={300}
                        data={graphData}
                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                        <Line
                          dataKey='valor'
                          stroke='#8884d8'
                          />
                        <CartesianGrid strokeDasharray='3 1'/>
                        <Tooltip/>
                        <YAxis/>
                        <XAxis dataKey='dt'  />
                        <Legend />
                    </LineChart>
                </div>
           )
        }else{
            return null;
        }
    }
}


class CdiForm extends React.Component{

    constructor(props){
        super(props);
        this.state = {dtIni:new Date(),
            rate:100,
            currDt:new Date(),
            data:null
        }
    }

   searchCDI = async e =>{
        const {dtIni, currDt} = this.state;
        if ( !dtIni || !currDt || !this.state.rate){
            alert("Favor informe Data inicial, taxa do CDB e data Final da aplicação ");
            return;
        }
        const data = await fetch('http://localhost:8080/cdiList?'+
                 'dtIni='+dtIni.getFullYear()+ pad(dtIni.getMonth()+1)+pad(dtIni.getDate())+
                 '&currDt='+currDt.getFullYear()+ pad(currDt.getMonth()+1)+pad(currDt.getDate()))
              .then(response => response.json());
        if (!data){
            alert ("Não foi possível recupera o histórico do CDI");
        } else if ( data.prices.length===0 ){
            alert ("Sem dados historicos suficientes pra realizar o calculo");
        }else{
            this.setState({data:data});
        }
   }


   handleRate = event =>
        this.setState({rate: event.target.value})

   handleDtIni = date=>
        this.setState({  dtIni: date})

   handleCurrDt = date =>
       this.setState({  currDt: date})


   render( ){
        return (
            <div className="fields">
                <label>
                    Data inicial do Investimento:
                    <Calendar value={this.state.dtIni} onChange={this.handleDtIni} />
                </label>
                <br/>
                <label>Taxa do CDB:
                    <input type="text" name="rate" value={this.state.rate} onChange={this.handleRate}/>
                </label>
                <br/> <br/>
                <label>Data Atual:
                    <div width="100%"></div><Calendar value={this.state.currDt} onChange={this.handleCurrDt} />
                </label>
                <br/>
                <input type="submit" value ="GO" onClick={this.searchCDI}/>
                <br/>
                <CdbResult cdiList={this.state.data} cdbRate={this.state.rate} />
                <br/>

            </div>

        )
   }
}


export default App;
