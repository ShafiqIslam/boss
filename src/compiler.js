const fs = require("fs");
const { exec } = require("child_process");
const { lexer } = require("./lexer");
const { parser } = require("./parser");
const { generator } = require("./generator");

function build(targetCode, filepath) {
  let destFileWithoutExt = filepath.replace(".boss", "");
  let destLLFile = `${destFileWithoutExt}.ll`;
  let destOutFile = `${destFileWithoutExt}.o`;

  fs.writeFileSync(`${destLLFile}`, targetCode);

  exec(`clang -S ${destLLFile}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      console.log(stderr);
    } else {
      console.log(stdout);
    }
  });
  exec(`clang ${destLLFile} -o ${destOutFile}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      console.log(stderr);
    } else {
      console.log(stdout);
    }
  });
}

function main() {
  let filepath = process.argv[2];
  let sourceCode = fs.readFileSync(filepath, "utf8");

  let tokens = lexer(sourceCode);
  //   console.log(tokens);
  //   console.log("============================\n\n");

  let ast = parser(tokens);
  // console.log(ast);
  // console.log("============================\n\n");

  let targetCode = generator(ast);
  //   console.log(targetCode);
  //   console.log("============================\n\n");

  build(targetCode, filepath);
}

main();
