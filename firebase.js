// firebase.js
// Put this file in your site root and include it AFTER the Firebase SDK script tags on every page.
// Replace the config values below with your project's web SDK config.

window.__FIREBASE_CONFIG = {
  apiKey: "AIzaSyBLPQtq39tEcha66rw_ovWa5-I3Nl1qyos",
  authDomain: "ghostlet-98357.firebaseapp.com",
  projectId: "ghostlet-98357",
  storageBucket: "ghostlet-98357.firebasestorage.app",
  messagingSenderId: "843012219969",
  appId: "1:843012219969:web:9e3037578726debf2212c0"
};

/*
  Initialization:
  - Pages MUST include the compat SDK scripts first:
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

  - Then include this file:
    <script src="/firebase.js"></script>

  After that you can use Ghostlet.* helpers (see below).
*/

(function initFirebase(){
  if (!window.firebase) {
    console.warn('firebase.js loaded but firebase SDK not found. Make sure you included firebase-app & compat libs before this file.');
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.__FIREBASE_CONFIG);
    }
  } catch (e) {
    // init may fail if already initialized — ignore safely
    console.warn('Firebase init notice:', e);
  }

  // Attach helper API to window.Ghostlet
  window.Ghostlet = {
    auth() { return firebase.auth(); },
    db() { return firebase.firestore(); },
    uid() { return (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null); },

    // Return DocumentReference for users/{uid}
    getUserDocRef(uid){
      if (!uid) uid = this.uid();
      return firebase.firestore().collection('users').doc(uid);
    },

    // Ensure user doc exists (creates default doc if missing)
    async ensureUserDoc(uid, extras = {}){
      if (!uid) uid = this.uid();
      if (!uid) throw new Error('No uid provided to ensureUserDoc');
      const ref = this.getUserDocRef(uid);
      const snap = await ref.get();
      if (!snap.exists) {
        const base = {
          username: "Player",
          email: null,
          tokens: 0,
          blooks: [],
          profilePic: "https://i.ibb.co/0FQG7kF/friendly-ghost.png",
          packsOpened: 0,
          messagesSent: 0,
          badges: []
        };
        await ref.set(Object.assign(base, extras));
      }
      return ref;
    },

    // Simple convenience: read user doc data snapshot
    async getUserData(uid){
      const ref = this.getUserDocRef(uid);
      const snap = await ref.get();
      return snap.exists ? snap.data() : null;
    },

    // Add blook object to user's blooks array and optionally increment packs/tokens
    async addBlookToUser(uid, blookObj, options = { incrementPacks: 1, tokenDelta: 0 }){
      if (!uid) uid = this.uid();
      if (!uid) throw new Error('No uid provided to addBlookToUser');
      const ref = this.getUserDocRef(uid);
      const updates = {};
      updates.blooks = firebase.firestore.FieldValue.arrayUnion(blookObj);
      if (options.incrementPacks) updates.packsOpened = firebase.firestore.FieldValue.increment(options.incrementPacks);
      if (options.tokenDelta) updates.tokens = firebase.firestore.FieldValue.increment(options.tokenDelta);
      return ref.update(updates);
    },

    // Increment arbitrary counter on user doc
    incrementUserField(uid, fieldName, amount = 1){
      if (!uid) uid = this.uid();
      const ref = this.getUserDocRef(uid);
      const u = {}; u[fieldName] = firebase.firestore.FieldValue.increment(amount);
      return ref.update(u);
    }
  };

  console.log('Ghostlet firebase helpers initialized.');
})();
