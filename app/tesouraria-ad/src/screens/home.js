import React, { Component } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import {
	ComposedChart,
	Line,
	Area,
	ResponsiveContainer,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend
} from 'recharts';
import fire from '../comps/fire';

import Header from '../comps/Header';

const styles = {
	tableInner: {
		margin: "15px",
		minWidth: 700,
		padding: "15px"
	}
}

const FMT = { minimumFractionDigits: 2 , style: 'currency', currency: 'BRL' };

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mensalidades: [],
			receitasEDespesas: [],
			years: [],
			year: (new Date()).getFullYear(),
			user: null,
			loading: false
		};
	}

	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	};

	handleToLogin = (e) => {
		e.preventDefault();
		this.props.history.push("/login");
	}

	componentWillMount() {
		let that = this;
		this.setState({ user: fire.auth().currentUser });

		let years = [];
		let year = -1;
		if (Boolean(fire.auth().currentUser)) {
			this.setState({ loading: true });
			fire.database().ref("/mensalidades/")
			.once("value")
			.then(function(sn) {
				let raw = sn.val();
				let mens = [];
				if (raw) {
					Object.keys(raw).forEach(function(k, i) {
						if (raw[k].data.ano !== year) {
							year = raw[k].data.ano;
							years.push(year);
						}
						mens.push({
							id: k,
							data: raw[k].data,
							valor: raw[k].valor
						});
					});
				}
				that.setState({ mensalidades: mens });
			});

			fire.database().ref("/receitasedespesas/")
				.once("value")
				.then((snap) => {
					let raw = snap.val();
					let rd = [];
					let years = [];
					let year = -1;
					Object.keys(raw).forEach((k) => {
						let p = raw[k].dataCompetencia.split("_");
						let mes = Number(p[1]);
						let ano = Number(p[2]);
						rd.push({
							id: k,
							tipo: Number(raw[k].tipo),
							valor: Number(raw[k].valor),
							ano: ano,
							mes: mes
						});
						if (ano !== year) {
							year = ano;
							years.push(year);
						}
					});
					this.setState({ loading: false, receitasEDespesas: rd, years });
				})
				.catch((err) => {
					// alert(`Erro ao carregar dados: Receitas e Despesas. ${err}`);
					this.setState({ loading: false, receitasEDespesas: [], years: [] });
				});
		}
	}

	renderChart(year) {
		let data = [
			{ name: "Jan", men: 0, red: 0, tot: 0 },
			{ name: "Fev", men: 0, red: 0, tot: 0 },
			{ name: "Mar", men: 0, red: 0, tot: 0 },
			{ name: "Abr", men: 0, red: 0, tot: 0 },
			{ name: "Mai", men: 0, red: 0, tot: 0 },
			{ name: "Jun", men: 0, red: 0, tot: 0 },
			{ name: "Jul", men: 0, red: 0, tot: 0 },
			{ name: "Ago", men: 0, red: 0, tot: 0 },
			{ name: "Set", men: 0, red: 0, tot: 0 },
			{ name: "Out", men: 0, red: 0, tot: 0 },
			{ name: "Nov", men: 0, red: 0, tot: 0 },
			{ name: "Dez", men: 0, red: 0, tot: 0 }
		];

		this.state.mensalidades.forEach((i) => {
			if (i.data.ano == Number(year)) {
				let m = i.data.mes-1;
				let v = i.valor;
				data[m].men += v;
			}
		});

		this.state.receitasEDespesas.forEach((i) => {
			if (i.ano == Number(year)) {
				let m = i.mes-1;
				let t = i.tipo;
				let v = t === 0 ? i.valor : -i.valor;
				data[m].red += v;
			}
		});

		for (let i = 0; i < 12; i++) {
			data[i].tot += data[i].men;
			data[i].tot += data[i].red;
		}

		console.log(data);

		return (
			<ResponsiveContainer width={"100%"} height={320}>
				<ComposedChart data={data}
						   margin={{top: 10, right: 20, left: 0, bottom: 0}}>
					<XAxis dataKey="name"/>
					<YAxis tickFormatter={(v) => v.toLocaleString("pt-BR", FMT)} />
					<CartesianGrid strokeDasharray="3 3"/>
					<Tooltip formatter={(value, name, props) => {
						return value.toLocaleString("pt-BR", FMT);
					}} />
					<Legend />
					<Line dataKey="men" name="Mensalidades" stroke="#4286f4" />
					<Line dataKey="red" name="Receitas & Despesas" stroke="#e89727" />
					<defs>
						<linearGradient id="totcolor" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
							<stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
						</linearGradient>
					</defs>
					<Area dataKey="tot" stroke="#82ca9d" name="Total" fillOpacity={1} fill="url(#totcolor)" />
				</ComposedChart>
			</ResponsiveContainer>
		);
	}

	renderMain() {
		let auth = Boolean(this.state.user);
		if (!auth) {
			return <h3>Por favor faça Login para visualizar ou alterar os dados.</h3>;
		} else if (auth && this.state.loading) {
			return <h3>Carregando...</h3>;
		}

		return (
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
				<Paper style={styles.tableInner}>
					{this.renderChart(this.state.year)}
				</Paper>
			</div>
		);
	}

	render() {
		let auth = Boolean(this.state.user);
		return (
			<div>
				<Header title="ADBG Tesouraria - Início" auth={auth}
						onLoginClick={this.handleToLogin}
						history={this.props.history} />
				{this.renderMain()}
			</div>
		);
	}
}