import { betterAuth } from "better-auth";

export const auth = betterAuth({
    
   database: mongodbAdapter(db, {
    
    client
  }),

  emailAndPassword: { 
    enabled: true, 
  }, 
  socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID , 
      clientSecret: process.env.GITHUB_CLIENT_SECRET, 
    }, 
  }, 
});