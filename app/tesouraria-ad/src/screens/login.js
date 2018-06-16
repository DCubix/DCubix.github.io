import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import fire from '../comps/fire';

import Header from '../comps/Header';

const styles = {
	textField: {
		margin: "15px",
		flex: 1
	},
	tableInner: {
		margin: "15px",
		minWidth: 700,
		padding: "15px"
	}
};

export default class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: "",
			password: ""
		};
	}

	handleChange = name => event => {
		this.setState({
			[name]: event.target.value,
		});
	}

	handleLogin = (e) => {
		let that = this;
		fire.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
			.then(function(user) {
				that.props.history.push('/');
			})
			.catch(function(err) {
				alert(err);
			});
	}

	render() {
		return (
			<div>
				<Header title="ADBG Tesouraria - Login" auth={false}
						onLoginClick={this.handleLogin}
						history={this.props.history} />
				<Paper style={styles.tableInner}>
					<form noValidate>
						<FormControl style={styles.textField}>
							<InputLabel htmlFor="adornment-amount">E-Mail</InputLabel>
							<Input
								id="email"
								value={this.state.email}
								onChange={this.handleChange('email')}
								type="email"
							/>
						</FormControl>
						<FormControl style={styles.textField}>
							<InputLabel htmlFor="adornment-amount">Senha</InputLabel>
							<Input
								id="password"
								value={this.state.password}
								onChange={this.handleChange('password')}
								type="password"
							/>
						</FormControl>
					</form>
				</Paper>
			</div>
		);
	}
}
