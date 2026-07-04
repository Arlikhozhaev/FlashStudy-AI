export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardCollection {
  name: string;
}

export interface FlashcardDocument extends Flashcard {
  id: string;
}

export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
}

export interface GenerateFlashcardsRequest {
  text: string;
}
