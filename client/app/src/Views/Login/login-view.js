import React from 'react';
import './login-view.scss';
// import axios from 'axios';

class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            message: "",
            resetComplete: ""
        };
        this.onSubmit = this.onSubmit.bind(this);
    }

    async onSubmit(e) {
        //const resp = await axios.post("http://localhost:3001/signin");
        //console.log(resp);
    }

    render () {
        return (
        <div className="container-login">
            <div className="col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
                <div className="panel panel-default panel-transparent">
                    <div className="panel-heading">
                        <h3>LOG IN</h3>
                    </div>
                    <div className="panel-body">
                        {this.state.message &&
                        <div className="alert alert-danger">
                            {this.state.message}
                        </div>
                        }
                        {this.state.resetComplete &&
                        <div className="alert alert-success">
                            {this.state.resetComplete}
                        </div>
                        }
                        <form id="signin" name="signin" method="post" action="/signin" onSubmit={this.onSubmit}>
                            <div className="form-group">
                                <label htmlFor="username" className="label-text">Username</label>
                                <input type="text" className="form-control" name="username" placeholder="Enter Username" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password"className="label-text">Password</label>
                                <input type="password" className="form-control" name="password" placeholder="Password" required />
                            </div>
                            <div className="form-check">
                                <input type="checkbox" name="remember_me" className="form-check-input" id="rememberMe" />
                                <label style={{marginLeft: "5px"}} className="form-check-label" htmlFor="rememberMe">Remember Me</label>
                            </div>
                            <button style={{marginTop: "10px"}} type="submit" className="btn btn-primary btn-lg label-text" id="btn-signup">Log In</button>
                            <a className="label-text forgot-password" href="/forgot" >Forgot Password? </a>
                        </form>
                    </div>

                </div>
            </div>
        </div>
        )
    }
}
        

export default Login;