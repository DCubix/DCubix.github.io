import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CancelIcon from '@material-ui/icons/Cancel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
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
	}
}

const FMT = { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' };

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
};

Array.prototype.asyncForEach = async function(callback) {
	for (let index = 0; index < this.length; index++) {
		await callback(this[index], index, this)
	}
};

export default class Mensalidades extends Component {
	constructor(p) {
		super(p);
		this.state = {
			mensalidades: [],
			pessoas: {},
			pessoasArray: [],
			years: [],
			loading: false,
			pessoaSel: "",
			valor: 0,
			mes: 0,
			filter: "",
			year: 0
		}
	}

	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	};

	onRegisterAlterClick = (e) => {
		let that = this;
		let pessoa = this.state.pessoaSel;
		let mes = this.state.mes;
		let valor = this.state.valor;

		// Busca mensalidade existente
		let found = false;
		let mens = null;
		this.state.mensalidades.forEach((m) => {
			if (m.data.mes === mes && m.pagador === pessoa.id) {
				found = true;
				mens = m;
			}
		});

		let d = new Date();
		if (found) { // Alterar
			if (valor === 0) { // Excluir
				fire.database().ref(`/mensalidades/${mens.id}`)
					.remove()
					.then(function() {
						that.props.history.push('/');
						that.props.history.push('/mensalidades');
						alert("Registro removido com sucesso.");
					});
			} else {
				fire.database().ref(`/mensalidades/${mens.id}`)
					.set({
						data: {
							ano: mens.ano,
							dia: d.getDay(),
							hora: d.getHours(),
							mes: mes,
							minuto: d.getMinutes()
						},
						pagador: mens.pagador,
						valor: Number(valor)
					})
					.then(function() {
						that.props.history.push('/');
						that.props.history.push('/mensalidades');
						alert("Registro alterado com sucesso.");
					});
			}
		} else { // Novo registro
			fire.database().ref(`/mensalidades/`)
				.push({
					data: {
						ano: d.getFullYear(),
						dia: d.getDay(),
						hora: d.getHours(),
						mes: mes,
						minuto: d.getMinutes()
					},
					pagador: pessoa.id,
					valor: Number(valor)
				})
				.then(function() {
					that.props.history.push('/');
					that.props.history.push('/mensalidades');
					alert("Registro inserido com sucesso.");
				});
		}
	}

	componentWillMount() {
		let that = this;
		this.setState({ loading: true });
		fire.database().ref("/mensalidades/")
			.once("value")
			.then(function(sn) {
				let raw = sn.val();
				let mens = [];
				let years = [];
				let year = -1;
				if (raw) {
					Object.keys(raw).forEach(function(k, i) {
						if (raw[k].data.ano !== year) {
							year = raw[k].data.ano;
							years.push(year);
						}
						mens.push({
							id: k,
							data: raw[k].data,
							pagador: raw[k].pagador,
							valor: raw[k].valor
						});
					});
				}
				that.setState({  mensalidades: mens, years });
			})
			.catch(function(err) {
				that.setState({ loading: false });
			});

		fire.database().ref(`/pessoas/`)
			.once("value")
			.then(function(sn) {
				let pessoas = sn.val();
				let pessoasArray = [];
				Object.keys(pessoas).forEach((k) => {
					pessoasArray.push({
						id: k,
						nome: pessoas[k].nome
					});
				});
				that.setState({ loading: false, pessoas: pessoas, pessoasArray: pessoasArray });
			});
		that.setState({ mes: (new Date()).getMonth()+1 });
	}

	renderMonths(pid, year) {
		let mens = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.state.mensalidades.forEach(function(e) {
			if (e.pagador === pid && e.data.ano === Number(year)) {
				mens[e.data.mes-1] = e.valor;
			}
		});

		let pagador = this.state.pessoas[pid].nome;
		return (
			<TableRow key={pid}>
				<TableCell style={styles.cell} component="th" scope="row">{pagador}</TableCell>
				{mens.map((n, i) => {
					if (n > 0) {
						return <TableCell style={styles.cell} key={i} numeric>{n.toLocaleString("pt-BR", FMT)}</TableCell>;
					}
					return (<TableCell style={styles.cell} key={i} numeric>
						<CancelIcon/>
					</TableCell>);
				})}
			</TableRow>
		);
	}

	renderMonthlyTotals(year) {
		let mens = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.state.mensalidades.forEach(function(e) {
			if (e.data.ano === Number(year)) {
				mens[e.data.mes-1] += e.valor;
			}
		});
		return (
			<TableRow key={year}>
				<TableCell style={styles.cell} component="th" scope="row"><h3>Total Mensal</h3></TableCell>
				{mens.map((n, i) => {
					return <TableCell style={styles.cell} key={i} numeric>{n.toLocaleString("pt-BR", FMT)}</TableCell>;
				})}
			</TableRow>
		);
	}

	renderTable(year) {
		let mens = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.state.mensalidades.forEach(function(e) {
			if (e.data.ano === Number(year)) {
				mens[e.data.mes-1] += e.valor;
			}
		});

		let totalAnual = mens.reduce(function(p, c) { return p + c; });

		let yearClosed = Number(year) !== (new Date()).getFullYear();
		let that = this;
		const pessoas = this.state.pessoasArray || [];
		return (
			<div>
				{!yearClosed && (
					<Paper style={styles.tableInner}>
						<form noValidate style={styles.container}>
							<FormControl style={{ flex: 1 }}>
								<InputLabel htmlFor="pers-simple">Pagador</InputLabel>
								<Select value={this.state.pessoaSel}
										onChange={this.handleChange("pessoaSel")}
										inputProps={{
											name: 'pers',
											id: 'pers-simple',
										}}>
									{
										pessoas.map((p) => 
												<MenuItem key={p.id} value={p}>
													{p.nome}
												</MenuItem>
										)
									}
								</Select>
							</FormControl>
							<TextField label="Valor"
									value={this.state.valor}
									onChange={this.handleChange("valor")}
									type="number"
									InputProps={{
										inputComponent: BRLFormat,
									}}></TextField>
							<FormControl style={{ flex: 1 }}>
								<InputLabel htmlFor="mes-simple">Mês</InputLabel>
								<Select value={this.state.mes}
										onChange={this.handleChange("mes")}
										inputProps={{
											name: 'mes',
											id: 'mes-simple',
										}}>
									<MenuItem value={1}>Janeiro</MenuItem>
									<MenuItem value={2}>Fevereiro</MenuItem>
									<MenuItem value={3}>Março</MenuItem>
									<MenuItem value={4}>Abril</MenuItem>
									<MenuItem value={5}>Maio</MenuItem>
									<MenuItem value={6}>Junho</MenuItem>
									<MenuItem value={7}>Julho</MenuItem>
									<MenuItem value={8}>Agosto</MenuItem>
									<MenuItem value={9}>Setembro</MenuItem>
									<MenuItem value={10}>Outubro</MenuItem>
									<MenuItem value={11}>Novembro</MenuItem>
									<MenuItem value={12}>Dezembro</MenuItem>
								</Select>
							</FormControl>
							<Button variant="contained"
									color="primary"
									style={{ marginLeft: 10 }}
									onClick={this.onRegisterAlterClick}>
									Registrar/Alterar Pagamento
							</Button>
						</form>
					</Paper>
				)}
				<Paper style={{ ...styles.tableInner, display: 'flex'}}>
					<TextField placeholder="Filtro"
								value={this.state.filter}
								onChange={this.handleChange("filter")}
								style={{ flex: 1 }} />
				</Paper>
				<Paper style={styles.root}>
					<Table fixedHeader={false} style={{ width: "100%", tableLayout: "auto" }}>
						<TableHead>
							<TableRow>
								<TableCell style={styles.cell}>Nome</TableCell>
								<TableCell style={styles.cell} numeric>Jan</TableCell>
								<TableCell style={styles.cell} numeric>Fev</TableCell>
								<TableCell style={styles.cell} numeric>Mar</TableCell>
								<TableCell style={styles.cell} numeric>Abr</TableCell>
								<TableCell style={styles.cell} numeric>Mai</TableCell>
								<TableCell style={styles.cell} numeric>Jun</TableCell>
								<TableCell style={styles.cell} numeric>Jul</TableCell>
								<TableCell style={styles.cell} numeric>Ago</TableCell>
								<TableCell style={styles.cell} numeric>Set</TableCell>
								<TableCell style={styles.cell} numeric>Out</TableCell>
								<TableCell style={styles.cell} numeric>Nov</TableCell>
								<TableCell style={styles.cell} numeric>Dez</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.state.filter.length <= 0 && (Object.keys(this.state.pessoas).map((k) => {
								return that.renderMonths(k, year);
							}))}
							{
								Object.keys(this.state.pessoas).map((k) => {
									let p = this.state.pessoas[k];
									if (this.state.filter.length > 0 &&
										p.nome.toLowerCase().includes(this.state.filter))
										{
											return that.renderMonths(k, year);
										}
									return <div></div>;
								})
							}
						</TableBody>
						<TableFooter>
							{this.renderMonthlyTotals(year)}
							<TableCell colSpan={12} style={{...styles.cell, textAlign: 'right' }}><h3>Total Anual:</h3></TableCell>
							<TableCell style={{...styles.cell, textAlign: 'center' }}><h3>{totalAnual.toLocaleString("pt-BR", FMT)}</h3></TableCell>
						</TableFooter>
					</Table>
				</Paper>
			</div>
		);
	}

	render() {
		const years = this.state.years || [];
		return (
			<div>
				<Header title="ADBG Tesouraria - Mensalidades" auth={true}
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
										years.map((p) => 
											<MenuItem key={p} value={p}>
												<h1>{p}</h1>
											</MenuItem>
										)
									}
								</Select>
							</FormControl>
						</div>
						{this.renderTable(this.state.year)}
					</div>
				)}
			</div>
		);
	}
}