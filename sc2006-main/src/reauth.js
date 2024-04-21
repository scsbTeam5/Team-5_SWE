import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

// Function to reauthenticate the user with their current credentials
export const reauthUser = (currentUser, currentPassword) => {

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  return reauthenticateWithCredential(currentUser, credential);

};
