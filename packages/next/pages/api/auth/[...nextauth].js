import NextAuth from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
	secret: "2f196799-3250-44a5-86ec-8ab9855ea885",
  providers: [
    // // OAuth authentication providers...
    // AppleProvider({
    //   clientId: process.env.APPLE_ID,
    //   clientSecret: process.env.APPLE_SECRET
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_ID,
    //   clientSecret: process.env.FACEBOOK_SECRET
    // }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID,
    //   clientSecret: process.env.GOOGLE_SECRET
    // }),
    // // Passwordless / email sign in
    // EmailProvider({
    //   server: process.env.MAIL_SERVER,
    //   from: 'NextAuth.js <no-reply@example.com>'
    // }),
		CredentialsProvider({
			// The name to display on the sign in form (e.g. "Sign in with...")
			name: "Credentials",
			// The credentials is used to generate a suitable form on the sign in page.
			// You can specify whatever fields you are expecting to be submitted.
			// e.g. domain, username, password, 2FA token, etc.
			// You can pass any HTML attribute to the <input> tag through the object.
			credentials: {
				username: { label: "Username", type: "text", placeholder: "jsmith" },
				password: {  label: "Password", type: "password" }
			},
			async authorize(credentials, req) {
				// Add logic here to look up the user from the credentials supplied
				const user = { id: 1, name: "J Smith", email: "jsmith@example.com" }

				console.log({ credentials, user })
	
				if (user) {
					// Any object returned will be saved in `user` property of the JWT
					return user
				} else {
					// If you return null or false then the credentials will be rejected
					return null
					// You can also Reject this callback with an Error or with a URL:
					// throw new Error("error message") // Redirect to error page
					// throw "/path/to/redirect"        // Redirect to a URL
				}
			}
		})
  ],
	callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl + "/p"
    },
	}
})