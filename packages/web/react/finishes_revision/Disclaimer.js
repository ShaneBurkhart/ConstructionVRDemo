import React, { useState, useEffect } from 'react';
import { Message } from 'semantic-ui-react'

export default function Disclaimer() {
	return (
		<div className="xlarge-container">
			<Message warning>
				<Message.Header>Welcome! This is a project.</Message.Header>
				<p>You can edit anything that you want, this page is reset every night. Others will visit this page so be kind and respectful please. <br /><a style={{ textDecoration: "underline" }} href="https://finishvision.com/sign-up">Click here to signup for a trial.</a></p>
			</Message>
		</div>
	)
}