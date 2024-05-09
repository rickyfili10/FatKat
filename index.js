const readline = require('readline');
const AST = require("abstract-syntax-tree");
const Fs = require("fs");

// Define print function
function print(...args) {
    console.log(...args);
}
function cerr(...args) {
    console.error(...args);
}
// Function to read data from a file
function readFile(filePath) {
    try {
        const data = Fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (error) {
        console.error(`Error reading from ${filePath}:`, error);
        return null;
    }
}

function writeFile(filePath, data) {
    Fs.writeFileSync(filePath, data);
}
function translateFkatToJavascript() {
    try {
        // Legge il contenuto del file .fkat
        const filePath = "file.fkat";
        const fileData = Fs.readFileSync(filePath, 'utf8');

        // Applica le trasformazioni al codice .fkat
        let translatedCode = fileData.replace(/cvar/g, "const");
        translatedCode = translatedCode.replace(/stop/g, "break");
        translatedCode = translatedCode.replace(/import\s+(\w+)/g, 'const $1 = require("$1");');
        translatedCode = translatedCode.replace(/True/g, "true");
        translatedCode = translatedCode.replace(/False/g, "false");
        translatedCode = translatedCode.replace(/Null/g, "null");
        translatedCode = translatedCode.replace(/undef/g, "undefined");
        translatedCode = translatedCode.replace(/undefined/g, "undefined");
        translatedCode = translatedCode.replace(/Undefined/g, "undefined");
        translatedCode = translatedCode.replace(/(?<!")func(?=\s)/g, "function");
        translatedCode = translatedCode.replace(/then\s*\(\s*\((\w+)\)\s*\{/g, ".then (function($1) {");
        translatedCode = translatedCode.replace(/catch\s*\(\s*\((\w+)\)\s*\{/g, ".catch (function($1) {");
        translatedCode = translatedCode.replace(/print/g, "console.log");
        translatedCode = translatedCode.replace(/cerr/g, "console.error");

        // Scrive il codice JavaScript equivalente nel file .fkat
        Fs.writeFileSync("transcript/tfk.js", translatedCode, 'utf8');

    } catch (error) {
        console.error(`Error while translating:`, error);
    }
}

function readWriteFile(filePath, newData) {
    try {
        // Read existing data from the file
        let existingData = '';
        if (Fs.existsSync(filePath)) {
            existingData = Fs.readFileSync(filePath, 'utf8');
        }

        // Combine existing data with new data
        const combinedData = existingData + '\n' + newData;

        // Write combined data back to the file
        Fs.writeFileSync(filePath, combinedData);
        console.log(`Data has been appended to ${filePath}`);

        // Read data from the file after writing
        const file_data = readFile(filePath);
        if (file_data !== null) {
            console.log(`Data read from ${filePath} after writing:`);
            console.log(file_data);
        } else {
            console.log(`Failed to read data from ${filePath} after writing.`);
        }

        // Return the combined data
        return combinedData;
    } catch (error) {
        console.error(`Error reading from or writing to ${filePath}:`, error);
        return null;
    }
}

// Definizione della funzione input
function input(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(function(resolve) {
        rl.question(prompt, function(answer) {
            rl.close();
            resolve(answer);
        });
    });
}

// Esempio di utilizzo della funzione input

// Variables
const Self_Args = process.argv.slice(2);

// Main
if (Self_Args.length == 0) {
    console.log(`node index.js <fkat_file>
Example: node index.js index.fkat`);
    process.exit();
}

if (Self_Args[0].indexOf("fkat") != -1) {
    var file_data = Fs.readFileSync(Self_Args[0], "utf8");

    file_data = file_data.replace(/cvar/g, "const");
    file_data = file_data.replace(/stop/g, "break");

    // Replace 'import libname' with 'const libname = require("libname")'
    file_data = file_data.replace(/import\s+(\w+)/g, 'const $1 = require("$1");');
    file_data = file_data.replace(/True/g, "true");
    file_data = file_data.replace(/False/g, "false");
    file_data = file_data.replace(/Null/g, "null");
    file_data = file_data.replace(/undef/g, "undefined");
    file_data = file_data.replace(/undefined/g, "undefined");
    file_data = file_data.replace(/Undefined/g, "undefined");
    file_data = file_data.replace(/(?<!")func(?=\s)/g, "function");
    file_data = file_data.replace(/then\s*\(\s*\((\w+)\)\s*\{/g, ".then (function($1) {");
    file_data = file_data.replace(/catch\s*\(\s*\((\w+)\)\s*\{/g, ".catch (function($1) {");

    

    const file_data_codes = Fs.readFileSync(Self_Args[0], "utf8").split("\n");
    const file_data_tree = AST.parse(file_data);

    AST.replace(file_data_tree, function(node) {
        if (node.type === "ObjectExpression") {
            node.start += 1;
            node.end -= 1;
        } else if (node.type === "MemberExpression" && node.property.name === "print") {
            node.property.name = "log";
        } else if (node.type === "MemberExpression" && node.property.name === "cerr") {
            node.property.name = "error";
        } else if (node.type === "MemberExpression" && node.property.name === "input") {
            node.property.name = "input";
        } 

        return node;
    });

    eval(AST.generate(file_data_tree));
    translateFkatToJavascript();
} else {
    console.log("Invalid filetype, make sure the file extension is fkat.");
    process.exit();
}
