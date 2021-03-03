import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown, Label, Form, Input, Button, Table, Grid, Header } from "semantic-ui-react";
import { Link } from 'react-router-dom';
import ActionCreators from './action_creators';

const UsersPanel = (props) => {
  const [message, setMessage] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState(null);
  const users = useSelector(state => state.users || []);
  const roles = useSelector(state => state.roles || []);

  const inviteUser = () => {
    if(!email || !/^\S+@\S+$/.test(email)) {
      return setMessage("Invalid email");
    }

    if(!role) {
      return setMessage("Select a role.");
    }

    ActionCreators.inviteUser({ username, email, role }, (data)=>{
      setMessage(data.message);
      setEmail("");
    }, (error) => {
      setMessage(error.message);
    })
  }

  const onChangeEmail = (e) => { setEmail(e.target.value) }

  return (
    <div className="fluid-container dashboard">
      <Grid className="container">
        <Grid.Column>
          <div className="ui row" style={{marginBottom: 10 + 'px'}}>
            <Header as='h3'>Invite a User</Header>
          </div>
          <Form  error>
            <div className="ui row" style={{ overflow: "initial" }}>
              <Input
                fluid
                value={email}
                action={
                  <>
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={e=>setUsername(e.target.value)}
                    />
                    <Dropdown
                      button
                      basic
                      floating
                      options={roles.map(r => {
                        return { key: r, value: r, text: r.replace(/\b\w/g, l => l.toUpperCase()) };
                      })}
                      placeholder="Role"
                      value={role}
                      onChange={(e,{value}) => setRole(value)}
                    />
                    <Button
                      className="tag label blue"
                      onClick={() => inviteUser()}
                    >Send Invite Email</Button>
                  </>
                }
                onChange={(e) => onChangeEmail(e)}
                placeholder='user@example.com'
              />
            </div>
            {message && <Label basic color="red">{message}</Label>}
          </Form>
        </Grid.Column>
      </Grid>
      <div className="ui grid centered">
        <div className="column">
          <div className="ui row" style={{marginBottom: 10 + 'px'}}>
            <Header as='h2'>All Users</Header>
          </div>
          <Table className="celled">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Username</Table.HeaderCell>
                <Table.HeaderCell>First name</Table.HeaderCell>
                <Table.HeaderCell>Last name</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell className="center aligned">Status</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {users.map(user => {
                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.username}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.humanizedRole}</td>
                    <td className="center aligned">{user.activated ? "Active" : "Pending"}</td>
                    <td>
                      <Link to={`/admin/users/${user.id}`}>Edit</Link>
                    </td>
                  </tr>
                  )
              })}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default UsersPanel;
