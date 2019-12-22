// BASIC
import React, {Component} from 'react';
import styled, {css} from 'styled-components'
import EditorJs from 'react-editor-js';
import { EDITOR_JS_TOOLS } from './tools'
import firebase from 'firebase/app'
import 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'

// STYLE
import Global from '../Styles/Global'
import { Wrapper } from '../Styles/Components'
// COMPONENTS
import LogIn from './components/LogIn'
import LogOut from './components/LogOut'
// ICONS
import {FaPencilAlt} from 'react-icons/fa'
// KEYFRAMES
import { entry, editOpacity } from '../Styles/Keyframes'
import { faPenAlt } from 'react-icons/fa';

const LoginElement = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	color: var(--color-primary);
	width: 100vw;
	padding: 20px;
`
const LoginTitle = styled.header`
	font-size: 35px;
	font-weight: bold;
	text-align: center;
	margin: 30px 0;
	@media(min-width: 720px) {
		font-size: 50px;
	}
	@media(max-height: 600px) {
		margin: 15px 0 0 0;
		font-size: 35px;
	}
	@media(max-height: 450px) {
		margin: 30px 0;
	}
`
const AddAdmin = styled.form`
	display: none;
	${props =>
			props.preview &&
			css`
				display: block;
	`};
`
const UserContent = styled.div`
	display: none;
	text-align: center;
	${props =>
			props.preview &&
			css`
				display: block;
	`};
`
const Avatar = styled.div`
	width: 250px;
	height: 250px;
	position: relative;
	border-radius: 100%;
	overflow: hidden;
`
const AvatarImage = styled.img`
	display: block;
	width: 100%;
	height: 100%;
	
`
const Edit = styled(FaPencilAlt)`
	display: none;
	position: absolute;
	top: 0;
	left: 0;
	width: 250px;
	height: 250px;
	padding: 100px;
	background-color: var(--color-dark);
	animation: ${editOpacity} 0.2s ease;
	cursor: pointer;
	${Avatar}:hover & {
		display: block;
		opacity: 0.5;
	}
`

const Editor = styled.div`
	min-width: 70%;
	background-color: white;
`
class UserProfile extends Component {
	state = {
		user: {
			name: '',
			avatar: 'https://fakeimg.pl/250x250/?text=Avatar',
			email: '',
			isLoggedIn: false,
			isAdmin: false,
			id: '',
		},
		projects: undefined,
		guides: '',
		cafes: '',
		findedCity: '',
		findedSign: '>',
		name: '',
		title: 'Rejestracja',
		userPoints: 0
	}
	componentDidMount() {
		firebase.auth().onAuthStateChanged(user => {
			if(user) {
				console.log(user);
				this.setState(prevState => ({
					user: {
						...prevState.user,
						isLoggedIn: true,
						email: user.email
					}
				}))
				if (user.displayName) {
					this.setState(prevState => ({
						user: {
							...prevState.user,
							name: user.displayName
						}
					}))
				}
				if (user.photoURL) {
					this.setState(prevState => ({
						user: {
							...prevState.user,
							avatar: user.photoURL
						}
					}))
				}
				const db = firebase.firestore();
				user.getIdTokenResult().then(idTokenResult => {
					if (idTokenResult.claims.admin) {
						this.setState(prevState => ({
							user: {
								...prevState.user,
								isAdmin: true
							}
						}))
					}
					else {
						this.setState(prevState => ({
							user: {
								...prevState.user,
								isAdmin: false
							}
						}))
					}
					user.admin = idTokenResult.claims.admin
				})
				db.collection('users').doc(user.uid).get().then(doc => {
					if (doc.data()) {
						this.setState(prevState => ({
							user: {
								...prevState.user,
								points: doc.data().points
							}
						}))
					}
				});
				db.collection('projects').doc('test-file').get().then(doc => {
					this.setState({projects: doc.data(), })
					console.log(doc.data());
					console.log(this.state.projects);
					console.log('---');
				});
			}
			else {
				console.log('not logged in');
				this.setState(prevState => ({
					user: {
						...prevState.user,
						isLoggedIn: false,
						isAdmin: false,
						email: ''
					}
				}))
			}
		})
	}
	addAdminCloudFunction = (e) => {
		e.preventDefault();
		const adminEmail = document.getElementById('adminEmail').value;
		const addAdminRole = firebase.functions().httpsCallable('addAdminRole');
		addAdminRole({email: adminEmail}).then(result => {
			console.log(result);
		})
	}
	logIn = () => {
		this.props.history.push(`/login`);
	}
	logOut = () => {
		firebase.auth().signOut();
		this.props.history.push(`/login`);
	}
	editAvatar = () => {
		alert("Edycja zdjęcia")
	}
	render() {
		console.log('this.state.projects');
		console.log(this.state.projects);
		return (
				<Wrapper scroll onClick={this.exit}>
					<LoginElement>
						<LoginTitle>
							{`Witaj ${this.state.user.name}!`}
						</LoginTitle>
						<AddAdmin onSubmit={this.addAdminCloudFunction} className="admin" preview={this.state.user.isAdmin}>
							<input type="email" placeholder="User email" id="adminEmail" required />
							<button>Dodaj uprawnienia</button>
						</AddAdmin>
						<UserContent preview={this.state.user.isLoggedIn}>
							<Avatar>
								<AvatarImage src={this.state.user.avatar} alt="User Image"/>
								<Edit onClick={this.editAvatar} />
							</Avatar>
							<div>Wygrane rundy: </div>
							<div>Doświadczenie: {this.state.user.points} XP</div>
						</UserContent>
						<LogIn onClick={this.logIn} hide={this.state.user.isLoggedIn} />
						<LogOut onClick={this.logOut} preview />
					</LoginElement>
					<Editor>
						{this.state.projects ? 
							(<EditorJs
								data={this.state.projects}
								tools={EDITOR_JS_TOOLS}
							/>) : ''
						}
					</Editor>
				</Wrapper>
		);
	}
}

export default UserProfile;
