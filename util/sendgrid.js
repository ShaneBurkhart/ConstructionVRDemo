'use strict';	

const sendgrid = require('@sendgrid/mail');	
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);	

let mailSettings = { };	
let defaultFrom = {	
  email: process.env.TROUBLESHOOT_EMAIL,	
}	

const DEV_MAIL_SETTINGS = {	
  sandbox_mode: { enable: true }	
}	

if (process.env.NODE_ENV == "development") {	
  mailSettings = {	
    ...mailSettings,	
    ...DEV_MAIL_SETTINGS,	
  }	
}	

// HOW TO SEND EMAIL EXAMPLE	
//const sendgrid = require("../util/sendgrid.js");	
//sendgrid.sendEmail({	
  //to: this.email,	
  //templateId: sendgrid.TEMPLATE_IDS.SIGNUP_LINK,	
  //dynamic_template_data: {	
    //signup_link: this.getSignupLink(),	
  //}	
//});	

module.exports = {	
  sendEmail: (msgData) => {	
    msgData.from = {	
      ...defaultFrom,	
      ...(msgData.from || {}),	
    }	
    msgData.mail_settings = {	
      ...(msgData.mail_settings || {}),	
      ...mailSettings,	
    }	

    if (process.env.NODE_ENV === "development") {	
      console.log(">>>>>> SENDING MOCK EMAIL", msgData);	
    }	

    sendgrid.send(msgData).catch(e => console.log(e, e.response.body.errors))	
  },	

  // TEMPLATE_IDS: {	
  //   // WE USE TEMPLATES CONFIGURED IN THE SENDGRID DASHBOARD TO DESIGN EMAILS.	
  //   // REFERENCE THEIR IDs HERE.	
  //   //	
  //   RESET_PASSWORD: "d-b0e740c51a33409eaff794bf3654ce50",	
  //   INVITE: "d-5405f8fbdc054b42824f910b74482db5",	
  // }	
}