import prompt from "prompt-sync";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, writeFileSync } from "node:fs";
//variable to store filename
const databaseFileName = "database.json";

///////////////////////////////////////////////////
// Program logic
//////////////////////////////////////////////////
// 1) variable appelee dataObjet to store from database
let dataObjet = {};
//2) get data from database and store it in the variable dataObjet
dataObjet = getDataFromDB();
// 3) create un object pour contenir les donnees d'un prof
console.log("=========Enregistrer un Prof ==========");
let nouvoProf = {
  nom: "Bakary",
  prenom: "Konate",
  email: "prof1@gmail.com",
  cours: "chimie",
};
// 3) create course data object
console.log("=========Enregistrer un cours avec les ref d'un prof ==========");

const nouvoCours = {
  titre: "chimie",
  description: "Ce cours est une introduction de la chimie generale",
  prof: "",
  inscrits: [],
};
// eviter de recreer le meme prof
if (!dataObjet.profs.find((c) => c.email === nouvoProf.email)) {
  dataObjet.profs.push(nouvoProf);
}
// eviter de recreer le meme cours
if (!dataObjet.courses.find((c) => c.titre === nouvoCours.titre)) {
  nouvoCours.prof = nouvoProf.email;
  dataObjet.courses.push(nouvoCours);
}

//4) update database
try {
  saveDataToDB();
} catch (error) {
  console.log(error);
}
// 5) create new student
console.log("=========Enregistrer un Etudiant==========");
try {
  //5.1) prompt student email address qui ne doit pas exister deja dans la DB
  const nouvoEmail = promptStudentEmail(dataObjet.etudiants);
  // 5.2) prompt student titre du cours
  const courseTitle = promptChoix(dataObjet.courses);
  // 5.3) creer un objet etudiant
  const etudiant = createStudent(nouvoEmail);
  // 5.4) retrouver le cours
  const course = dataObjet.courses.find((c) => c.titre === courseTitle);
  // 5.5) etablir les relations entre le cours et l'etudiant
  course.inscrits.push(etudiant.email);
  etudiant.courses.push(courseTitle);
  // 5.6) ajouter l'etudiant au tableau des etudiants
  dataObjet.etudiants.push(etudiant);
  //5.7) mettre a jour le fichier json(database.json)
  saveDataToDB();

  ///////////////
} catch (error) {
  //5.5 afficher l'error au terminal s'il y en a
  console.log("the program is terminated pour cause:", error.message);

  //5.6 terminer l'execution du programme pour cause erreur
  process.exit(1);
}
//6) Option: ajouter un cours a la liste de cours d'un etudiant
console.log("=========Ajouter un autre cours==========");
let nouvoEmail = prompt()("Taper etudiant adresse email:");
const etudiant = findStudentByEmail(nouvoEmail);
if (etudiant) {
  const courseTitle = promptChoix(dataObjet.courses);
  ajouterCoursStudent(etudiant, courseTitle);
  saveDataToDB();
} else {
  console.log("Probleme en ajoutant ce cours. Inscrivez-vous d'abord");
}
//////////////////////////////////////////////////////////
//////Functions used //////////////////////////////////////
/////////////////////////////////////////////////////////
// 1) function to create student data object
function createStudent(email) {
  try {
    //demander de tapper le nouveau prenom et nom
    console.log("================================");
    console.log("Entrez les info du nouveau etudiant:");
    const nouvoPrenom = prompt()("son prénom: ");
    const nouvoNom = prompt()("son nom: ");
    //create student data object
    const etudiant = {
      id: uuidv4(),
      nom: nouvoNom,
      prenom: nouvoPrenom,
      email: email,
      courses: [],
    };
    return etudiant;
  } catch (err) {
    console.log(err.message);
  }
}

// 2 ) helper function to prompt student email.
//  It checks if student email exists. Only 3 tries is allowed.
function promptStudentEmail(data) {
  let nouvoEmail = null;
  let count = 0;
  do {
    if (count++ >= 3)
      throw Error(
        "Vous avez essayé à trois reprises, réesayez ultérieurement. "
      );
    // demander de taper l'email de l'etudiant
    nouvoEmail = prompt()("Taper etudiant adresse mail:");
    console.log("Nombre de tentatives de mail = ", count);
  } while (data.find((user) => user?.email === nouvoEmail)); //only false if email not found
  // we need false to break the loop
  console.log("retourne mail = ", nouvoEmail);
  return nouvoEmail;
}

// 3) helper function to check if file exists
//returns true if file exists and false if not
function fileExists(filename) {
  try {
    readFileSync(filename, "utf8");
    return true;
  } catch {
    return false;
  }
}
// 4) function to create new database
function initDatabase() {
  // 4.1)  definir la structure( DB schema ) de la database
  dataObjet.courses = [];
  dataObjet.profs = [];
  dataObjet.etudiants = [];

  //write data to new database(this should be empty)
  saveDataToDB();
}
// 5) helper function to read database file
function loadDatabase() {
  //Node API to read data from database
  const dataBuffer = readFileSync(databaseFileName);
  //deserialise data
  const dataObjet = JSON.parse(dataBuffer);
  //return data deserialised as object.
  return dataObjet;
}

// 6) function to read data from database
//database file does not exist, create it
function getDataFromDB() {
  if (fileExists(databaseFileName)) {
    try {
      //Node API to read data from database
      // const dataBuffer = readFileSync(filename);
      //deserialise data
      // const dataObjet = JSON.parse(dataBuffer);
      return loadDatabase();
    } catch (error) {
      console.error("Error loading data", error);
    }
  } else {
    try {
      initDatabase();
      return loadDatabase();
    } catch (error) {
      console.error("Error initialising database", error);
    }
  }
}
// 7) function to save data to database
function saveDataToDB() {
  //Node API to serialise data
  const jsonData = JSON.stringify(dataObjet, null, 4);
  //Node API to write data to database
  writeFileSync(databaseFileName, jsonData, { flag: "w" }, "utf-8", (err) => {
    if (err) throw err;
    console.log("==== Data save successfully! =====");
  });
}
// 8) function add un cours au studens list in memory
function ajouterCoursStudent(etudiant, titre) {
  // const requetValide = etudiant.courses.length <= 4; // && !etudiant.courses.includes(titre);
  // if (!requetValide) throw Error("Vous ne repondez pas au criteres du choix");
  const courses = dataObjet.courses;
  const choix = courses.find((c) => c.titre === titre);

  if (choix) {
    etudiant.courses.push(titre);
    choix.inscrits.push(etudiant.email);
    // courses.push(choix);
    // dataObjet.etudiants.push(etudiant);
  } else {
    console.log("Error updating student's course");
  }
}
//9) function pour afficher les donnees
function displayData() {
  console.log(JSON.stringify(dataObjet, null, 4));
}

// 10) fonction pour prompt le choix de cours
// return le titre du cours
function promptChoix(data) {
  let choixTitreCours = null;
  let count = 0;
  do {
    if (count++ >= 3)
      throw Error(
        "Vous avez essayé à trois reprises, réesayez ultérieurement. "
      );
    // demander de taper le choix de cours de l'etudiant
    choixTitreCours = prompt()("Taper le choix du cours: ");
    console.log("Nombre de tentatives de choix = ", count);
  } while (!data.find((c) => c?.titre === choixTitreCours)); // we need true to break the loop
  return choixTitreCours;
}

// 11) helper function to check if a student is already in the database
// la fonction returne true si etudiant existe deja, sinon returne false
// only false if email not found
function findStudentByEmail(email) {
  // return un objet student or un objet undefined si l'email n'est pas trouve
  return dataObjet.etudiants.find((user) => user.email === email);
}
