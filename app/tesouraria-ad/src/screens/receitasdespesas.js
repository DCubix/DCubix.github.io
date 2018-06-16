import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { DateFormatInput } from 'material-ui-next-pickers'
import { BRLFormat } from '../comps/common';
import fire from '../comps/fire';

import Header from '../comps/Header';
import { TableFooter } from '@material-ui/core';

const styles = {
	table: {
		margin: "15px",
		tableLayout: 'auto'
	},
	title: {
		margin: "25px"
	},
	root: {
		width: '100%',
		marginTop: 25,
		margin: "0 auto",
		overflowX: 'auto',
	},
	cell: {
		padding: 12,
		paddingLeft: 25,
		paddingRight: 25,
		fontSize: "13px"
	},
	tableInner: {
		margin: "15px",
		minWidth: 700,
		padding: "15px"
	},
	container: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-between'
	},
	receita: {
		color: "#0a0"
	},
	despesa: {
		color: "#a00"
	}
}

const FMT = { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' };

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
};

export default class ReceitasDespesas extends Component {
	constructor(p) {
		super(p);
		this.state = {
			receitasEDespesas: [],
			years: [],
			year: (new Date()).getFullYear(),
			loading: false,
			tipo: 0,
			descricao: "",
			valor: 0,
			data: null
		};
	}

	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	};

	onDateChange = (e) => {
		this.setState({ data: e });
	}

	onRegisterClick = (e) => {
		let that = this;
		let tipo = this.state.tipo;
		let desc = this.state.descricao;
		let valor = this.state.valor;
		let d = this.state.data;

		let dfmt = `${d.getDate()}_${d.getMonth()+1}_${d.getFullYear()}_${d.getHours()}_${d.getMinutes()}`;

		fire.database().ref("/receitasedespesas/")
			.push({
				tipo,
				descricao: desc,
				valor,
				dataCompetencia: dfmt
			})
			.then((e) => {
				that.props.history.push('/');
				that.props.history.push('/receitasedespesas');
				alert("Registro inserido com sucesso.");
			});
	}

	componentWillMount() {
		this.setState({ loading: true, data: new Date() });
		fire.database().ref("/receitasedespesas/")
			.once("value")
			.then((snap) => {
				let raw = snap.val();
				let rd = [];
				let year = -1;
				let years = [];
				if (raw) {
					Object.keys(raw).forEach((k) => {
						let p = raw[k].dataCompetencia.split("_");
						let d = new Date(Number(p[2]), Number(p[1]), Number(p[0]), Number(p[3]), Number(p[4]));
						rd.push({
							id: k,
							tipo: Number(raw[k].tipo),
							descricao: raw[k].descricao,
							valor: Number(raw[k].valor),
							dataCompetencia: d,
							ano: d.getFullYear()
						});
						if (d.getFullYear() !== year) {
							years.push(d.getFullYear());
							year = d.getFullYear();
						}
					});
				}
				this.setState({ loading: false, receitasEDespesas: rd, years });
			})
			.catch((err) => {
				this.setState({ loading: false, receitasEDespesas: [], years: [] });
			});
	}

	renderItem(item) {
		let d = item.dataCompetencia;
		let date = `${d.getDate().pad(2)}/${d.getMonth().pad(2)}/${d.getFullYear()}`;
		return (
			<TableRow key={item.id}>
				{(item.tipo === 0) && 
					(<TableCell style={styles.cell} component="th" scope="row">
						<b style={styles.receita}>RECEITA</b>
					</TableCell>)
					||
					(<TableCell style={styles.cell} component="th" scope="row">
						<b style={styles.despesa}>DESPESA</b>
					</TableCell>)
				}
				<TableCell style={styles.cell}>{item.descricao}</TableCell>
				<TableCell style={styles.cell} number>{item.valor.toLocaleString("pt-BR", FMT)}</TableCell>
				<TableCell style={styles.cell}>{date}</TableCell>
				<TableCell style={styles.cell}>
					<Button variant="contained" 
							color="secondary">
						Deletar
					</Button>
				</TableCell>
			</TableRow>
		);
	}

	renderTotal(year) {
		let total = 0;
		for (let ob of this.state.receitasEDespesas) {
			if (ob.dataCompetencia.getFullYear() !== year)
				continue;
			if (ob.tipo === 0) {
				total += ob.valor;
			} else {
				total -= ob.valor;
			}
		}
		if (total < 0) {
			return (
				<TableCell style={{...styles.despesa, ...styles.cell, textAlign: 'center' }}>
					<h2>{total.toLocaleString("pt-BR", FMT)}</h2>
				</TableCell>
			)
		}
		return (
			<TableCell style={{...styles.receita, ...styles.cell, textAlign: 'center' }}>
				<h2>{total.toLocaleString("pt-BR", FMT)}</h2>
			</TableCell>
		);
	}

	renderTable(year) {
		let yearClosed = Number(year) !== (new Date()).getFullYear();
		let that = this;
		return (
			<div>
				{!yearClosed && (
					<Paper style={styles.tableInner}>
						<form noValidate style={styles.container}>
							<FormControl style={{ flex: 1 }}>
								<InputLabel>Tipo</InputLabel>
								<Select value={this.state.tipo}
										onChange={this.handleChange("tipo")}
										inputProps={{
											name: 'type',
											id: 'type-simple',
										}}>
									<MenuItem style={styles.receita} key={0} value={0}>RECEITA</MenuItem>
									<MenuItem style={styles.despesa} key={1} value={1}>DESPESA</MenuItem>
								</Select>
							</FormControl>
							<TextField style={{ flex: 1 }}
									label="Descricao"
									value={this.state.descricao}
									onChange={this.handleChange("descricao")}></TextField>
							<TextField label="Valor"
									value={this.state.valor}
									onChange={this.handleChange("valor")}
									InputProps={{
										inputComponent: BRLFormat,
									}} />
							<DateFormatInput label="Data de Competência"
											 dateFormat="dd/MM/yyyy"
											 value={this.state.data}
											 onChange={this.onDateChange}
											 dialog={true} />
							<Button variant="contained"
									color="primary"
									style={{ marginLeft: 10 }}
									onClick={this.onRegisterClick}>
									Registrar
							</Button>
						</form>
					</Paper>
				)}
				<Paper style={styles.root}>
					<Table fixedHeader={false} style={{ width: "100%", tableLayout: "auto" }}>
						<TableHead>
							<TableRow>
								<TableCell style={styles.cell}>Tipo</TableCell>
								<TableCell style={styles.cell}>Descrição</TableCell>
								<TableCell style={styles.cell}>Valor</TableCell>
								<TableCell style={styles.cell}>Data de Competência</TableCell>
								<TableCell style={styles.cell}>Operações</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.receitasEDespesas.map((item) => {
								if (item.dataCompetencia.getFullYear() !== year) {
									return <div></div>;
								}
								return that.renderItem(item);
							})}
						</TableBody>
						<TableFooter>
							<TableCell colSpan={4} style={{...styles.cell, textAlign: 'right' }}><h2>Total:</h2></TableCell>
							{this.renderTotal(year)}
						</TableFooter>
					</Table>
				</Paper>
			</div>
		);
	}

	render() {
		let that = this;
		return (
			<div>
				<Header title="ADBG Tesouraria - Receitas & Despesas" auth={true}
						history={this.props.history} />
				{this.state.loading && <h3>Carregando...</h3>}
				{!this.state.loading && (
					<div>
						<div style={styles.tableInner}>
							<FormControl style={{ width: "50%" }}>
								<InputLabel>Ano</InputLabel>
								<Select value={this.state.year}
										onChange={this.handleChange("year")}
										inputProps={{
											name: 'year',
											id: 'year-simple',
										}}>
									{
										this.state.years.map((p) => 
											<MenuItem key={p} value={p}>
												<h1>{p}</h1>
											</MenuItem>
										)
									}
								</Select>
							</FormControl>
						</div>
						<div style={styles.tableInner}>
							{this.renderTable(this.state.year)}
						</div>
					</div>
				)}
			</div>
		);
	}
}