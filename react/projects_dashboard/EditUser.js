import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux'
import { Popup, Form, Input, Button, Label, Dropdown } from "semantic-ui-react";
import { Redirect } from 'react-router-dom';

import ActionCreators from './action_creators';

const EditUser = ({ match }) => {
  const user = useSelector(state => state.users.find(u =>(match.params.id.localeCompare(u.id) === 0)));
  const roles = useSelector(state => state.roles || []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [redirect, setRedirect] = useState(false);
  const [message, setMessage] = useState(null);


  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setRole(user.role || "user");
    }
  }, [user])

  if (redirect) return <Redirect to="/app/admin/users-panel" />;
  if (!user) return "";

  const handleBack = () => { setRedirect(true) }

  const handleSubmit = () => {
    if(!email || !/^\S+@\S+$/.test(email)) {
      return setMessage("Invalid email");
    }

    ActionCreators.updateUser({
      id: user.id,
      firstName, lastName, username, email, role,
    }, (data) => {
      setRedirect(true);
    }, (error) => {
      setMessage(error.message);
    })
  }

  const handleDelete = () => {
    ActionCreators.deleteUser(user.id, () => { setRedirect(true) })
  }

  return (
    <div className="container dashboard">
      <div className="column wide computer twelve wide tablet sixteen wide mobile">
        <div className="ui segment">
          <Form action={`/admin/users/${user.id}`} method="post">
            <h4 className="ui dividing header">Update User Information</h4>
            <div className="field">
              <label>Email</label>
              <Input type='text' name='firstName' value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>First Name</label>
              <Input type='text' name='firstName' value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Last Name</label>
              <Input type='text' name='lastName' value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Username</label>
              <Input type='text' name='username' value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Role</label>
              <Dropdown
                fluid
                selection
                name='role'
                value={role}
                options={roles.map(r => {
                  return { key: r, value: r, text: r.replace(/\b\w/g, l => l.toUpperCase()) };
                })}
                onChange={(e,{value}) => setRole(value) }
              />
            </div>
            <Button type="button" className="blue" onClick={() => handleSubmit()}>Submit</Button>
            <Popup
              on="click"
              trigger={<a className="ui button outline red">Delete</a>}
              content={
                <>
                  <p>Are you sure?</p>
                  <Button type="button" className="red" onClick={() => handleDelete()}>Delete User</Button>
                </>
              }
            />
            {message && <Label basic color="red">{message}</Label>}
          </Form>
        </div>
        <div className="column left floated">
          <a className="ui link" onClick={() => handleBack()}>{"<< Back"}</a>
        </div>
      </div>
    </div>
  )
}

export default connect((reduxState, props) => {
  return {
    users: reduxState.users
  };
}, null)(EditUser);
