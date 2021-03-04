import React from 'react';
import { Dropdown } from 'semantic-ui-react';

import styles from "./Header.module.css";

const Header = (props) => {
  // const IS_ANONYMOUS = !IS_SUPER_ADMIN && !IS_REPORTS_ADMIN && !IS_DEALER && !IS_SUPER_DEALER;
  const allNavLinkInfo = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      navPosition: 'left',
      permission: true,
    },
    {
      name: 'Users',
      href: '/app/admin/users-panel',
      navPosition: 'left',
      permission: true,
    },
    {
      name: 'Admin',
      href: '/app/admin',
      navPosition: 'right',
      permission: true,
    },
    {
      name: window.hasOwnProperty("USERNAME") ? USERNAME : 'Account',
      href: '/app/account',
      navPosition: 'right',
      permission: true,
    },
    {
      name: <><i className="sign out icon" /> Logout</>,
      href: '/app/logout',
      navPosition: 'right',
      permission: true,
    },
    {
      name: 'Sign In',
      href: '/',
      navPosition: 'right',
      permission: true,
    },
  ];

  const navLinks = position => {
    if (position) return allNavLinkInfo.filter(({ permission, navPosition }) => permission && navPosition === position);
    return allNavLinkInfo.filter(({ permission }) => permission);
  }

  return (
    <div className={styles.siteHeader}>
      <div className="fluid-container">
        <div className={styles.leftNav}>
          <a className={styles.tall} href="/" title="main dashboard">
            <img
              className="logo"
              style={{ maxWidth: 165, objectFit: "contain" }}
              alt="Logo"
              src="/logo.png"
            />
          </a>
        </div>
        <div className={`${styles.mainNav} ${styles.hideMobile}`}>
          {navLinks('left').map(({ name, href }) => (
            <a key={name} href={href} title={name}>{name}</a>
          ))}
        </div>
        <div className={`${styles.rightNav} ${styles.hideMobile}`}>
          {navLinks('right').map(({ name, href }) => (
            <a key={name} href={href} title={name}>{name}</a>
          ))}
        </div>
        <div className={styles.navbarToggler}>
          <Dropdown icon="bars" direction="left" scrolling>
            <Dropdown.Menu style={{ maxHeight: '90vh'}}>
              {navLinks(null).map(({ name, href }) => (
                <Dropdown.Item key={name}><a href={href} title={name}>{name}</a></Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export default Header;
