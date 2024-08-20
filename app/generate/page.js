'use client'

import { useUser } from "@clerk/nextjs";
import { Box, Button, CardActionArea, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, TextField, Typography } from "@mui/material";
import { writeBatch, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/firebase";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState({});
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({ text }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Parsed Data:', data);
            setFlashcards(data.flashcards || []);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate flashcards. Please try again.');
        }
    };

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name');
            return;
        }

        const batch = writeBatch(db);
        const userDocRef = doc(collection(db, 'users'), user.id);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || [];
            if (collections.find((f) => f.name === name)) {
                alert("Flashcard collection name already exists.");
                return;
            } else {
                collections.push({ name });
                batch.set(userDocRef, { flashcards: collections }, { merge: true });
            }
        } else {
            batch.set(userDocRef, { flashcards: [{ name }] });
        }

        const colRef = collection(userDocRef, name);
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef);
            batch.set(cardDocRef, flashcard);
        });

        await batch.commit();
        handleClose();
        router.push('/flashcards');
    }

    return (
        <Container maxWidth="md">
            <Box sx={{
                mt: 4,
                mb: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Typography variant="h4">Generate Flashcards</Typography>
                <Paper sx={{ p: 4, width: '100%' }}>
                    <TextField
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        label="Enter text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
                            mb: 2,
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        fullWidth
                    >
                        Submit
                    </Button>
                </Paper>
            </Box>

            {flashcards.length > 0 &&
                (<Box sx={{ mt: 4 }}>
                    <Typography variant="h5">Flashcards Preview</Typography>
                    <Grid container spacing={3}>
                        {flashcards.map((flashcard, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <CardActionArea
                                    onClick={() => handleCardClick(index)}
                                >
                                    <CardContent>
                                        <Box sx={{
                                            perspective: '1000px',
                                            '& > div': {
                                                transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                transition: 'transform 0.6s',
                                                transformStyle: 'preserve-3d',
                                                position: 'relative',
                                                width: '100%',
                                                height: '200px',
                                                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                            }
                                        }}>
                                            <div>
                                                <div style={{
                                                    backfaceVisibility: 'hidden',
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    padding: '16px',
                                                }}>
                                                    <Typography variant="h5">{flashcard.front}</Typography>
                                                </div>
                                                <div style={{
                                                    transform: 'rotateY(180deg)',
                                                    backfaceVisibility: 'hidden',
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    padding: '16px',
                                                }}>
                                                    <Typography variant="h5">{flashcard.back}</Typography>
                                                </div>
                                            </div>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button variant='contained' color="secondary" onClick={handleOpen}>
                            Save
                        </Button>
                    </Box>
                </Box>)}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please choose a name for your flashcard collection.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Collection Name"
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={saveFlashcards}>Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
