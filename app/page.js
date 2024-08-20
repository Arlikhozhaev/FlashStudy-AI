'use client'

import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useUser } from '@clerk/nextjs';
import { POST } from "./api/generate/route";
import { AppBar, Button, Box, Container, Icon, Grid, Toolbar, Typography } from "@mui/material";
import Head from 'next/head'

export default function Home() {
  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: {
        origin: 'http;//localhost:3000',
      },
    })

    const checkoutSessionJson = await checkoutSession.json()

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message)
      return
    }

    const stripe = await getStripe()
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })

    if (error) {
      console.warn(error.message)
    }
  }

  const { isLoaded, isSignedIn } = useUser();
  const redirectLink = isSignedIn ? "/generate" : "/sign-in";

  return (
    <Container maxWidth="lg">
      <Head>
        <title>Flashcard SaaS</title>
        <meta name="description" content="Create flashcard from your text" />
      </Head>

      <AppBar position="static" sx={{ p: { xs: 1, sm: 2 } }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Flashcard SaaS</Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>Login</Button>
            <Button color="inherit" href="/sign-up" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>


      <Box
        sx={{
          textAlign: 'center',
          my: { xs: 4, sm: 5, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4, md: 5 },
          backgroundColor: '#f4f6f8',
          borderRadius: 4,
          boxShadow: 4
        }}
      >
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#3b3b3b',
            mb: { xs: 1, sm: 2, md: 3 },
            fontSize: {
              xs: '1.5rem',
              sm: '2rem',
              md: '2.5rem',
              lg: '3rem',
            },
            textAlign: 'center'
          }}
        >
          Welcome to Flashcard SaaS
        </Typography>

        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: { xs: 2, sm: 3, md: 4 },
            color: '#555',
            fontSize: {
              xs: '1rem',
              sm: '1.25rem',
              md: '1.5rem',
              lg: '1.75rem',
            },
          }}
        >
          Effortlessly transform your text into flashcards and elevate your learning experience.
        </Typography>

        <Button
          variant='contained'
          color='primary'
          href={redirectLink}  
          sx={{
            mt: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, sm: 2, md: 2 },
            fontSize: { xs: '14px', sm: '16px', md: '16px' },
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#1e88e5',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            },
          }}
        >
          Get Started
        </Button>
      </Box>


      <Box sx={{ my: 8, backgroundColor: '#f9f9f9', py: 6, borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom component="h2" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#1e88e5' }}>
          Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#fff', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Text Input</Typography>
              <Typography>Simply input your text, and let our software handle the rest. Crafting flashcards has never been this effortless!</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#fff', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Smart Flashcards</Typography>
              <Typography>Leverage our AI to transform your text into precise, actionable flashcards, making your study sessions more productive and effective.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#fff', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Accessible Anywhere</Typography>
              <Typography>Access your flashcards anytime, anywhere. Enjoy unmatched flexibility and convenience in your learning journey!</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#1e88e5' }}>Pricing</Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#fff', border: '2px solid', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Basic</Typography>
              <Typography variant="h6" gutterBottom>4.99$ / month</Typography>
              <Typography sx={{ mb: 2 }}>✔ Create up to 100 flashcards per month</Typography>
              <Typography sx={{ mb: 2 }}>✔ Access on any device</Typography>
              <Typography sx={{ mb: 2 }}>✔ Basic customer support</Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>Choose Plan</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#fff', border: '2px solid', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Standard</Typography>
              <Typography variant="h6" gutterBottom>7.99$ / month</Typography>
              <Typography sx={{ mb: 2 }}>✔ Unlimited flashcards and storage</Typography>
              <Typography sx={{ mb: 2 }}>✔ Advanced analytics and tracking</Typography>
              <Typography sx={{ mb: 2 }}>✔ Priority customer support</Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>Choose Plan</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#fff', border: '2px solid', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>Premium</Typography>
              <Typography variant="h6" gutterBottom>9.99$ / month</Typography>
              <Typography sx={{ mb: 2 }}>✔ Unlimited flashcards and storage</Typography>
              <Typography sx={{ mb: 2 }}>✔ Advanced customization options</Typography>
              <Typography sx={{ mb: 2 }}>✔ 24/7 premium support</Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>Choose Plan</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}
