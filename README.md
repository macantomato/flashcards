# flashcards
Flashcard maker for studying

#1
Flashcards can be used locally and directly by using localhost. The sets are saved inside local storage, by using the key 'flashcards_1' as a JSON string. Thus, when finishing a session, it will be saved onto local storage data, but this data is limited to 5-10mb of data. Practice progression is only stored in an instance variable, so progression won't be saved on local storage, only whole sets. 

#2 
To remove the current instance of 'flashcards_1' or "clear" the saved sets, you can do the following prompt. localStorage.removeItem('flashcards_1'). 
