import { AuthDB } from "./authodb/users.js";
import readlinePromises from "node:readline/promises";
import PasswordPrompt from "./utils/passwordUtils.js";
import rawlist from "@inquirer/rawlist";
import inquirer from "inquirer";

//regle de validtaion our le mot de passe
const requireLetterAndNumber = (value) => {
  if (/\w/.test(value) && /\d/.test(value)) {
    return true;
  }

  return "un password doit etre compose de lettres et numeros";
};
const passwordPrompt = new PasswordPrompt(requireLetterAndNumber);
const dbFileName = "./authodb/passwords.json";
const auth = new AuthDB(dbFileName);
console.log("**** Menu ****");
console.log("Selectionner un numero et taper ENTER ****");
//the variable prompt is need to the function exit()
const prompt = inquirer.prompt({
  name: "inPrompt",
  type: "input",
});
// Exit the inquirer prompt
// a workround at https://github.com/SBoudrias/Inquirer.js/issues/941
function exit() {
  prompt.ui.close();
}

const answer = await rawlist({
  message: "Votre selection est",
  choices: [
    { name: "Login", value: "login" },
    { name: "Sign up", value: "signup" },
    { name: "Exit", value: "exit" },
  ],
});
switch (answer.trim()) {
  case "login":
    const answersLogin = await passwordPrompt.promptInput();
    await userLogin(answersLogin);
    exit();

    break;
  case "signup":
    const answersSignup = await passwordPrompt.promptInput();
    await userSignUp(answersSignup);

    break;
  case "exit":
    console.log("Au revoir et bonne journee!");
    exit();

  default:
    console.log(`Vous dites quoi? J'ai du entendre '${answer.trim()}'`);
    exit();
    break;
}

////////////////////////////////////

async function userLogin({ email, password }) {
  auth.authenticate(email, password).then((result) => {
    //  result == true si le mot de passe est correcte;
    //  result == undefined si le mot de passe n'est pas correcte
    if (result) {
      console.log("Bienvenue");
    } else {
      console.log("Mot de passe incorrect.");
    }
  });
}

async function userSignUp({ email, password }) {
  auth.addNewUser(email, password);
}

// async function promptInput() {
//   const rl = readlinePromises.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   const email = await rl.question("email? ");
//   const password = await rl.question("password? ");
//   rl.close();
//   return { email, password };
// }
