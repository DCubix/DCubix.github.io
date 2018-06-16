import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

import Mensalidades from './screens/mensalidades';
import Login from './screens/login';
import Home from './screens/home';
import Pessoas from './screens/pessoas';
import ReceitasDespesas from './screens/receitasdespesas';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null
		};
	}

	render() {
		return (
			<div>
				<Router>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route path='/login' component={Login} />
						<Route path='/mensalidades' component={Mensalidades} />
						<Route path='/pessoas' component={Pessoas} />
						<Route path='/receitasedespesas' component={ReceitasDespesas} />
					</Switch>
				</Router>
			</div>
		);
	}
}

export default App;
