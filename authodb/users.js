import fs from "fs";
import bcrypt from "bcrypt";

class AuthDB {
  constructor(filename, saltRounds = 10) {
    this.saltRounds = saltRounds;
    this.filename = filename;
    this.data = {};
    this.loadData();
  }

  // Sauvegarder les données dans le fichier JSON
  saveData() {
    fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2), "utf8");
  }

  //ajouter un nouvo  user
  addNewUser(email, motDePasse) {
    bcrypt.hash(motDePasse, this.saltRounds, (err, hash) => {
      if (err) {
        console.error(`Erreur lors du hachage du mot de passe : ${err}`);
      } else {
        // Créer un nouvel objet et l'ajouter data
        this.data[email] = {
          email: email,
          motDePasse: hash,
        };

        // Sauvegarder les données dans le fichier passwords.json
        this.saveData();
        console.log("Nouvel utilisateur ajouté avec succès.");
      }
    });
  }
  // Charger les données depuis le fichier JSON passwords.json
  loadData = () => {
    // Vérifier si le fichier JSON existe
    if (fs.existsSync(this.filename)) {
      const readStream = fs.createReadStream(this.filename, "utf8");

      // definir une variable pour revoir les donnes en memoire
      let data = "";

      readStream.on("data", (chunk) => {
        data += chunk;
      });

      readStream.on("end", () => {
        this.data = JSON.parse(data);
      });
    } else {
      // creer un nouveau fichier JSON et Écrire les données dans ce fichier JSON
      fs.writeFileSync(
        this.filename,
        JSON.stringify(this.data, null, 2),
        "utf8"
      );
      console.log("Fichier JSON créé.");
    }
  };

  async authenticate(email, motDePasse) {
    if (this.data[email]) {
      // L'utilisateur existe dans le fichier JSON
      const motDePasseHache = this.data[email].motDePasse;
      const result = await bcrypt.compare(motDePasse, motDePasseHache);
      return result;
    }
  }
}

export { AuthDB };
