import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import fire from '../comps/fire';

import Header from '../comps/Header';

const styles = {
	table: {
		margin: "15px",
		minWidth: 700
	},
	title: {
		margin: "25px"
	},
	inner: {
		padding: "15px"
	},
	tableInner: {
		margin: "15px",
		minWidth: 700,
		padding: "15px"
	}
}

export default class Pessoas extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			pessoas: [],
			name: "",
			filter: ""
		};
	}

	componentWillMount() {
		let that = this;
		this.setState({ loading: true });
		fire.database().ref("/pessoas/")
			.once("value")
			.then(function(snp) {
				let snp_ = snp.val();
				let pessoas = [];
				Object.keys(snp_).forEach(function(k, i) {
					pessoas.push({
						id: k,
						nome: snp_[k].nome
					});
				});
				that.setState({ loading: false, pessoas });
			})
			.catch(function() {
				that.setState({ loading: false, pessoas: [] });
			});
	}

	onRegisterUser = (e) => {
		let that = this;
		if (this.state.name.length <= 5) return;
		fire.database().ref("/pessoas/").push(
			{
				nome: this.state.name
			}
		).then(function() {
			that.props.history.push('/');
			that.props.history.push('/pessoas');
		});
	}

	onDeleteUser = id => e => {
		let that = this;
		fire.database().ref(`/pessoas/${id}`)
			.remove()
			.then(function() {
				that.props.history.push('/');
				that.props.history.push('/pessoas');
				alert("A pessoa foi removida com sucesso.");
			});
	}

	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	};

	render() {
		let valid = Boolean(this.state.pessoas);
		return (
			<div>
				<Header title="ADBG Tesouraria - Pessoas" auth={true}
						history={this.props.history} />
				{this.state.loading && <h3>Carregando...</h3>}
				{!this.state.loading && (
					<div style={styles.inner}>
						<Paper style={{ ...styles.tableInner, display: 'flex'}}>
							<TextField id="nome-pessoa"
									   type="name"
									   placeholder="Nome Completo"
									   value={this.state.name}
									   onChange={this.handleChange("name")}
									   style={{ flex: 1 }} />
							<Button variant="contained"
									color="primary"
									onClick={this.onRegisterUser}
									style={{ marginLeft: 10 }}>Cadastrar</Button>
						</Paper>
						<Paper style={{ ...styles.tableInner, display: 'flex'}}>
							<TextField placeholder="Filtro"
										value={this.state.filter}
										onChange={this.handleChange("filter")}
										style={{ flex: 1 }} />
						</Paper>
						<Paper style={styles.table}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: "20%" }}>#</TableCell>
										<TableCell>Nome</TableCell>
										<TableCell>Operações</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.filter.length <= 0 && (this.state.pessoas.map((p, i) => {
										return (<TableRow>
											<TableCell numeric>{i}</TableCell>
											<TableCell component="th" scope="row">{p.nome}</TableCell>
											<TableCell>
												<Button variant="contained"
														color="secondary"
														onClick={this.onDeleteUser(p.id)}>Deletar</Button>
											</TableCell>
										</TableRow>);
									}))}
									{valid && (this.state.pessoas.map((p, i) => {
										if (this.state.filter.length > 0 &&
											p.nome.toLowerCase().includes(this.state.filter))
											{
												return (<TableRow>
													<TableCell numeric>{i}</TableCell>
													<TableCell component="th" scope="row">{p.nome}</TableCell>
													<TableCell>
													<Button variant="contained"
															color="secondary"
															onClick={this.onDeleteUser(p.id)}>Deletar</Button>
													</TableCell>
												</TableRow>);
											}
										return <div></div>;
									}))}
								</TableBody>
							</Table>
						</Paper>
					</div>
				)}
			</div>
		);
	}
}