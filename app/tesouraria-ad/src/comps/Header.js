import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import EventIcon from '@material-ui/icons/Event';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import PeopleIcon from '@material-ui/icons/People';
import HomeIcon from '@material-ui/icons/Home';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Button from '@material-ui/core/Button';

import fire from '../comps/fire';

const styles = {
	root: {
		flexGrow: 1,
	},
	flex: {
		flex: 1,
	},
	menuButton: {
		marginLeft: -12,
		marginRight: 20,
	},
};

class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuOpen: false,
			anchEl: null
		};
	}

	handleMenu = (e) => {
		this.setState({ anchEl: e.currentTarget });
	}

	handleClose = (e) => {
		this.setState({ anchEl: null });
	}

	handleLogin = (e) => {
		if (this.props.onLoginClick) {
			this.props.onLoginClick(e);
		}
	}

	handleLogout = (e) => {
		let that = this;
		fire.auth().signOut()
			.then(function() {
				that.props.history.push('/login');
				that.props.history.push('/');
			})
			.catch(function() {
				that.props.history.push('/login');
				that.props.history.push('/');
			});
	}

	handleHome = (e) => {
		this.props.history.push('/');
		this.handleClose(e);
	}

	handleMensalidades = (e) => {
		this.props.history.push('/mensalidades');
		this.handleClose(e);
	}

	handlePessoas = (e) => {
		this.props.history.push('/pessoas');
		this.handleClose(e);
	}

	handleReceitasEDespesas = (e) => {
		this.props.history.push('/receitasedespesas');
		this.handleClose(e);
	}

	render() {
		let open = Boolean(this.state.anchEl);
		return (
		<div>
			<AppBar position="static">
				<Toolbar>
					{this.props.auth && (
					<div>
						<IconButton color="inherit"
									aria-label="Menu"
									onClick={this.handleMenu}
									aria-owns={open ? 'menu-appbar' : null}
									aria-haspopup="true"
									style={styles.menuButton}>
							<MenuIcon />
						</IconButton>
						<Menu id="menu-appbar"
							anchorEl={this.state.anchEl}
							anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							open={open}
							onClose={this.handleClose} >
							<MenuItem onClick={this.handleHome}><HomeIcon/> Início</MenuItem>
							<MenuItem onClick={this.handleMensalidades}><EventIcon/> Mensalidades</MenuItem>
							<MenuItem onClick={this.handleReceitasEDespesas}><AttachMoneyIcon /> Receitas &amp; Despesas</MenuItem>
							<MenuItem onClick={this.handlePessoas}><PeopleIcon /> Pessoas</MenuItem>
						</Menu>
					</div>
					)}
					<Typography variant="title" color="inherit" style={styles.flex}>
						{ this.props.title }
					</Typography>
					{!this.props.auth && (
						<Button color="inherit"
								onClick={this.handleLogin}><PersonIcon/> Login</Button>
					)}
					{this.props.auth && (
						<Button color="inherit"
								onClick={this.handleLogout}><ExitToAppIcon/> Sair</Button>
					)}
				</Toolbar>
			</AppBar>
		</div>);
	}
}

export default withStyles(styles)(Header);
