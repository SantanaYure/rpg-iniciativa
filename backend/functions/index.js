const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserProfile = functions.auth.user.onCreate(async (user) => {
  const userProfileRef = admin.firestore()
      .collection("users")
      .doc(user.uid);
  try {
    await userProfileRef.set({
      email: user.email,
      displayName: user.displayName || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lgpdConsent: {
        termsAccepted: false,
        consentTimestamp: null,
      },
    });
    console.log(`Perfil criado com sucesso para: ${user.uid}`);
  } catch (error) {
    console.error(`Erro ao criar perfil para ${user.uid}:`, error);
  }
});