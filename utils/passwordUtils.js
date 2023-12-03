import inquirer from "inquirer";

class PasswordPrompt {
  constructor(validateRule) {
    this.validateRule = validateRule;
  }

  promptInput() {
    return inquirer.prompt([
      {
        type: "text",
        message: "Enter email",
        name: "email",
      },
      {
        type: "password",
        message: "Enter a masked password",
        name: "password",
        mask: "*",
        validate: this.validateRule,
      },
    ]);
  }
}
export default PasswordPrompt;
