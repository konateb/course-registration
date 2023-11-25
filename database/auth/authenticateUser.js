import fs from "fs";
import bcrypt from "bcrypt";
import readline from "readline";

const authenticateUser = () => {
  const configFile = "passwords.json";

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Demander à l'utilisateur de saisir son email et son mot de passe
  rl.question("Entrez votre email : ", (email) => {
    rl.question("Entrez votre mot de passe : ", (motDePasse) => {
      rl.close();

      // Vérifier si le fichier JSON existe
      if (fs.existsSync(configFile)) {
        const readStream = fs.createReadStream(configFile, "utf8");

        let data = "";

        readStream.on("data", (chunk) => {
          data += chunk;
        });

        readStream.on("end", () => {
          // Vérifier si le fichier JSON existe
          if (data) {
            const configData = JSON.parse(data);

            if (configData[email]) {
              // L'utilisateur existe dans le fichier JSON
              const motDePasseHache = configData[email].password;
              bcrypt.compare(motDePasse, motDePasseHache, (err, result) => {
                if (result) {
                  console.log("Bienvenue, mot de passe correct.");
                } else {
                  console.log("Mot de passe incorrect.");
                }
              });
            } else {
              console.log("Utilisateur non trouvé.");
            }
          } else {
            console.log("Aucun utilisateur enregistré.");
          }
        });
      } else {
        console.log("Le fichier JSON n'existe pas. Création en cours...");
        /////////////////////////////////////////////////

        ///////////////////////////////////////////////////
        // Créer un nouvel objet JSON
        const configData = {
          [email]: {
            email,
            password: createNewUserPassWord(motDePasse), // Vous pouvez gérer l'ajout du mot de passe ici
          },
        };

        // Écrire les données dans un nouveau fichier JSON
        fs.writeFileSync(
          configFile,
          JSON.stringify(configData, null, 2),
          "utf8"
        );
        console.log("Fichier JSON créé.");
      }
    });
  });
};

export { authenticateUser };
function createNewUserPassWord(motDePasse) {
  const saltRounds = 10; // Nombre de "salts" à utiliser pour le hachage

  bcrypt.hash(motDePasse, saltRounds, (err, hash) => {
    if (err) {
      console.error(
        `Erreur lors du hachage du mot de passe pour ${utilisateur}: ${err}`
      );
    } else {
      console.log(`Mot de passe haché pour ${utilisateur}: ${hash}`);
    }
  });
}
