import React, { useState, useRef } from 'react'
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBL0gkyL_9HkkZrTc_fLho3SnRiQc2exHA",
  authDomain: "chatty-4a216.firebaseapp.com",
  projectId: "chatty-4a216",
  storageBucket: "chatty-4a216.appspot.com",
  messagingSenderId: "1073791880150",
  appId: "1:1073791880150:web:453d58b705a2fa2c927277"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  
  const [user] = useAuthState(auth);
  
  return (
    <div className="App">
      <header>
        <h1>Chatty App</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Fazer login com uma conta Google</button>
      <p className='firstInfo'>Suas mensagens e imagem de perfil ficarão visíveis publicamente ao enviar uma mensagem. Evite ser rude e respeite os outros usuários.</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (

    <button className="sign-out" onClick={() => auth.signOut()}>Sair da conta</button>
  )
}

function ChatRoom() {

  const dummy = useRef();

  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      
        <span ref={dummy}></span>
      
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={e => setFormValue(e.target.value)} placeholder='Digite aqui' />
        <button type='submit' disabled={!formValue}>Enviar</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='profile'/>
      <p>{text}</p>
    </div>
  )
}

export default App;
